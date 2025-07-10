use crate::create_app;
use crate::error::{Error, Result};
use crate::io::find_dataset;
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

    let dirpath = format!(
        "{}/store/{dir}",
       temp_path.display()
    );

    std::fs::create_dir(&dirpath);

    std::fs::read_dir(temp_path)?.for_each(|e| println!("{:?}", e.unwrap().path()));

    //let dataset = find_dataset(&app.handle(), uuid)?.unwrap();

    //assert_eq!(dataset.to_str().unwrap(), dirpath);

    //std::fs::remove_dir(&dirpath);

    Ok(())
}
