use tauri::AppHandle;
use crate::error::{Error, Result};

#[tauri::command]
pub async fn create_lfs() {}

#[tauri::command]
pub async fn fetch_asset(app: AppHandle, uuid: &str, filename: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn put_asset(app: AppHandle, uuid: &str, filename: &str, buffer: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn upload_file(app: AppHandle, uuid: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn upload_blobs_lfs(app: AppHandle, uuid: &str, remote: &str, files: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn download_asset(app: AppHandle, uuid: &str, content: &str, filename: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn download_url_from_pointer(
    app: AppHandle,
    uuid: &str,
    url: &str,
    token: &str,
    pointer_info: &str,
) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn add_asset_path(app: AppHandle, uuid: &str, asset_path: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
pub async fn list_asset_paths(app: AppHandle, uuid: &str) -> Result<()> {
    Ok(())
}
