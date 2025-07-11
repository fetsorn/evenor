use super::remote::Remote;
use crate::{Dataset, Result};
use git2::{build::RepoBuilder, Cred, FetchOptions, RemoteCallbacks, Repository};
use std::fs::remove_dir_all;
use tauri::Runtime;

pub async fn clone<R: Runtime>(
    api: &Dataset<R>,
    name: Option<String>,
    remote: &Remote,
) -> Result<()> {
    match api.find_dataset() {
        Err(_) => (),
        Ok(p) => match p {
            None => (),
            Some(d) => remove_dir_all(d)?,
        },
    };

    let store_dir = api.get_store_dir()?;

    let dir_name = match name {
        Some(name) => &format!("{}-{}", api.uuid, name),
        None => &api.uuid,
    };

    let dataset_dir_path = store_dir.join(dir_name);

    // clone to dataset_dir_path from remote_url with remote_token
    // let repo = match Repository::clone(remote.url, dataset_dir_path) {
    //     Ok(repo) => repo,
    //     Err(e) => panic!("failed to clone: {}", e),
    // };

    // Prepare callbacks.
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed_types| {
        Cred::username(remote.token.as_ref().unwrap_or(&"".to_string()))
    });

    // Prepare fetch options.
    let mut fo = FetchOptions::new();
    fo.remote_callbacks(callbacks);

    // Prepare builder.
    let mut builder = RepoBuilder::new();
    builder.fetch_options(fo);

    // Clone the project.
    builder.clone(
        remote.url.as_ref().unwrap_or(&"".to_string()),
        &dataset_dir_path,
    )?;

    // set config.remote.origin.url

    // set config.remote.origin.token

    Ok(())
}

mod test {
    use crate::{create_app, Dataset, Git, Remote, Result};
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

        let remote = Remote::new(
            Some("https://codeberg.org/norcivilianlabs/pages"),
            None,
            None,
        );

        api.clone(Some(name.to_string()), &remote).await?;

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
