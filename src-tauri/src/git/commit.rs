use crate::{Dataset, Result};

pub fn commit<R>(api: &Dataset<R>) -> Result<()>
where
    R: tauri::Runtime,
{
    let dataset_dir_path = api.find_dataset()?.unwrap();

    // need a wrapper over git2 here to impement find_last_commit
    let repo = super::repository::Repository::open(&dataset_dir_path)?;

    repo.commit();

    Ok(())
}

mod test {
    use crate::{create_app, Dataset, Git, Remote, Result};
    use tauri::test::{mock_builder, mock_context, noop_assets};
    use tauri::{Manager, State};

    #[tokio::test]
    async fn commit_test() -> Result<()> {
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

        let api = Dataset::new(app.handle().clone(), &uuid);

        api.create_repo(None).await?;

        api.commit()?;

        // TODO: check that repo comitted

        Ok(())
    }
}
