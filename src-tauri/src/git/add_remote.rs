use super::remote::Remote;
use crate::{Dataset, Result};

pub async fn add_remote<R>(api: &Dataset<R>, remote: &Remote) -> Result<()>
where
    R: tauri::Runtime,
{
    let dataset_dir_path = api.find_dataset()?.unwrap();

    let repo = match git2::Repository::open(dataset_dir_path) {
        Ok(repo) => repo,
        Err(e) => panic!("failed to open: {}", e),
    };

    repo.remote(
        &remote.name.as_ref().unwrap_or(&"".to_string()),
        &remote.url.as_ref().unwrap_or(&"".to_string()),
    )?;

    Ok(())
}
