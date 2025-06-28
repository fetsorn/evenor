use crate::create_app;
use crate::error::{Error, Result};
use crate::git::{create_repo, commit, clone};
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

    create_repo(app.handle().clone(), &uuid, None).await?;

    // check that repo is created
    std::fs::read_dir(&temp_path)?.for_each(|entry| {
        let entry = entry.unwrap();

        assert!(entry.file_name() == "store");

        std::fs::read_dir(entry.path()).unwrap().for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "root");
        });
    });

    // must error when root already exists
    let result = create_repo(app.handle().clone(), &uuid, None).await;

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

    create_repo(app.handle().clone(), &uuid, Some(name)).await?;

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
    let result = create_repo(app.handle().clone(), &uuid, Some(name)).await;

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

    create_repo(app.handle().clone(), &uuid, None).await?;

    commit(app.handle().clone(), &uuid)?;

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

    clone(app.handle().clone(), &uuid, Some(name.to_string()), "https://codeberg.org/norcivilianlabs/pages", "").await?;

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
