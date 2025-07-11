use super::Repository;
use std::path::Path;

pub fn commit(repository: &Repository) -> Result<(), git2::Error> {
    let mut index = repository.repo.index().unwrap();

    let mut message = "".to_owned();

    let cb = &mut |path: &Path, _matched_spec: &[u8]| -> i32 {
        let status = repository.repo.status_file(path).unwrap();

        let ret = if status.contains(git2::Status::WT_MODIFIED)
            || status.contains(git2::Status::WT_NEW)
        {
            message = format!("{}, {}", message, path.display());
            0
        } else {
            1
        };

        ret
    };

    let cb = Some(cb as &mut git2::IndexMatchedPath);

    index
        .add_all(["*"].iter(), git2::IndexAddOption::DEFAULT, cb)
        .unwrap();

    let oid = index.write_tree().unwrap();

    let signature = git2::Signature::now("name", "name@mail.com").unwrap();

    let tree = repository.repo.find_tree(oid).unwrap();

    match repository.find_last_commit() {
        Ok(c) => {
            repository.repo.commit(
                Some("HEAD"), //  point HEAD to our new commit
                &signature,   // author
                &signature,   // committer
                &message,     // commit message
                &tree,        // tree
                &[&c],
            )?; // parents
        }
        Err(_) => {
            repository.repo.commit(
                Some("HEAD"), //  point HEAD to our new commit
                &signature,   // author
                &signature,   // committer
                &message,     // commit message
                &tree,        // tree
                &[],
            )?; // parents
        }
    }

    Ok(())
}

//mod test {
//    use crate::{create_app, Dataset, Git, repository::Remote, Result};
//    use tauri::test::{mock_builder, mock_context, noop_assets};
//    use tauri::{Manager, State};
//    use temp_dir::TempDir;
//
//    #[tokio::test]
//    async fn commit_test() -> Result<()> {
//        // create a temporary directory, will be deleted by destructor
//        // must assign to keep in scope;
//        let temp_dir = TempDir::new();
//
//        // reference temp_dir to not move it out of scope
//        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();
//
//        let app = create_app(mock_builder());
//
//        // save temporary directory path in the tauri state
//        app.manage(temp_path.clone());
//
//        let uuid = "euuid";
//
//        let name = "etest";
//
//        let api = Dataset::new(app.handle().clone(), &uuid);
//
//        api.make_dataset(None).await?;
//
//        api.commit()?;
//
//        // TODO: check that repo comitted
//
//        Ok(())
//    }
//}
