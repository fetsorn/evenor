use csvs::{Entry, IntoValue};
use futures_util::StreamExt;
use mindzoo::{Kind, Mindzoo};
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::path::PathBuf;
use std::pin::Pin;
use tauri::{AppHandle, Manager, Runtime, State};
use tokio::sync::Mutex;

mod error;
pub use error::{Error, Result};

pub fn get_app_data_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf> {
    let data_dir: State<PathBuf> = app.state();
    Ok(data_dir.inner().clone())
}

pub fn mylog<R: tauri::Runtime>(app: &tauri::AppHandle<R>, message: &str) -> Result<()> {
    log::info!("Message from Rust: {}", message);

    if !cfg!(test) {
        let webview = app.get_webview_window("main").unwrap();

        let escaped = message
            .replace('\\', "\\\\")
            .replace('\'', "\\'")
            .replace('\n', "\\n")
            .replace('\r', "\\r");

        let code = format!("console.log('Message from Rust: {escaped}')");

        webview.eval(code)?;
    }

    Ok(())
}

#[derive(Debug, Clone, Serialize)]
pub struct SelectNext {
    pub done: bool,
    pub value: Option<Value>,
}

type StreamBox = Pin<Box<dyn futures_core::stream::Stream<Item = mindzoo::Result<Entry>> + Send>>;

/// Holds the Mindzoo instance and named streams keyed by client-assigned ID.
pub struct ZooState {
    pub zoo: Mutex<Option<Mindzoo>>,
    pub streams: Mutex<HashMap<String, StreamBox>>,
}

#[tauri::command]
async fn sparql<R: Runtime>(
    app: AppHandle<R>,
    kind: &str,
    graph: &str,
    query: Value,
    stream_id: String,
) -> Result<SelectNext> {
    log::info!("evenor::sparql kind={kind} graph={graph} stream_id={stream_id}");

    let dir = get_app_data_dir(&app)?.join("store");

    if !dir.exists() {
        std::fs::create_dir_all(&dir)?;
    }

    let zoo_state: State<'_, ZooState> = app.state();

    // Create stream if this is the first pull for this stream_id
    {
        let streams = zoo_state.streams.lock().await;
        if !streams.contains_key(&stream_id) {
            drop(streams); // release before locking zoo

            log::info!("evenor::sparql creating stream {stream_id}");
            let kind: Kind = kind.parse().map_err(Error::from)?;
            let entry: Entry = query.try_into().map_err(|e: csvs::Error| Error::from_message(e.to_string()))?;

            let mut zoo_guard = zoo_state.zoo.lock().await;
            if zoo_guard.is_none() {
                log::info!("evenor::sparql creating mindzoo");
                let zoo = Mindzoo::new(dir).await.map_err(Error::from)?;
                *zoo_guard = Some(zoo);
            }
            let zoo = zoo_guard.as_ref().unwrap();

            let stream = zoo.sparql(kind, graph, entry).await.map_err(Error::from)?;

            zoo_state.streams.lock().await.insert(stream_id.clone(), stream);
        }
    }

    // Pull next item
    let mut streams = zoo_state.streams.lock().await;
    let stream = streams.get_mut(&stream_id)
        .ok_or_else(|| Error::from_message(format!("stream not found: {stream_id}")))?;

    match stream.as_mut().next().await {
        Some(Ok(entry)) => {
            log::info!("evenor::sparql yielded entry");
            Ok(SelectNext {
                done: false,
                value: Some(entry.into_value()),
            })
        }
        Some(Err(e)) => {
            log::error!("evenor::sparql stream error: {e}");
            streams.remove(&stream_id);
            Err(Error::from(e))
        }
        None => {
            log::info!("evenor::sparql stream done id={stream_id}");
            streams.remove(&stream_id);
            Ok(SelectNext {
                done: true,
                value: None,
            })
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    create_app(tauri::Builder::default().setup(|app| {
        let a = app.handle();

        mylog(&a, "hello from Rust")?;

        let data_dir = app
            .path()
            .app_data_dir()
            .expect("App Data Directory is required to run this application.");

        mylog(
            &app.handle(),
            data_dir.clone().into_os_string().to_str().unwrap(),
        )?;

        if !data_dir.exists() {
            mylog(&app.handle(), "does not exist")?;

            match std::fs::create_dir_all(&data_dir) {
                Ok(_) => (),
                Err(e) => mylog(&app.handle(), &e.to_string())?,
            };
        }

        app.manage(data_dir);

        Ok(())
    }))
    .run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}

pub fn create_app<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::App<R> {
    builder
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .manage(ZooState {
            zoo: Mutex::new(None),
            streams: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![sparql])
        .build(tauri::generate_context!())
        .expect("error while running the application")
}
