use crate::create_app;
use crate::error::{Error, Result};
use crate::zip::{zip, add_to_zip};
use crate::git::create_repo;
use crate::io::name_dir;
use tauri::test::{mock_builder, mock_context, noop_assets};
use tauri::{Manager, State};
use std::io::prelude::*;

#[tokio::test]
async fn zip_test() -> Result<()> {
    // create a temporary directory, will be deleted by destructor
    // must assign to keep in scope;
    let temp_dir = temp_dir::TempDir::new();

    // reference temp_dir to not move it out of scope
    let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

    let app = create_app(mock_builder());

    // save temporary directory path in the tauri state
    app.manage(temp_path.clone());

    let uuid = "euuid";

    let name = "ename";

    let dataset_dir = name_dir(&app.handle().clone(), &uuid, None)?;

    std::fs::create_dir(&dataset_dir)?;

    let check_path = dataset_dir.join("check.txt");

    std::fs::write(check_path, "check")?;

    let file_path = temp_path.join("a.zip");

    add_to_zip(dataset_dir, &file_path)?;

    let mut reader = std::fs::File::open(&file_path)?;

    let mut zip = zip::ZipArchive::new(reader)?;

    for i in 0..zip.len() {
        let mut file = zip.by_index(i)?;

        assert_eq!(file.name(), "check.txt");

        let mut a = String::from("");

        file.read_to_string(&mut a)?;

        assert_eq!(a, "check");
    }

    Ok(())
}
