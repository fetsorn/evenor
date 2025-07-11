use crate::{Dataset, Result, Repository};
use std::fs::{create_dir, rename, write};
use tauri::Runtime;

pub async fn make_dataset<R: Runtime>(api: &Dataset<R>, name: Option<&str>) -> Result<()> {
    let dataset_dir = api.name_dataset(name)?;

    if api.uuid == "root" {
        create_dir(dataset_dir)?;

        return Ok(());
    }

    let existing_dataset = api.find_dataset()?;

    match existing_dataset {
        Some(s) => {
            let foo = s;

            if foo != dataset_dir {
                rename(foo, &dataset_dir)?;
            }
        }
        None => {
            create_dir(&dataset_dir)?;

            Repository::init(&dataset_dir)?;

            let gitignore_path = dataset_dir.join(".gitignore");

            write(&gitignore_path, ".DS_Store")?;

            let csvscsv_path = dataset_dir.join(".csvs.csv");

            write(&csvscsv_path, "csvs,0.0.2")?;
        }
    }

    Ok(())
}

mod test {
    use crate::{create_app, Dataset, Result};
    use std::fs::read_dir;
    use tauri::test::{mock_builder, mock_context, noop_assets};
    use tauri::{Manager, State};
    use temp_dir::TempDir;

    #[tokio::test]
    async fn make_dataset_root() -> Result<()> {
        // create a temporary directory, will be deleted by destructor
        // must assign to keep in scope;
        let temp_dir = TempDir::new();

        // reference temp_dir to not move it out of scope
        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

        let app = create_app(mock_builder());

        // save temporary directory path in the tauri state
        app.manage(temp_path.clone());

        let uuid = "root";

        let name = "etest";

        let api = Dataset::new(app.handle().clone(), &uuid);

        api.make_dataset(None).await?;

        // check that repo is created
        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "root");
            });
        });

        let api = Dataset::new(app.handle().clone(), &uuid);

        // must error when root already exists
        let result = api.make_dataset(None).await;

        assert!(result.is_err());

        Ok(())
    }

    #[tokio::test]
    async fn make_dataset_name() -> Result<()> {
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

        api.make_dataset(Some(name)).await?;

        // check that repo is created
        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "euuid-etest");
            });
        });

        let name = "etest1";

        // must rename when root already exists
        let result = api.make_dataset(Some(name)).await;

        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "euuid-etest1");
            });
        });

        Ok(())
    }
}
