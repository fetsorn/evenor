use super::error::{Error, Result};
use super::{API, io::IO};
use regex::Regex;
use std::fs::{create_dir, read_dir, rename, remove_dir_all};
use std::path::Path;
use tauri::{Runtime, AppHandle, State, Manager};

pub struct Remote {
    url: Option<String>,
    token: Option<String>,
    name: Option<String>,
}

impl Remote {
    pub fn new(url: Option<&str>, token: Option<&str>, name: Option<&str>) -> Self {
        Remote {
            url: url.map(|s| s.to_string()),
            token: url.map(|s| s.to_string()),
            name: url.map(|s| s.to_string())
        }
    }
}

pub trait Git {
    async fn create_repo(&self, name: Option<&str>) -> Result<()>;
    async fn clone(&self, name: Option<String>, remote: &Remote) -> Result<()>;
    async fn pull(&self, remote: &Remote) -> Result<()>;
    async fn push(&self, remote: &Remote) -> Result<()>;
    async fn list_remotes(&self) -> Result<Vec<String>>;
    async fn add_remote(&self, remote: &Remote) -> Result<()>;
    async fn get_remote(&self, remote: &Remote) -> Result<(String, String)>;
    fn commit(&self) -> Result<()>;
}

impl<R> Git for API<R>
where
    R: tauri::Runtime,
{
    async fn create_repo(
        &self,
        name: Option<&str>,
    ) -> Result<()> {
    let dataset_dir = self.name_dir(name)?;

    if self.uuid == "root" {
        create_dir(dataset_dir)?;

        return Ok(());
    }

    let existing_dataset = self.find_dataset()?;

    match existing_dataset {
        Some(s) => {
            let foo = s;

            if foo != dataset_dir {
                rename(foo, &dataset_dir)?;
            }
        }
        None => {
            create_dir(&dataset_dir)?;

            match git2::Repository::init(&dataset_dir) {
                Ok(repo) => repo,
                Err(e) => panic!("failed to init: {}", e),
            };

            let gitignore_path = dataset_dir.join(".gitignore");

            std::fs::write(&gitignore_path, ".DS_Store")?;

            let csvscsv_path = dataset_dir.join(".csvs.csv");

            std::fs::write(&csvscsv_path, "csvs,0.0.2")?;
        }
    }

    Ok(())
}

    async fn clone(
        &self,
        name: Option<String>,
        remote: &Remote
    ) -> Result<()> {
    match self.find_dataset() {
        Err(_) => (),
        Ok(p) => match p {
            None => (),
            Some(d) => remove_dir_all(d)?
        },
    };

    let store_dir = self.get_store_dir()?;

    let dir_name = match name {
        Some(name) => &format!("{}-{}", self.uuid, name),
        None => &self.uuid,
    };

    let dataset_dir_path = store_dir.join(dir_name);

    // clone to dataset_dir_path from remote_url with remote_token
    // let repo = match git2::Repository::clone(remote.url, dataset_dir_path) {
    //     Ok(repo) => repo,
    //     Err(e) => panic!("failed to clone: {}", e),
    // };

    // Prepare callbacks.
    let mut callbacks = git2::RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed_types| git2::Cred::username(remote.token.as_ref().unwrap_or(&"".to_string())));

    // Prepare fetch options.
    let mut fo = git2::FetchOptions::new();
    fo.remote_callbacks(callbacks);

    // Prepare builder.
    let mut builder = git2::build::RepoBuilder::new();
    builder.fetch_options(fo);

    // Clone the project.
    builder.clone(remote.url.as_ref().unwrap_or(&"".to_string()), &dataset_dir_path)?;

    // set config.remote.origin.url

    // set config.remote.origin.token

    Ok(())
}

    async fn pull(&self, remote: &Remote) -> Result<()> {
    let dataset_dir_path = self.find_dataset()?.unwrap();

    let repo = super::repository::Repository::open(&dataset_dir_path)?;

    let settings = super::repository::Settings {
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

    async fn push(&self, remote: &Remote) -> Result<()> {
    let dataset_dir_path = self.find_dataset()?.unwrap();

    let repo = match git2::Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let mut remote = repo.find_remote(&remote.name.as_ref().unwrap_or(&"".to_string()))?;

    remote.push::<String>(&[], None)?;

    Ok(())
}

    async fn list_remotes(&self) -> Result<Vec<String>> {
    let dataset_dir_path = self.find_dataset()?.unwrap();

    let repo = match git2::Repository::open(dataset_dir_path) {
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

    async fn add_remote(
        &self,
        remote: &Remote
    ) -> Result<()> {
    let dataset_dir_path = self.find_dataset()?.unwrap();

    let repo = match git2::Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    repo.remote(&remote.name.as_ref().unwrap_or(&"".to_string()), &remote.url.as_ref().unwrap_or(&"".to_string()))?;

    Ok(())
}

    async fn get_remote(
        &self,
        remote: &Remote,
    ) -> Result<(String, String)> {
    let dataset_dir_path = self.find_dataset()?.unwrap();

    let repo = match git2::Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let remote = repo.find_remote(remote.name.as_ref().unwrap_or(&"origin".to_string()))?;

    let url = remote.url().unwrap().to_string();

    // read config
    let token = "".to_string();

    Ok((url, token))
}

    fn commit(&self) -> Result<()> {
        let dataset_dir_path = self.find_dataset()?.unwrap();

        // need a wrapper over git2 here to impement find_last_commit
        let repo = super::repository::Repository::open(&dataset_dir_path)?;

        repo.commit();

        Ok(())
}

}
