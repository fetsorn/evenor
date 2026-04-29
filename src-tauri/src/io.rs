use crate::Result;
use crate::fs::get_app_data_dir;
use mindzoo::{Origin, Resolve};
use tauri::{AppHandle, Runtime};

#[tauri::command]
pub async fn gitinit<R: Runtime>(app: AppHandle<R>, mind: &str, name: Option<&str>) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::gitinit(path, mind, name).await?)
}

#[tauri::command]
pub fn commit<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::commit(path, mind)?)
}

#[tauri::command]
pub async fn clone<R: Runtime>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::clone(path, mind, remote).await?)
}

#[tauri::command]
pub async fn resolve<R: Runtime>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<Resolve> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::resolve(path, mind, remote).await?)
}

#[tauri::command]
pub async fn rename<R: Runtime>(app: AppHandle<R>, mind: &str, name: &str) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::rename(path, mind, name).await?)
}

#[tauri::command]
pub async fn set_origin<R: Runtime>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::set_origin(path, mind, remote).await?)
}

#[tauri::command]
pub async fn get_origin<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<Option<Origin>> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::get_origin(path, mind).await?)
}

#[tauri::command]
pub fn create_lfs<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::create_lfs(path, mind)?)
}

#[tauri::command]
pub async fn fetch_asset<R: Runtime>(app: AppHandle<R>, mind: &str, filename: &str) -> Result<Vec<u8>> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::fetch_asset(path, mind, filename).await?)
}

#[tauri::command]
pub async fn download_asset<R: Runtime>(_app: AppHandle<R>, mind: &str, content: Vec<u8>, filename: &str) -> Result<()> {
    Ok(mindzoo::download_asset(mind, content, filename).await?)
}

#[tauri::command]
pub async fn put_asset<R: Runtime>(app: AppHandle<R>, mind: &str, filename: &str, buffer: Vec<u8>) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::put_asset(path, mind, filename, buffer).await?)
}

#[tauri::command]
pub async fn upload_file<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<Vec<serde_json::Value>> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::upload_file(path, mind).await?)
}

#[tauri::command]
pub async fn upload_blobs_lfs<R: Runtime>(_app: AppHandle<R>, mind: &str, remote: Origin, files: &str) -> Result<()> {
    Ok(mindzoo::upload_blobs_lfs(mind, remote, files).await?)
}

#[tauri::command]
pub async fn set_asset_path<R: Runtime>(app: AppHandle<R>, mind: &str, asset_path: &str) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::set_asset_path(path, mind, asset_path).await?)
}

#[tauri::command]
pub async fn get_asset_path<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<Option<String>> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::get_asset_path(path, mind).await?)
}

#[tauri::command]
pub async fn download_url_from_pointer<R: Runtime>(_app: AppHandle<R>, mind: &str, remote: Origin, pointer_info: &str) -> Result<Option<String>> {
    Ok(mindzoo::download_url_from_pointer(mind, remote, pointer_info).await?)
}

#[tauri::command]
pub async fn zip<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<()> {
    let path = get_app_data_dir(app)?;

    Ok(mindzoo::zip(path, mind).await?)
}
