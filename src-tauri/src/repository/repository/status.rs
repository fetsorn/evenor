use super::Repository;
use crate::repository::{repository_status::RepositoryStatus, Settings};

pub fn status<'a>(
    repository: &'a Repository,
    settings: &Settings,
) -> crate::Result<(RepositoryStatus, Option<git2::Remote<'a>>)> {
    let head = repository.head_status()?;
    let upstream = repository.upstream_status(&head)?;
    let working_tree = repository.working_tree_status()?;

    let (default_branch, remote) = repository.try_default_branch(settings);

    Ok((
        RepositoryStatus {
            head,
            upstream,
            working_tree,
            default_branch,
        },
        remote,
    ))
}
