use crate::{dataset::{Dataset, SelectEvent, CSVS}, error::Result};
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub fn create_lfs<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn fetch_asset<R>(app: AppHandle<R>, uuid: &str, filename: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn put_asset<R>(app: AppHandle<R>, uuid: &str, filename: &str, buffer: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn upload_file<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn upload_blobs_lfs<R>(app: AppHandle<R>, uuid: &str, url: &str, token: &str, files: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn download_asset<R>(
    app: AppHandle<R>,
    uuid: &str,
    content: &str,
    filename: &str,
) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn download_url_from_pointer<R>(
    app: AppHandle<R>,
    uuid: &str,
    url: &str,
    token: &str,
    pointer_info: &str,
) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn set_asset_path<R>(app: AppHandle<R>, uuid: &str, asset_path: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn get_asset_path<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}
