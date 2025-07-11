#![allow(warnings)]
use serde_json::Value;
use tauri::{generate_context, generate_handler, ipc::Channel, App, AppHandle, Builder, Runtime};
mod dataset;
mod error;
mod repository;
use repository::{Repository, Settings, Remote};
use dataset::{Dataset, SelectEvent, CSVS};
pub use error::{Result, Error};
use std::fs::remove_dir_all;

#[tauri::command]
async fn select<R>(app: AppHandle<R>, uuid: &str, query: Value) -> Result<Vec<Value>>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let dataset_dir = api.find_dataset()?.unwrap();

    let records = Dataset::<R>::select(dataset_dir, query).await?;

    Ok(records)
}

#[tauri::command]
async fn select_stream<R>(
    app: AppHandle<R>,
    uuid: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let dataset_dir = api.find_dataset()?.unwrap();

    Dataset::<R>::select_stream(dataset_dir, query, on_event).await?;

    Ok(())
}

#[tauri::command]
async fn update_record<R>(app: AppHandle<R>, uuid: &str, record: Value) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let dataset_dir = api.find_dataset()?.unwrap();

    Dataset::<R>::update_record(dataset_dir, record).await?;

    Ok(())
}

#[tauri::command]
async fn delete_record<R>(app: AppHandle<R>, uuid: &str, record: Value) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let dataset_dir = api.find_dataset()?.unwrap();

    Dataset::<R>::delete_record(dataset_dir, record).await?;

    Ok(())
}

#[tauri::command]
async fn create_repo<R>(app: AppHandle<R>, uuid: &str, name: Option<&str>) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    api.make_dataset(name).await?;

    Ok(())
}

#[tauri::command]
async fn clone<R>(
    app: AppHandle<R>,
    uuid: &str,
    name: Option<String>,
    remote_url: &str,
    remote_token: &str,
) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let remote = Remote::new(Some(remote_url), Some(remote_token), None);

    match api.find_dataset() {
        Err(_) => (),
        Ok(p) => match p {
            None => (),
            Some(d) => remove_dir_all(d)?,
        },
    };

    let dataset_dir = api.name_dataset(name.as_deref())?;

    let repo = Repository::clone(dataset_dir, name, &remote).await?;

    Ok(())
}

#[tauri::command]
async fn pull<R>(app: AppHandle<R>, uuid: &str, remote: &str) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let remote = Remote::new(None, None, Some(remote));

    let dataset_dir = api.find_dataset()?.unwrap();

    let repo = Repository::open(&dataset_dir)?;

    let settings = Settings {
        default_branch: None,
        default_remote: None,
        ssh: None,
        editor: None,
        ignore: None,
        prune: None,
    };

    let (status, remote) = repo.status(&settings)?;

    // let remote = repo.find_remote(remote)?.fetch(&["main"], None, None);

    repo.pull(&settings, &status, remote, true, move |progress| {
        // do nothing
    })?;

    Ok(())
}

#[tauri::command]
async fn push<R>(app: AppHandle<R>, uuid: &str, remote: &str) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let remote = Remote::new(None, None, Some(remote));

    let dataset_dir = api.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    let mut remote = repository.find_remote(&remote.name.as_ref().unwrap_or(&"".to_string()))?;

    remote.push::<String>(&[], None)?;

    Ok(())
}

#[tauri::command]
async fn list_remotes<R>(app: AppHandle<R>, uuid: &str) -> Result<Vec<String>>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let dataset_dir = api.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    let remotes = repository.remotes()?;

    Ok(remotes)
}

#[tauri::command]
async fn add_remote<R>(
    app: AppHandle<R>,
    uuid: &str,
    remote_name: &str,
    remote_url: &str,
    remote_token: &str,
) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let remote = Remote::new(Some(remote_name), Some(remote_url), Some(remote_token));

    let dataset_dir = api.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    repository.remote(
        &remote.name.as_ref().unwrap_or(&"".to_string()),
        &remote.url.as_ref().unwrap_or(&"".to_string()),
    )?;

    Ok(())
}

#[tauri::command]
async fn get_remote<R>(app: AppHandle<R>, uuid: &str, remote: &str) -> Result<(String, String)>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let remote = Remote::new(None, None, Some(remote));

    let dataset_dir = api.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    let remote = repository.find_remote(remote.name.as_ref().unwrap_or(&"origin".to_string()))?;

    let url = remote.url().unwrap().to_string();

    // read config
    let token = "".to_string();

    Ok((url, token))
}

#[tauri::command]
fn commit<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

    let dataset_dir_path = api.find_dataset()?.unwrap();

    let repo = Repository::open(&dataset_dir_path)?;

    repo.commit();

    Ok(())
}

#[tauri::command]
fn create_lfs<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn fetch_asset<R>(app: AppHandle<R>, uuid: &str, filename: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn put_asset<R>(app: AppHandle<R>, uuid: &str, filename: &str, buffer: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn upload_file<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn upload_blobs_lfs<R>(app: AppHandle<R>, uuid: &str, remote: &str, files: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn download_asset<R>(
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
async fn download_url_from_pointer<R>(
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
async fn add_asset_path<R>(app: AppHandle<R>, uuid: &str, asset_path: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn list_asset_paths<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    Ok(())
}

#[tauri::command]
async fn zip<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    let api = Dataset::new(app, uuid);

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
