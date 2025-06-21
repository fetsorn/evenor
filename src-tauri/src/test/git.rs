use crate::create_app;
use crate::error::{Error, Result};
use crate::git::create_repo;
use crate::git::*;
use mockall::predicate::*;
use mockall::*;
use tauri::test::{mock_builder, mock_context, noop_assets};
use temp_dir::TempDir;

#[tokio::test]
async fn create_repo_test_root() -> Result<()> {
    let mut mock = MockAppDataDir::new();

    mock.expect_app_data_dir().returning(|| {
        // must be inside the closure for lifetime reasons
        // must assign a variable to create the directory
        let temp_d = TempDir::new()?;

        let temp_path: std::path::PathBuf = temp_d.path().to_path_buf();

        Ok(temp_path)
    });

    let app = create_app(mock_builder());

    let uuid = "root";

    let name = "etest";

    create_repo(app.handle().clone(), &uuid, None).await?;

    // check that repo is created

    assert!(true);

    Ok(())
}

//#[tokio::test]
//async fn create_repo_test_root_fails() -> Result<()> {
//    let app = create_app(mock_builder());
//
//    let uuid = "root";
//
//    let name = "etest";
//
//    // create root
//
//    create_repo(app.handle().clone(), &uuid, None).await?;
//
//    // check that fails
//
//    assert!(true);
//
//    Ok(())
//}
