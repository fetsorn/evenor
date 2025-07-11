use super::Repository;

pub fn switch(repository: &Repository, reference: &git2::Reference) -> Result<(), git2::Error> {
    repository.repo.checkout_tree(
        &reference.peel(git2::ObjectType::Tree)?,
        Some(git2::build::CheckoutBuilder::new().safe()),
    )?;

    repository
        .repo
        .set_head(reference.name().expect("ref name is invalid utf-8"))?;

    Ok(())
}
