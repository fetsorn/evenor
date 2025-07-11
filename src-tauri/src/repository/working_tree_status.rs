use serde::Serialize;

#[derive(Serialize)]
pub struct WorkingTreeStatus {
    pub working_changed: bool,
    pub index_changed: bool,
}

impl WorkingTreeStatus {
    pub fn is_dirty(&self) -> bool {
        self.index_changed || self.working_changed
    }
}
