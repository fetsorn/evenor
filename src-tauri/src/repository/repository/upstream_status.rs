use super::Repository;
use crate::repository::head_status::HeadStatus;
use serde::Serialize;

#[derive(Serialize)]
#[serde(tag = "state", rename_all = "snake_case")]
pub enum UpstreamStatus {
    None,
    Upstream { ahead: usize, behind: usize },
    Gone,
}

pub fn upstream_status(
    repository: &Repository,
    head_status: &HeadStatus,
) -> Result<UpstreamStatus, git2::Error> {
    let local_branch = if head_status.is_branch() {
        repository.head_branch()?
    } else {
        return Ok(UpstreamStatus::None);
    };
    let local_oid = local_branch.get().peel_to_commit()?.id();

    let upstream_branch = match local_branch.upstream() {
        Ok(branch) => branch,
        Err(err) => {
            return match (err.code(), err.class()) {
                // No upstream is set in the config
                (git2::ErrorCode::NotFound, git2::ErrorClass::Config) => Ok(UpstreamStatus::None),
                // The upstream is set in the config but no longer exists.
                (git2::ErrorCode::NotFound, git2::ErrorClass::Reference) => {
                    Ok(UpstreamStatus::Gone)
                }
                _ => Err(err),
            };
        }
    };
    let upstream_oid = upstream_branch.get().peel_to_commit()?.id();

    let (ahead, behind) = repository
        .repo
        .graph_ahead_behind(local_oid, upstream_oid)?;

    Ok(UpstreamStatus::Upstream { ahead, behind })
}
