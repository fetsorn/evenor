use super::Repository;
use crate::repository::Remote;
use std::path::PathBuf;

pub async fn clone(
    dataset_dir: PathBuf,
    name: Option<String>,
    remote: &Remote,
) -> crate::Result<Repository> {
    // clone to dataset_dir from remote_url with remote_token
    // let repo = match Repository::clone(remote.url, dataset_dir) {
    //     Ok(repo) => repo,
    //     Err(e) => panic!("failed to clone: {}", e),
    // };

    // Prepare callbacks.
    let mut callbacks = git2::RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed_types| {
        git2::Cred::username(remote.token.as_ref().unwrap_or(&"".to_string()))
    });

    // Prepare fetch options.
    let mut fo = git2::FetchOptions::new();
    fo.remote_callbacks(callbacks);

    // Prepare builder.
    let mut builder = git2::build::RepoBuilder::new();
    builder.fetch_options(fo);

    // Clone the project.
    let repo = builder.clone(
        remote.url.as_ref().unwrap_or(&"".to_string()),
        &dataset_dir,
    )?;

    // set config.remote.origin.url

    // set config.remote.origin.token

    Ok(Repository {repo})
}

mod test {
    use crate::{create_app, Dataset, Result};
    use super::{Repository, Remote};
    use std::fs::read_dir;
    use tauri::test::{mock_builder, mock_context, noop_assets};
    use tauri::{Manager, State};
    use temp_dir::TempDir;

    #[tokio::test]
    async fn clone_test() -> Result<()> {
        // create a temporary directory, will be deleted by destructor
        // must assign to keep in scope;
        let temp_dir = TempDir::new();

        // reference temp_dir to not move it out of scope
        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

        let app = create_app(mock_builder());

        // save temporary directory path in the tauri state
        app.manage(temp_path.clone());

        let uuid = "euuid";

        let name = "etest";

        let api = Dataset::new(app.handle().clone(), &uuid);

        let dataset_dir = api.name_dataset(Some(name))?;

        let remote = Remote::new(
            Some("https://codeberg.org/norcivilianlabs/pages"),
            None,
            None,
        );

        Repository::clone(dataset_dir, Some(name.to_string()), &remote).await?;

        // check that repo cloned
        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "euuid-etest");
            });
        });

        Ok(())
    }
}
