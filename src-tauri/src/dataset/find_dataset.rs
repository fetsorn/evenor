use crate::{Dataset, Result};
use regex::Regex;
use std::fs::{create_dir, read_dir};
use std::path::PathBuf;
use tauri::Runtime;

// find ^uuid in app_data_dir
pub fn find_dataset<R: Runtime>(dataset: &Dataset<R>) -> Result<Option<PathBuf>> {
    let store_dir = dataset.get_store_dir()?;

    let existing_entry = read_dir(store_dir)?
        .map(|res| res.map(|e| e.path()))
        .find(|entry| {
            let entry = match entry {
                Err(_) => return false,
                Ok(e) => e,
            };

            let file_name = entry.file_name();

            let entry_path = match file_name {
                None => return false,
                Some(p) => p,
            };

            let s = entry_path.to_str();

            let s = match s {
                None => return false,
                Some(s) => s,
            };

            Regex::new(&format!("^{}", dataset.uuid))
                .unwrap()
                .is_match(s)
        });

    let existing_dataset: Option<PathBuf> = match existing_entry {
        None => None,
        Some(res) => match res {
            Err(e) => None,
            Ok(p) => Some(p),
        },
    };

    Ok(existing_dataset)
}

mod test {
    use crate::create_app;
    use crate::{Dataset, Result};
    use std::fs::create_dir;
    use tauri::test::{mock_builder, mock_context, noop_assets};
    use tauri::Manager;
    use temp_dir::TempDir;

    #[tokio::test]
    async fn find_dataset_test() -> Result<()> {
        // create a temporary directory, will be deleted by destructor
        // must assign to keep in scope;
        let temp_dir = TempDir::new();

        // reference temp_dir to not move it out of scope
        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

        let app = create_app(mock_builder());

        // save temporary directory path in the tauri state
        app.manage(temp_path.clone());

        let uuid = "atest";

        let name = "etest";

        let dir = format!("{uuid}-{name}");

        let storepath = temp_path.join("store");

        create_dir(&storepath)?;

        let dirpath = storepath.join(dir);

        create_dir(&dirpath)?;

        let dataset = Dataset::new(app.handle().clone(), uuid);

        let dataset = dataset.find_dataset()?.unwrap();

        assert_eq!(dataset, dirpath);

        Ok(())
    }
}
