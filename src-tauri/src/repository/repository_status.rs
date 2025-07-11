use super::{
    head_status::HeadStatus, repository::UpstreamStatus, working_tree_status::WorkingTreeStatus,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct RepositoryStatus {
    pub head: HeadStatus,
    pub upstream: UpstreamStatus,
    pub working_tree: WorkingTreeStatus,
    pub default_branch: Option<String>,
}

impl RepositoryStatus {
    pub fn on_default_branch(&self) -> bool {
        match &self.default_branch {
            Some(name) => self.head.on_branch(&name),
            None => false,
        }
    }
}
