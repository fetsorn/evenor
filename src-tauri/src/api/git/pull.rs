use super::remote::Remote;
use crate::api::{error::Result, io::IO, API};

pub async fn pull<R>(api: &API<R>, remote: &Remote) -> Result<()>
where
    R: tauri::Runtime,
{
    let dataset_dir_path = api.find_dataset()?.unwrap();

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
