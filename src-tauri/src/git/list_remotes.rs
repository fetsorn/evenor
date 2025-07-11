use crate::{Dataset, Result};
use git2::Repository;
use tauri::Runtime;

pub async fn list_remotes<R: Runtime>(api: &Dataset<R>) -> Result<Vec<String>> {
    let dataset_dir_path = api.find_dataset()?.unwrap();

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
