use super::working_tree_status::WorkingTreeStatus;
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Debug, Default, Deserialize, Clone)]
#[serde(rename_all = "kebab-case")]
pub struct Settings {
    pub default_branch: Option<String>,
    pub default_remote: Option<String>,
    pub ssh: Option<SshSettings>,
    pub editor: Option<String>,
    pub ignore: Option<bool>,
    pub prune: Option<bool>,
}

#[derive(Debug, Default, Deserialize, Clone)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub struct SshSettings {
    pub passphrase: Option<String>,
    pub public_key_path: Option<PathBuf>,
    pub private_key_path: PathBuf,
}
