use super::{Repository, Settings};

pub fn create_branch(
    repository: &Repository,
    settings: &Settings,
    name: &str,
) -> crate::Result<()> {
    let commit = match &settings.default_branch {
        Some(default_branch) => repository
            .repo
            .find_branch(default_branch, git2::BranchType::Local)?
            .get()
            .peel_to_commit()?,
        None => repository.repo.head()?.peel_to_commit()?,
    };

    let working_tree_status = repository.working_tree_status()?;

    if working_tree_status.is_dirty() {
        return Err(crate::Error::from_message(
            "working tree has uncommitted changes",
        ));
    }

    let branch = repository.repo.branch(name, &commit, false)?;

    repository.switch(&branch.into_reference())?;

    Ok(())
}
