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

//mobile entry point must have 0 arguments
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    create_app(tauri::Builder::default().setup(|app| {
             let window = app.get_webview_window("main").unwrap();
             window.open_devtools();
             Ok(())
           })).run(|_app_handle, event| match event {
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
