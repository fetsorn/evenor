use std::path::Path;
use regex::Regex;
use tauri::{AppHandle, Manager};
use std::fs::{create_dir, read_dir, rename};
use crate::error::{Error, Result};
use git2::{Cred, RemoteCallbacks, Repository};
use crate::io::find_dataset;

#[tauri::command]
pub async fn create_repo(app: AppHandle, uuid: &str, name: Option<&str>) -> Result<()> {
    let store_dir = app.path().app_data_dir()?.join("store");

    if !store_dir.exists() {
        create_dir(&store_dir)?;
    }

    let dataset_filename = match name {
        None => uuid,
        Some(s) => &format!("{}-{}", uuid, s),
    };

    let dataset_dir = store_dir.join(dataset_filename);

    if uuid == "root" {
        create_dir(dataset_dir)?;

        return Ok(())
    }

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
            create_dir(&dataset_dir)?;

            match Repository::init(&dataset_dir) {
                Ok(repo) => repo,
                Err(e) => panic!("failed to init: {}", e),
            };

            let gitignore_path = dataset_dir.join(".gitignore");

            std::fs::write(&gitignore_path, ".DS_Store")?;

            let csvscsv_path = dataset_dir.join(".csvs.csv");

            std::fs::write(&csvscsv_path, "csvs,0.0.2")?;

            commit(app, uuid)?;
        }
        Some(s) => {
            let foo = s?;

            if foo.path() != dataset_dir {
                rename(foo.path(), &dataset_dir)?;
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn clone(
    app: AppHandle,
    uuid: &str,
    remote_url: &str,
    remote_token: &str,
    name: Option<String>,
) -> Result<()> {
    match find_dataset(&app, uuid) {
        Err(_) => (),
        Ok(_) => return Err(tauri::Error::UnknownPath.into()),
    };

    let store_dir = app.path().app_data_dir()?.join("store");

    let dir_name = match name {
        Some(name) => &format!("{}-{}", uuid, name),
        None => uuid,
    };

    let dataset_dir_path = store_dir.join(dir_name);

    // clone to dataset_dir_path from remote_url with remote_token
    // let repo = match Repository::clone(remote_url, dataset_dir_path) {
    //     Ok(repo) => repo,
    //     Err(e) => panic!("failed to clone: {}", e),
    // };

    // Prepare callbacks.
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed_types| Cred::username(remote_token));

    // Prepare fetch options.
    let mut fo = git2::FetchOptions::new();
    fo.remote_callbacks(callbacks);

    // Prepare builder.
    let mut builder = git2::build::RepoBuilder::new();
    builder.fetch_options(fo);

    // Clone the project.
    builder.clone(remote_url, &dataset_dir_path)?;

    // set config.remote.origin.url

    // set config.remote.origin.token

    Ok(())
}

#[tauri::command]
pub async fn pull(app: AppHandle, uuid: &str, remote: &str) -> Result<()> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = crate::repository::Repository::open(&dataset_dir_path)?;

    let settings = crate::repository::Settings {
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
pub async fn push(app: AppHandle, uuid: &str, remote: &str) -> Result<()> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let mut remote = repo.find_remote(remote)?;

    remote.push::<String>(&[], None)?;

    Ok(())
}

#[tauri::command]
pub async fn list_remotes(app: AppHandle, uuid: &str) -> Result<Vec<String>> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let remotes = repo
        .remotes()?
        .iter()
        .flatten()
        .map(String::from)
        .collect::<Vec<_>>();

    Ok(remotes)
}

#[tauri::command]
pub async fn add_remote(
    app: AppHandle,
    uuid: &str,
    remote_name: &str,
    remote_url: &str,
    remote_token: &str,
) -> Result<()> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    repo.remote(remote_name, remote_url)?;

    Ok(())
}

#[tauri::command]
pub async fn get_remote(app: AppHandle, uuid: &str, remote: &str) -> Result<(String, String)> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let remote = repo.find_remote(remote)?;

    let url = remote.url().unwrap().to_string();

    // read config
    let token = "".to_string();

    Ok((url, token))
}

pub fn find_last_commit(repo: &Repository) -> Result<git2::Commit> {
    let obj = repo.head()?.resolve()?.peel(git2::ObjectType::Commit)?;

    obj.into_commit()
        .map_err(|_| git2::Error::from_str("Couldn't find commit").into())
}

#[tauri::command]
pub fn commit(app: AppHandle, uuid: &str) -> Result<()> {
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
            )?; // parents
        }
        Err(_) => {
            repo.commit(
                Some("HEAD"), //  point HEAD to our new commit
                &signature,   // author
                &signature,   // committer
                &message,     // commit message
                &tree,        // tree
                &[],
            )?; // parents
        }
    }

    Ok(())
}
