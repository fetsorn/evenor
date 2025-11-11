use crate::Result;
use git2kit::Origin;
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub fn create_lfs<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn fetch_asset<R>(app: AppHandle<R>, mind: &str, filename: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn put_asset<R>(app: AppHandle<R>, mind: &str, filename: &str, buffer: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn upload_file<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn upload_blobs_lfs<R>(
    app: AppHandle<R>,
    mind: &str,
    remote: Origin,
    files: &str,
) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn download_asset<R>(
    app: AppHandle<R>,
    mind: &str,
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
    mind: &str,
    remote: Origin,
    pointer_info: &str,
) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn set_asset_path<R>(app: AppHandle<R>, mind: &str, asset_path: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
pub async fn get_asset_path<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}
