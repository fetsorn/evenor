use crate::create_app;
use crate::api::{
    git::{Git, Remote},
    error::{Error, Result},
    API,
};
use tauri::test::{mock_builder, mock_context, noop_assets};
use tauri::{Manager, State};

#[tokio::test]
async fn create_repo_root() -> Result<()> {
    // create a temporary directory, will be deleted by destructor
    // must assign to keep in scope;
    let temp_dir = temp_dir::TempDir::new();

    // reference temp_dir to not move it out of scope
    let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

    let app = create_app(mock_builder());

    // save temporary directory path in the tauri state
    app.manage(temp_path.clone());

    let uuid = "root";

    let name = "etest";

    let api = API::new(app.handle().clone(), &uuid);

    api.create_repo(None).await?;

    // check that repo is created
    std::fs::read_dir(&temp_path)?.for_each(|entry| {
        let entry = entry.unwrap();

        assert!(entry.file_name() == "store");

        std::fs::read_dir(entry.path()).unwrap().for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "root");
        });
    });

    let api = API::new(app.handle().clone(), &uuid);

    // must error when root already exists
    let result = api.create_repo(None).await;

    assert!(result.is_err());

    Ok(())
}

#[tokio::test]
async fn create_repo_name() -> Result<()> {
    // create a temporary directory, will be deleted by destructor
    // must assign to keep in scope;
    let temp_dir = temp_dir::TempDir::new();

    // reference temp_dir to not move it out of scope
    let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

    let app = create_app(mock_builder());

    // save temporary directory path in the tauri state
    app.manage(temp_path.clone());

    let uuid = "euuid";

    let name = "etest";

    let api = API::new(app.handle().clone(), &uuid);

    api.create_repo(Some(name)).await?;

    // check that repo is created
    std::fs::read_dir(&temp_path)?.for_each(|entry| {
        let entry = entry.unwrap();

        assert!(entry.file_name() == "store");

        std::fs::read_dir(entry.path()).unwrap().for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "euuid-etest");
        });
    });

    let name = "etest1";

    // must rename when root already exists
    let result = api.create_repo(Some(name)).await;

    std::fs::read_dir(&temp_path)?.for_each(|entry| {
        let entry = entry.unwrap();

        assert!(entry.file_name() == "store");

        std::fs::read_dir(entry.path()).unwrap().for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "euuid-etest1");
        });
    });

    Ok(())
}

#[tokio::test]
async fn commit_test() -> Result<()> {
    // create a temporary directory, will be deleted by destructor
    // must assign to keep in scope;
    let temp_dir = temp_dir::TempDir::new();

    // reference temp_dir to not move it out of scope
    let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

    let app = create_app(mock_builder());

    // save temporary directory path in the tauri state
    app.manage(temp_path.clone());

    let uuid = "euuid";

    let name = "etest";

    let api = API::new(app.handle().clone(), &uuid);

    api.create_repo(None).await?;

    api.commit()?;

    // TODO: check that repo comitted

    Ok(())
}

#[tokio::test]
async fn clone_test() -> Result<()> {
    // create a temporary directory, will be deleted by destructor
    // must assign to keep in scope;
    let temp_dir = temp_dir::TempDir::new();

    // reference temp_dir to not move it out of scope
    let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

    let app = create_app(mock_builder());

    // save temporary directory path in the tauri state
    app.manage(temp_path.clone());

    let uuid = "euuid";

    let name = "etest";

    let api = API::new(app.handle().clone(), &uuid);

    let remote = Remote::new(Some("https://codeberg.org/norcivilianlabs/pages"), None, None);

    api.clone(Some(name.to_string()), &remote).await?;

    // check that repo cloned
    std::fs::read_dir(&temp_path)?.for_each(|entry| {
        let entry = entry.unwrap();

        assert!(entry.file_name() == "store");

        std::fs::read_dir(entry.path()).unwrap().for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "euuid-etest");
        });
    });

    Ok(())
}
