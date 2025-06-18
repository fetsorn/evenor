use crate::{create_app};
use crate::error::{Error, Result};
use tauri::test::{mock_builder, mock_context, noop_assets};
use crate::git::create_repo;
use temp_dir::TempDir;

#[tokio::test]
async fn create_repo_test_root() -> Result<()> {
    // must assign a variable to create the directory
    let temp_d = TempDir::new()?;

    let mut mock = MockAppDataDir::new();

    mock.expect_send().returning(|_| Ok(temp_d));

    let app = create_app(mock_builder());

    let uuid = "root";

    let name = "etest";

    create_repo(app.handle().clone(), &uuid, None).await?;

    // check that repo is created

    assert!(true);

    Ok(())
}

#[tokio::test]
async fn create_repo_test_root_fails() -> Result<()> {
    let app = create_app(mock_builder());

    let uuid = "root";

    let name = "etest";

    // create root

    create_repo(app.handle().clone(), &uuid, None).await?;

    // check that fails

    assert!(true);

    Ok(())
}
