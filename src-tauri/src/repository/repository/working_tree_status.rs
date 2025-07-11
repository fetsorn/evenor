use super::Repository;
use crate::repository::working_tree_status::WorkingTreeStatus;

pub fn working_tree_status(repository: &Repository) -> Result<WorkingTreeStatus, git2::Error> {
    let statuses = repository.repo.statuses(Some(
        git2::StatusOptions::new()
            .exclude_submodules(true)
            .include_ignored(false),
    ))?;

    let mut result = WorkingTreeStatus {
        working_changed: false,
        index_changed: false,
    };

    let working_changed_mask = git2::Status::WT_NEW
        | git2::Status::WT_MODIFIED
        | git2::Status::WT_DELETED
        | git2::Status::WT_RENAMED
        | git2::Status::WT_TYPECHANGE;
    let index_changed_mask = git2::Status::INDEX_NEW
        | git2::Status::INDEX_MODIFIED
        | git2::Status::INDEX_DELETED
        | git2::Status::INDEX_RENAMED
        | git2::Status::INDEX_TYPECHANGE
        | git2::Status::CONFLICTED;

    for entry in statuses.iter() {
        let status = entry.status();

        result.working_changed |= status.intersects(working_changed_mask);
        result.index_changed |= status.intersects(index_changed_mask);
    }

    Ok(result)
}
