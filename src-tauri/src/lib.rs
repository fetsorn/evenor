#![allow(warnings)]
use tauri::{AppHandle, Emitter, Manager, EventTarget, Error};
use csvs_rs::{types::{schema::Schema, entry::Entry}, select::{select_record, select_schema}, update, delete};
use std::fs::{rename, create_dir, read_dir};
use regex::Regex;
use std::path::Path;
use git2::Repository;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn hello_world(some_variable: &str) -> String {
    println!("helloWorld in Rust");
    format!("{} from Rust!", some_variable)
}

fn find_last_commit(repo: &Repository) -> Result<git2::Commit, git2::Error> {
    let obj = repo.head()?.resolve()?.peel(git2::ObjectType::Commit)?;

    obj.into_commit().map_err(|_| git2::Error::from_str("Couldn't find commit"))
}

#[tauri::command]
fn commit(app: AppHandle, uuid: &str) -> Result<(), Error> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid)).unwrap().is_match(entry_path)
    });

    match existing_dataset {
        None => Err(Error::UnknownPath),
        Some(dataset_dir) => {
            let dataset_dir = dataset_dir.unwrap();

            let dataset_dir_path = dataset_dir.path();

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

            index.add_all(["*"].iter(), git2::IndexAddOption::DEFAULT, cb).unwrap();

            let oid = index.write_tree().unwrap();

            let signature = git2::Signature::now("name", "name@mail.com").unwrap();

            let parent_commit = find_last_commit(&repo).unwrap();

            let tree = repo.find_tree(oid).unwrap();

            repo.commit(Some("HEAD"), //  point HEAD to our new commit
                        &signature, // author
                        &signature, // committer
                        &message, // commit message
                        &tree, // tree
                        &[&parent_commit]); // parents

            Ok(())
        }
    }
}

#[tauri::command]
fn ensure(app: AppHandle, uuid: &str, schema: Schema, name: Option<&str>) -> Result<(), Error> {
    let store_dir = app.path().app_data_dir()?.join("store");

    if (!store_dir.exists()) {
        create_dir(&store_dir);
    }

    let dataset_filename = match name {
        None => uuid,
        Some(s) => &format!("{}-{}", uuid, s)
    };

    let dataset_dir = store_dir.join(dataset_filename);

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid)).unwrap().is_match(entry_path)
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
async fn select(app: AppHandle, uuid: &str, query: Entry) -> Result<Vec<Entry>, Error> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid)).unwrap().is_match(entry_path)
    });

    match existing_dataset {
        None => Err(Error::UnknownPath),
        Some(dataset_dir) => {
            let dataset_dir = dataset_dir.unwrap();

            let dataset_dir_path = dataset_dir.path();

            let records = select_record(dataset_dir_path, vec![query]).await;

            Ok(records)
        }
    }
}

fn records_to_schema(schema: Schema, branch_records: Vec<Entry>) {
}

#[tauri::command]
async fn read_schema(app: AppHandle, uuid: &str) -> Result<(), Error> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid)).unwrap().is_match(entry_path)
    });

    match existing_dataset {
        None => Err(Error::UnknownPath),
        Some(dataset_dir) => {
            let dataset_dir = dataset_dir.unwrap();

            let dataset_dir_path = dataset_dir.path();

            let schema_record = select_schema(dataset_dir_path.clone()).await;

            let branch_records = select_record(dataset_dir_path, vec![ Entry { base: "branch".to_owned(), base_value: None, leader_value: None, leaves: std::collections::HashMap::new() } ]).await;

            let schema = records_to_schema(schema_record, branch_records);

            Ok(())
        }
    }
}

#[tauri::command]
fn select_stream(app: AppHandle, uuid: &str, query: Entry) -> Result<(), Error> {
    println!("helloWorld in Rust");
    Ok(())
}

#[tauri::command]
async fn update_record(app: AppHandle, uuid: &str, record: Entry) -> Result<(), Error> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid)).unwrap().is_match(entry_path)
    });

    match existing_dataset {
        None => Err(Error::UnknownPath),
        Some(dataset_dir) => {
            let dataset_dir = dataset_dir.unwrap();

            let dataset_dir_path = dataset_dir.path();

            update::update_record(dataset_dir_path, vec![record]).await;

            Ok(())
        }
    }
}

#[tauri::command]
async fn delete_record(app: AppHandle, uuid: &str, record: Entry) -> Result<(), Error> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid)).unwrap().is_match(entry_path)
    });

    match existing_dataset {
        None => Err(Error::UnknownPath),
        Some(dataset_dir) => {
            let dataset_dir = dataset_dir.unwrap();

            let dataset_dir_path = dataset_dir.path();

            delete::delete_record(dataset_dir_path, vec![record]).await;

            Ok(())
        }
    }
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
            read_schema,
            update_record,
            delete_record
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
