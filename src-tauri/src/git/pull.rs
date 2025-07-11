use super::remote::Remote;
use super::repository::{Repository, Settings};
use crate::{Dataset, Result};
use tauri::Runtime;

pub async fn pull<R: Runtime>(api: &Dataset<R>, remote: &Remote) -> Result<()> {
    let dataset_dir_path = api.find_dataset()?.unwrap();

    let repo = Repository::open(&dataset_dir_path)?;

    let settings = Settings {
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
