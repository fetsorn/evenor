use super::remote::Remote;
use crate::{Dataset, Result};
use git2::Repository;
use tauri::Runtime;

pub async fn add_remote<R: Runtime>(api: &Dataset<R>, remote: &Remote) -> Result<()> {
    let dataset_dir_path = api.find_dataset()?.unwrap();

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    repo.remote(
        &remote.name.as_ref().unwrap_or(&"".to_string()),
        &remote.url.as_ref().unwrap_or(&"".to_string()),
    )?;

    Ok(())
}
