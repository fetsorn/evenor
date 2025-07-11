use super::remote::Remote;

use crate::api::{error::Result, io::IO, API};
pub async fn get_remote<R>(api: &API<R>, remote: &Remote) -> Result<(String, String)>
where
    R: tauri::Runtime,
{
    let dataset_dir_path = api.find_dataset()?.unwrap();

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
