use super::Repository;
use std::path::Path;

pub fn try_open(path: &Path) -> crate::Result<Option<Repository>> {
    match git2::Repository::open(path) {
        Ok(repo) => {
            log::debug!("opened repo at `{}`", path.display());
            Ok(Some(Repository { repo }))
        }
        Err(err)
            if err.class() == git2::ErrorClass::Repository
                && err.code() == git2::ErrorCode::NotFound =>
        {
            Ok(None)
        }
        Err(err) => Err(err.into()),
    }
}
