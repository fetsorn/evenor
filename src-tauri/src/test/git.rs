use crate::create_app;
use crate::error::{Error, Result};
use crate::git::create_repo;
use crate::git::*;
use tauri::test::{mock_builder, mock_context, noop_assets};

#[tokio::test]
async fn create_repo_test_root() -> Result<()> {
    let app = create_app(mock_builder());

    let uuid = "root";

    let name = "etest";

    create_repo(app.handle().clone(), &uuid, None).await?;

    // check that repo is created
    std::fs::read_dir(temp_d.path())?.for_each(|entry| {
        let entry = entry.unwrap();

        assert!(entry.file_name() == "store");

        std::fs::read_dir(entry.path()).unwrap().for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "root");
        });
    });

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
