#![allow(warnings)]
mod api;
use crate::api::{Git, Remote, Result, SelectEvent, Zip, API, CSVS};
use serde_json::Value;
use tauri::{generate_context, generate_handler, ipc::Channel, App, AppHandle, Builder, Runtime};

#[tauri::command]
async fn select<R> (
    app: AppHandle<R>,
    uuid: &str,
    query: Value,
) -> Result<Vec<Value>> where R: Runtime, {
    let api = API::new(app, uuid);

    let records = api.select(query).await?;

    Ok(records)
}

#[tauri::command]
async fn select_stream<R>(
    app: AppHandle<R>,
    uuid: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    api.select_stream(query, on_event).await?;

    Ok(())
}

#[tauri::command]
async fn update_record<R>(
    app: AppHandle<R>,
    uuid: &str,
    record: Value,
) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    api.update_record(record).await?;

    Ok(())
}

#[tauri::command]
async fn delete_record<R>(
    app: AppHandle<R>,
    uuid: &str,
    record: Value,
) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    api.delete_record(record).await?;

    Ok(())
}

#[tauri::command]
async fn create_repo<R>(
    app: AppHandle<R>,
    uuid: &str,
    name: Option<&str>,
) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    api.create_repo(name).await?;

    Ok(())
}

#[tauri::command]
async fn clone<R>(
    app: AppHandle<R>,
    uuid: &str,
    name: Option<String>,
    remote_url: &str,
    remote_token: &str,
) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    let remote = Remote::new(Some(remote_url), Some(remote_token), None);

    api.clone(name, &remote).await?;

    Ok(())
}

#[tauri::command]
async fn pull<R>(app: AppHandle<R>, uuid: &str, remote: &str) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    let remote = Remote::new(None, None, Some(remote));

    api.pull(&remote).await?;

    Ok(())
}

#[tauri::command]
async fn push<R>(app: AppHandle<R>, uuid: &str, remote: &str) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    let remote = Remote::new(None, None, Some(remote));

    api.push(&remote).await?;

    Ok(())
}

#[tauri::command]
async fn list_remotes<R>(app: AppHandle<R>, uuid: &str) -> Result<Vec<String>> where R: Runtime, {
    let api = API::new(app, uuid);

    let remotes = api.list_remotes().await?;

    Ok(remotes)
}

#[tauri::command]
async fn add_remote<R>(
    app: AppHandle<R>,
    uuid: &str,
    remote_name: &str,
    remote_url: &str,
    remote_token: &str,
) -> Result<()> where R: Runtime, {
    let api = API::new(app, uuid);

    let remote = Remote::new(Some(remote_name), Some(remote_url), Some(remote_token));

    api.add_remote(&remote);

    Ok(())
}

#[tauri::command]
async fn get_remote<R>(
    app: AppHandle<R>,
    uuid: &str,
    remote: &str,
) -> Result<(String, String)> where R: Runtime,{
    let api = API::new(app, uuid);

    let remote = Remote::new(None, None, Some(remote));

    let (url, token) = api.get_remote(&remote).await?;

    Ok((url, token))
}

#[tauri::command]
fn commit<R>(app: AppHandle<R>, uuid: &str) -> Result<()> where R: Runtime,{
    let api = API::new(app, uuid);

    api.commit()?;

    Ok(())
}

#[tauri::command]
async fn create_lfs() {}

#[tauri::command]
async fn fetch_asset<R>(
    app: AppHandle<R>,
    uuid: &str,
    filename: &str,
) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn put_asset<R>(
    app: AppHandle<R>,
    uuid: &str,
    filename: &str,
    buffer: &str,
) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn upload_file<R>(app: AppHandle<R>, uuid: &str) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn upload_blobs_lfs<R>(
    app: AppHandle<R>,
    uuid: &str,
    remote: &str,
    files: &str,
) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn download_asset<R>(
    app: AppHandle<R>,
    uuid: &str,
    content: &str,
    filename: &str,
) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn download_url_from_pointer<R>(
    app: AppHandle<R>,
    uuid: &str,
    url: &str,
    token: &str,
    pointer_info: &str,
) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn add_asset_path<R>(
    app: AppHandle<R>,
    uuid: &str,
    asset_path: &str,
) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn list_asset_paths<R>(app: AppHandle<R>, uuid: &str) -> Result<()> where R: Runtime,{
    Ok(())
}

#[tauri::command]
async fn zip<R>(app: AppHandle<R>, uuid: &str) -> Result<()> where R: Runtime,
{
    let api = API::new(app, uuid);

    api.zip().await?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn create_app<R: tauri::Runtime>(builder: Builder<R>) -> App<R> {
    builder
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(generate_handler![
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
        .build(generate_context!())
        .expect("error while running the application")
}
