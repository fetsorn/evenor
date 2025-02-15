#![allow(warnings)]
use async_stream::stream;
use serde_json::Value;
use csvs::{
    delete,
    select::{select_record, select_record_stream},
    types::into_value::IntoValue,
    types::entry::Entry,
    update,
};
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use git2::{Repository, RemoteCallbacks, Cred};
use regex::Regex;
use serde::Serialize;
use std::fs::{create_dir, read_dir, rename};
use std::path::Path;
use tauri::{ipc::Channel, AppHandle, Emitter, EventTarget, Manager};
mod git;
mod error;
pub use crate::error::{Error, Result};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn hello_world(some_variable: &str) -> String {
    println!("helloWorld in Rust");
    format!("{} from Rust!", some_variable)
}

fn find_last_commit(repo: &Repository) -> Result<git2::Commit> {
    let obj = repo.head()?.resolve()?.peel(git2::ObjectType::Commit)?;

    obj.into_commit()
        .map_err(|_| git2::Error::from_str("Couldn't find commit").into())
}

fn find_dataset(app: &AppHandle, uuid: &str) -> Result<std::path::PathBuf> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid))
            .unwrap()
            .is_match(entry_path)
    });

    match existing_dataset {
        None => Err(tauri::Error::UnknownPath.into()),
        Some(dataset_dir) => Ok(dataset_dir?.path())
    }
}

#[tauri::command]
fn commit(app: AppHandle, uuid: &str) -> Result<()> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let mut index = repo.index().unwrap();

    let mut message = "".to_owned();

    let cb = &mut |path: &Path, _matched_spec: &[u8]| -> i32 {
        let status = repo.status_file(path).unwrap();

        let ret = if status.contains(git2::Status::WT_MODIFIED)
            || status.contains(git2::Status::WT_NEW)
        {
            message = format!("{}, {}", message, path.display());
            0
        } else {
            1
        };

        ret
    };

    let cb = Some(cb as &mut git2::IndexMatchedPath);

    index
        .add_all(["*"].iter(), git2::IndexAddOption::DEFAULT, cb)
        .unwrap();

    let oid = index.write_tree().unwrap();

    let signature = git2::Signature::now("name", "name@mail.com").unwrap();

    let tree = repo.find_tree(oid).unwrap();

    match find_last_commit(&repo) {
        Ok(c) => {
            repo.commit(
                Some("HEAD"), //  point HEAD to our new commit
                &signature,   // author
                &signature,   // committer
                &message,     // commit message
                &tree,        // tree
                &[&c],
            ); // parents
        },
        Err(_) => {
            repo.commit(
                Some("HEAD"), //  point HEAD to our new commit
                &signature,   // author
                &signature,   // committer
                &message,     // commit message
                &tree,        // tree
                &[],
            ); // parents
        }
    }

    Ok(())
}

#[tauri::command]
fn ensure(app: AppHandle, uuid: &str, name: Option<&str>) -> Result<()> {
    let store_dir = app.path().app_data_dir()?.join("store");

    if (!store_dir.exists()) {
        create_dir(&store_dir);
    }

    let dataset_filename = match name {
        None => uuid,
        Some(s) => &format!("{}-{}", uuid, s),
    };

    let dataset_dir = store_dir.join(dataset_filename);

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid))
            .unwrap()
            .is_match(entry_path)
    });

    match existing_dataset {
        None => {
            create_dir(&dataset_dir);

            match Repository::init(&dataset_dir) {
                Ok(repo) => repo,
                Err(e) => panic!("failed to init: {}", e),
            };

            let gitignore_path = dataset_dir.join(".gitignore");

            std::fs::write(&gitignore_path, ".DS_Store");

            let csvscsv_path = dataset_dir.join(".csvs.csv");

            std::fs::write(&csvscsv_path, "csvs,0.0.2");

            commit(app, uuid);
        }
        Some(s) => {
            rename(s?.path(), &dataset_dir);
        }
    }

    Ok(())
}

#[tauri::command]
async fn select(app: AppHandle, uuid: &str, query: Value) -> Result<Vec<Value>> {
    let query: Entry = query.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?;

    let query_for_stream = query.clone();

    let readable_stream = stream! {
        yield query_for_stream;
    };

    let s = select_record_stream(readable_stream, dataset_dir_path);

    pin_mut!(s); // needed for iteration

    let mut records: Vec<Value> = vec![];

    while let Some(entry) = s.next().await {
        records.push(entry.into_value())
    }

    Ok(records)
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum SelectEvent {
    #[serde(rename_all = "camelCase")]
    Started { query: Value },
    #[serde(rename_all = "camelCase")]
    Progress { query: Value, entry: Value },
    #[serde(rename_all = "camelCase")]
    Finished { query: Value },
}

#[tauri::command]
async fn select_stream(
    app: AppHandle,
    uuid: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()> {
    let query: Entry = query.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?;

    let query_for_stream = query.clone();

    let readable_stream = stream! {
        yield query_for_stream;
    };

    let s = select_record_stream(readable_stream, dataset_dir_path);

    pin_mut!(s); // needed for iteration

    on_event
        .send(SelectEvent::Started {
            query: query.clone().into_value(),
        })
        .unwrap();

    while let Some(entry) = s.next().await {
        on_event
            .send(SelectEvent::Progress {
                query: query.clone().into_value(),
                entry: entry.into_value(),
            })
            .unwrap();
    }

    on_event.send(SelectEvent::Finished { query: query.into_value() }).unwrap();

    Ok(())
}

#[tauri::command]
async fn update_record(app: AppHandle, uuid: &str, record: Value) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?;

    update::update_record(dataset_dir_path, vec![record]).await;

    Ok(())
}

#[tauri::command]
async fn delete_record(app: AppHandle, uuid: &str, record: Value) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?;

    delete::delete_record(dataset_dir_path, vec![record]).await;

    Ok(())
}

#[tauri::command]
async fn clone(app: AppHandle, uuid: &str, remote_url: &str, remote_token: &str, name: Option<String>) -> Result<()> {
    match find_dataset(&app, uuid) {
        Err(_) => (),
        Ok(_) => return Err(tauri::Error::UnknownPath.into())
    };

    let store_dir = app.path().app_data_dir()?.join("store");

    let dir_name = match name {
        Some(name) => &format!("{}-{}", uuid, name),
        None => uuid
    };

    let dataset_dir_path = store_dir.join(dir_name);

    // clone to dataset_dir_path from remote_url with remote_token
    // let repo = match Repository::clone(remote_url, dataset_dir_path) {
    //     Ok(repo) => repo,
    //     Err(e) => panic!("failed to clone: {}", e),
    // };

    // Prepare callbacks.
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed_types| {
        Cred::username(remote_token)
    });

    // Prepare fetch options.
    let mut fo = git2::FetchOptions::new();
    fo.remote_callbacks(callbacks);

    // Prepare builder.
    let mut builder = git2::build::RepoBuilder::new();
    builder.fetch_options(fo);

    // Clone the project.
    builder.clone(
        remote_url,
        &dataset_dir_path,
    );

    // set config.remote.origin.url

    // set config.remote.origin.token

    Ok(())
}

#[tauri::command]
async fn push(app: AppHandle, uuid: &str, remote: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn pull(app: AppHandle, uuid: &str, remote: &str) -> Result<()> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = crate::git::Repository::open(&dataset_dir_path)?;

    let settings = crate::git::Settings {
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
    });

    Ok(())
}

#[tauri::command]
async fn zip(app: AppHandle, uuid: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn list_remotes(app: AppHandle, uuid: &str) -> Result<Vec<String>> {
    Ok(vec![])
}

#[tauri::command]
async fn add_remote(app: AppHandle, uuid: &str, remote_name: &str, remote_url: &str, remote_token: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn get_remote(app: AppHandle, uuid: &str, remote: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn fetch_asset(app: AppHandle, uuid: &str, filename: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn download_asset(app: AppHandle, uuid: &str, content: &str, filename: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn put_asset(app: AppHandle, uuid: &str, filename: &str, buffer: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn upload_file(app: AppHandle, uuid: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn upload_blobs_lfs(app: AppHandle, uuid: &str, remote: &str, files: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn add_asset_path(app: AppHandle, uuid: &str, asset_path: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn list_asset_paths(app: AppHandle, uuid: &str) -> Result<()> {
    Ok(())
}

#[tauri::command]
async fn download_url_from_pointer(app: AppHandle, uuid: &str, url: &str, token: &str, pointer_info: &str) -> Result<()> {
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            hello_world,
            commit,
            ensure,
            select,
            select_stream,
            update_record,
            delete_record,
            clone,
            push,
            push,
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

