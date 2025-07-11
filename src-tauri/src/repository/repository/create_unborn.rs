use super::{Repository, RepositoryStatus};

pub fn create_unborn(
    repository: &Repository,
    status: &RepositoryStatus,
    fetch_commit: git2::AnnotatedCommit,
) -> Result<(), git2::Error> {
    debug_assert!(status.head.is_unborn());

    let commit = repository.repo.find_commit(fetch_commit.id())?;

    let branch = repository.repo.branch(&status.head.name, &commit, false)?;

    repository.switch(&branch.into_reference())?;

    Ok(())
}
