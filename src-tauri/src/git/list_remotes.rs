use crate::{Dataset, Result};

pub async fn list_remotes<R>(api: &Dataset<R>) -> Result<Vec<String>>
where
    R: tauri::Runtime,
{
    let dataset_dir_path = api.find_dataset()?.unwrap();

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
