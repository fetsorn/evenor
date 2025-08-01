#![allow(warnings)]
mod db;
mod error;
mod git;
mod lfs;
mod mind;
mod zip;

pub use error::{Error, Result};
pub use mind::Mind;
use tauri::Manager;

pub fn log<R: tauri::Runtime>(app: &tauri::AppHandle<R>, message: &str) -> Result<()> {
    let webview = app.get_webview_window("main").unwrap();

    let code = format!("console.log('{message}')");
    
    webview.eval(code)?;
    
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> Result<String> {
    log::info!("Tauri is awesome!");

    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

//mobile entry point must have 0 arguments
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    create_app(tauri::Builder::default().setup(|app| {
            log(&app.handle(), "hello from Rust");

            let data_dir = app.path().app_data_dir().expect("App Data Directory is required to run this application.");
            
            log(&app.handle(), data_dir.clone().into_os_string().to_str().unwrap());
            
            if !data_dir.exists() {
                log(&app.handle(), "does not exist");
                
                match std::fs::create_dir_all(&data_dir) {
                  Ok(_) => (),
                  Err(e) => log(&app.handle(), &e.to_string())?
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
        .invoke_handler(tauri::generate_handler![
            greet,
            db::select,
            db::select_stream,
            db::update_record,
            db::delete_record,
            git::init,
            git::commit,
            git::clone,
            git::push,
            git::pull,
            git::set_origin,
            git::get_origin,
            lfs::create_lfs,
            lfs::fetch_asset,
            lfs::download_asset,
            lfs::put_asset,
            lfs::upload_file,
            lfs::upload_blobs_lfs,
            lfs::set_asset_path,
            lfs::get_asset_path,
            lfs::download_url_from_pointer,
            zip::zip,
        ])
        .build(tauri::generate_context!())
        .expect("error while running the application")
}
