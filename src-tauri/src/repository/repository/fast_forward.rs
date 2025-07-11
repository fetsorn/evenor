use super::Repository;
use bstr::ByteSlice;

pub fn fast_forward(
    repository: &Repository,
    fetch_commit: git2::AnnotatedCommit,
) -> Result<(), git2::Error> {
    let mut branch = repository.head_branch()?;

    let log_message = format!(
        "multi-git: fast-forwarding branch {} to {}",
        branch.name_bytes()?.as_bstr(),
        fetch_commit.id(),
    );

    debug_assert!(branch.is_head());
    repository.repo.checkout_tree(
        &repository.repo.find_object(fetch_commit.id(), None)?,
        Some(git2::build::CheckoutBuilder::new().safe()),
    )?;
    branch
        .get_mut()
        .set_target(fetch_commit.id(), &log_message)?;
    Ok(())
}
