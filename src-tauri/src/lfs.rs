use tauri::AppHandle;
use crate::error::{Error, Result};

#[tauri::command]
pub async fn create_lfs() {}

#[tauri::command]
pub async fn fetch_asset<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str, filename: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn put_asset<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str, filename: &str, buffer: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn upload_file<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn upload_blobs_lfs<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str, remote: &str, files: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn download_asset<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str, content: &str, filename: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn download_url_from_pointer<R: tauri::Runtime>(
    app: AppHandle<R>,
    uuid: &str,
    url: &str,
    token: &str,
    pointer_info: &str,
) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn add_asset_path<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str, asset_path: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn list_asset_paths<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str) -> Result<()> {
    Ok(())
}
