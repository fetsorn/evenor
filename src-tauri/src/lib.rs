use csvs::{Entry, IntoValue};
use futures_util::StreamExt;
use mindzoo::{Kind, Mindzoo};
use serde::Serialize;
use serde_json::Value;
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

pub fn log<R: tauri::Runtime>(app: &tauri::AppHandle<R>, message: &str) -> Result<()> {
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

/// Holds the active stream between repeated IPC calls.
pub struct StreamState {
    pub stream:
        Mutex<Option<Pin<Box<dyn futures_core::stream::Stream<Item = mindzoo::Result<Entry>> + Send>>>>,
}

#[tauri::command]
async fn sparql<R: Runtime>(
    app: AppHandle<R>,
    kind: &str,
    graph: &str,
    query: Value,
) -> Result<SelectNext> {
    let dir = get_app_data_dir(&app)?;

    let stream_state: State<'_, StreamState> = app.state();

    let mut guard = stream_state.stream.lock().await;

    // If no active stream, start a new one
    if guard.is_none() {
        let kind: Kind = kind.parse().map_err(Error::from)?;
        let entry: Entry = query.try_into().map_err(|e: csvs::Error| Error::from_message(e.to_string()))?;

        let zoo = Mindzoo::new(dir).await.map_err(Error::from)?;
        let stream = zoo.sparql(kind, graph, entry).await.map_err(Error::from)?;

        *guard = Some(stream);
    }

    // Pull next item from the stream
    let stream = guard.as_mut().unwrap();

    match stream.as_mut().next().await {
        Some(Ok(entry)) => Ok(SelectNext {
            done: false,
            value: Some(entry.into_value()),
        }),
        Some(Err(e)) => {
            // Stream errored — close it and return error
            *guard = None;
            Err(Error::from(e))
        }
        None => {
            // Stream ended
            *guard = None;
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

        let _ = log(&a, "hello from Rust");

        let data_dir = app
            .path()
            .app_data_dir()
            .expect("App Data Directory is required to run this application.");

        let _ = log(
            &app.handle(),
            data_dir.clone().into_os_string().to_str().unwrap(),
        );

        if !data_dir.exists() {
            let _ = log(&app.handle(), "does not exist");

            match std::fs::create_dir_all(&data_dir) {
                Ok(_) => (),
                Err(e) => log(&app.handle(), &e.to_string())?,
            };
        }

        app.manage(data_dir);

        app.manage(StreamState {
            stream: Mutex::new(None),
        });

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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![sparql])
        .build(tauri::generate_context!())
        .expect("error while running the application")
}
