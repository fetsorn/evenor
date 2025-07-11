use super::remote::Remote;
use crate::{Dataset, Result};
use git2::Repository;
use tauri::Runtime;

pub async fn get_remote<R: Runtime>(api: &Dataset<R>, remote: &Remote) -> Result<(String, String)> {
    let dataset_dir_path = api.find_dataset()?.unwrap();

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let remote = repo.find_remote(remote.name.as_ref().unwrap_or(&"origin".to_string()))?;

    let url = remote.url().unwrap().to_string();

    // read config
    let token = "".to_string();

    Ok((url, token))
}
