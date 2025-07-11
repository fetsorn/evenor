use super::{Repository, Settings};

pub fn default_remote<'a>(
    repository: &'a Repository,
    settings: &Settings,
) -> Result<git2::Remote<'a>, crate::Error> {
    let remote_list = repository.repo.remotes()?;

    let remote_name = match &settings.default_remote {
        Some(default_branch) => default_branch,
        None => match remote_list.len() {
            0 => return Err(crate::Error::from_message("no remotes")),
            1 => match remote_list.get(0) {
                Some(name) => name,
                None => {
                    return Err(crate::Error::from_message(
                        "default remote name is invalid utf-8",
                    ))
                }
            },
            _ => return Err(crate::Error::from_message("no default remote")),
        },
    };

    Ok(repository.repo.find_remote(remote_name)?)
}
