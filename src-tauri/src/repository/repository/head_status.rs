use super::Repository;
use crate::repository::head_status::{HeadStatus, HeadStatusKind};
use bstr::ByteSlice;

pub const HEAD_FILE: &str = "HEAD";
pub const REFS_HEADS_NAMESPACE: &str = "refs/heads/";

pub fn head_status(repository: &Repository) -> Result<HeadStatus, git2::Error> {
    let head = repository.repo.find_reference(HEAD_FILE)?;

    match head.symbolic_target_bytes() {
        // HEAD points to a branch
        Some(name) if name.starts_with(REFS_HEADS_NAMESPACE.as_bytes()) => {
            let name = name[REFS_HEADS_NAMESPACE.len()..].as_bstr().to_string();
            match head.resolve() {
                Ok(_) => Ok(HeadStatus {
                    name,
                    kind: HeadStatusKind::Branch,
                }),
                Err(err)
                    if err.class() == git2::ErrorClass::Reference
                        && err.code() == git2::ErrorCode::NotFound =>
                {
                    Ok(HeadStatus {
                        name,
                        kind: HeadStatusKind::Unborn,
                    })
                }
                Err(err) => Err(err),
            }
        }
        // HEAD points to an oid (is detached)
        _ => {
            let object = head.peel(git2::ObjectType::Any)?;
            let description = object.describe(
                git2::DescribeOptions::new()
                    .describe_tags()
                    .show_commit_oid_as_fallback(true),
            )?;
            let name = description.format(None)?;
            Ok(HeadStatus {
                name,
                kind: HeadStatusKind::Detached,
            })
        }
    }
}
