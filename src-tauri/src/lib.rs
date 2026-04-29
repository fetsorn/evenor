mod db;
mod error;
mod fs;
mod io;

pub use error::{Error, Result};
use tauri::Manager;

// TODO no webview found after 2.7->2.9
pub fn log<R: tauri::Runtime>(app: &tauri::AppHandle<R>, message: &str) -> Result<()> {
    //#[cfg(dev)]
    //{
    //    println!("Message from Rust: {}", message);
    //}

    log::info!("Message from Rust: {}", message);

    if !cfg!(test) {
        let webview = app.get_webview_window("main").unwrap();

        // SEC-01: escape message to prevent JS injection via eval()
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

#[tauri::command]
fn greet(name: &str) -> Result<String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

//mobile entry point must have 0 arguments
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
        .invoke_handler(tauri::generate_handler![
            greet,
            db::select,
            db::select_stream,
            db::update_record,
            db::delete_record,
            db::build_record,
            db::csvsinit,
            io::gitinit,
            io::commit,
            io::clone,
            io::resolve,
            io::rename,
            io::set_origin,
            io::get_origin,
            io::create_lfs,
            io::fetch_asset,
            io::download_asset,
            io::put_asset,
            io::upload_file,
            io::upload_blobs_lfs,
            io::set_asset_path,
            io::get_asset_path,
            io::download_url_from_pointer,
            io::zip,
        ])
        .build(tauri::generate_context!())
        .expect("error while running the application")
}
