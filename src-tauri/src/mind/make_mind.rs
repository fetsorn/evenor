use crate::{Error, Mind, Result};
use csvs::Dataset;
use git2kit::Repository;
use std::fs::{create_dir_all, rename, write};
use tauri::Runtime;

pub async fn make_mind<R: Runtime>(mind: &Mind<R>, name: Option<&str>) -> Result<()> {
    let mind_dir = mind.name_mind(name)?;

    let _ = crate::log(&mind.app, "make");

    let _ = crate::log(&mind.app, &mind.mind);

    let _ = crate::log(
        &mind.app,
        mind_dir.clone().into_os_string().to_str().unwrap(),
    );

    let existing_mind = mind.find_mind()?;

    if mind.mind == "root" {
        if existing_mind.is_some()  {
            return Err(Error::from_message("already exists"));
        }

        match create_dir_all(&mind_dir) {
            Ok(_) => (),
            Err(e) => crate::log(&mind.app, &e.to_string())?,
        };

        let _ = crate::log(&mind.app, "created dir");

        let repository = Repository::init(&mind_dir)?;

        repository.commit()?;

        let gitignore_path = mind_dir.join(".gitignore");

        write(&gitignore_path, ".DS_Store")?;

        Dataset::create(&mind_dir, false).await?;

        repository.commit()?;

        return Ok(());
    }

    match existing_mind {
        Some(s) => {
            let existing_dir = s;

            if existing_dir != mind_dir {
                rename(existing_dir, &mind_dir)?;
            }
        }
        None => {
            create_dir_all(&mind_dir)?;

            let repository = Repository::init(&mind_dir)?;

            repository.commit()?;

            let gitignore_path = mind_dir.join(".gitignore");

            write(&gitignore_path, ".DS_Store")?;

            Dataset::create(&mind_dir, false).await?;

            repository.commit()?;
        }
    }

    Ok(())
}

mod test {
    
    
    
    
    

    #[tokio::test]
    async fn make_mind_root() -> Result<()> {
        // create a temporary directory, will be deleted by destructor
        // must assign to keep in scope;
        let temp_dir = TempDir::new();

        // reference temp_dir to not move it out of scope
        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

        let app = create_app(mock_builder());

        // save temporary directory path in the tauri state
        app.manage(temp_path.clone());

        let mind = "root";

        let name = "etest";

        let mind = Mind::new(app.handle().clone(), &mind);

        mind.make_mind(None).await?;

        // check that repo is created
        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "root");
            });
        });

        // must error when root already exists
        let result = mind.make_mind(None).await;

        assert!(result.is_err());

        Ok(())
    }

    #[tokio::test]
    async fn make_mind_name() -> Result<()> {
        // create a temporary directory, will be deleted by destructor
        // must assign to keep in scope;
        let temp_dir = TempDir::new();

        // reference temp_dir to not move it out of scope
        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

        let app = create_app(mock_builder());

        // save temporary directory path in the tauri state
        app.manage(temp_path.clone());

        let mind = "emind";

        let name = "etest";

        let mind = Mind::new(app.handle().clone(), &mind);

        mind.make_mind(Some(name)).await?;

        // check that repo is created
        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "emind-etest");
            });
        });

        let name = "etest1";

        // must rename when root already exists
        let result = mind.make_mind(Some(name)).await;

        read_dir(&temp_path)?.for_each(|entry| {
            let entry = entry.unwrap();

            assert!(entry.file_name() == "store");

            read_dir(entry.path()).unwrap().for_each(|entry| {
                let entry = entry.unwrap();

                assert!(entry.file_name() == "emind-etest1");
            });
        });

        Ok(())
    }
}
