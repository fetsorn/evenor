use serde::Serialize;

#[derive(Serialize)]
pub struct HeadStatus {
    pub name: String,
    pub kind: HeadStatusKind,
}

#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
pub enum HeadStatusKind {
    Unborn,
    Detached,
    Branch,
}

impl std::fmt::Display for HeadStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self.kind {
            HeadStatusKind::Unborn | HeadStatusKind::Branch => write!(f, "{}", self.name),
            HeadStatusKind::Detached => write!(f, "({})", self.name),
        }
    }
}

impl HeadStatus {
    pub fn is_branch(&self) -> bool {
        matches!(self.kind, HeadStatusKind::Branch)
    }

    pub fn is_unborn(&self) -> bool {
        matches!(self.kind, HeadStatusKind::Unborn)
    }

    pub fn is_detached(&self) -> bool {
        matches!(self.kind, HeadStatusKind::Detached)
    }

    pub fn on_branch(&self, name: impl AsRef<[u8]>) -> bool {
        match &self.kind {
            HeadStatusKind::Branch | HeadStatusKind::Unborn => {
                self.name.as_bytes() == name.as_ref()
            }
            HeadStatusKind::Detached => false,
        }
    }
}
