use crate::create_app;
use crate::api::{API, io::IO, error::{Error, Result}};
use tauri::test::{mock_builder, mock_context, noop_assets};
use tauri::Manager;

#[tokio::test]
async fn find_dataset_test() -> Result<()> {
    // create a temporary directory, will be deleted by destructor
    // must assign to keep in scope;
    let temp_dir = temp_dir::TempDir::new();

    // reference temp_dir to not move it out of scope
    let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

    let app = create_app(mock_builder());

    // save temporary directory path in the tauri state
    app.manage(temp_path.clone());

    let uuid = "atest";

    let name = "etest";

    let dir = format!("{uuid}-{name}");

    let storepath = temp_path.join("store");

    std::fs::create_dir(&storepath)?;

    let dirpath = storepath.join(dir);

    std::fs::create_dir(&dirpath)?;

    let api = API::new(app.handle().clone(), uuid);

    let dataset = api.find_dataset()?.unwrap();

    assert_eq!(dataset, dirpath);

    Ok(())
}
