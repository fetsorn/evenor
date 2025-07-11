use super::remote::Remote;
use crate::{Dataset, Result};
use git2::Repository;
use tauri::Runtime;

pub async fn push<R: Runtime>(api: &Dataset<R>, remote: &Remote) -> Result<()> {
    let dataset_dir_path = api.find_dataset()?.unwrap();

    let repo = match Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    let mut remote = repo.find_remote(&remote.name.as_ref().unwrap_or(&"".to_string()))?;

    remote.push::<String>(&[], None)?;

    Ok(())
}
