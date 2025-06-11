#![allow(warnings)]
mod csvs;
mod error;
mod git;
mod io;
mod lfs;
mod repository;
mod test;
mod zip;
use crate::csvs::{delete_record, select, select_stream, update_record};
pub use crate::error::{Error, Result};
use crate::git::{add_remote, clone, commit, create_repo, get_remote, list_remotes, pull, push};
use crate::lfs::{
    add_asset_path, create_lfs, download_asset, download_url_from_pointer, fetch_asset,
    list_asset_paths, put_asset, upload_blobs_lfs, upload_file,
};
use crate::zip::zip;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn create_app<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::App<R> {
    builder
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_repo,
            create_lfs,
            commit,
            select,
            select_stream,
            update_record,
            delete_record,
            clone,
            push,
            pull,
            zip,
            list_remotes,
            add_remote,
            get_remote,
            fetch_asset,
            download_asset,
            put_asset,
            upload_file,
            upload_blobs_lfs,
            add_asset_path,
            list_asset_paths,
            download_url_from_pointer
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
}
