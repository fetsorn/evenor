use crate::api::{error::Result, io::IO, API};
use std::fs::{create_dir, rename};

pub async fn create_repo<R>(api: &API<R>, name: Option<&str>) -> Result<()>
where
    R: tauri::Runtime,
{
    let dataset_dir = api.name_dir(name)?;

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

            match git2::Repository::init(&dataset_dir) {
                Ok(repo) => repo,
                Err(e) => panic!("failed to init: {}", e),
            };

            let gitignore_path = dataset_dir.join(".gitignore");

            std::fs::write(&gitignore_path, ".DS_Store")?;

            let csvscsv_path = dataset_dir.join(".csvs.csv");

            std::fs::write(&csvscsv_path, "csvs,0.0.2")?;
        }
    }

    Ok(())
}

mod test {
    use crate::api::{
        error::{Error, Result},
        git::{Git, Remote},
        API,
    };
    use crate::create_app;
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
}
