use super::{head_status::REFS_HEADS_NAMESPACE, Repository};

pub fn default_branch_for_remote(
    repository: &Repository,
    remote: &git2::Remote,
) -> Result<String, crate::Error> {
    let name = match remote.default_branch() {
        Ok(name) => name,
        Err(err) if err.code() == git2::ErrorCode::NotFound => {
            return Err(crate::Error::from_message("remote has no default branch"))
        }
        Err(err) => return Err(err.into()),
    };

    match str::from_utf8(name.as_ref()) {
        Ok(name) => Ok(name
            .strip_prefix(REFS_HEADS_NAMESPACE)
            .unwrap_or(name)
            .to_owned()),
        Err(_) => Err(crate::Error::from_message(
            "default branch name is invalid utf-8",
        )),
    }
}
