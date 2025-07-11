mod open;
mod init;
mod clone;
mod status;
mod try_open;
mod head_status;
mod upstream_status;
mod working_tree_status;
mod pull;
mod create_unborn;
mod fast_forward;
mod create_branch;
mod switch_branch;
mod switch;
mod head_branch;
mod default_remote;
mod default_branch_for_remote;
mod try_default_branch;
mod commit;
mod find_last_commit;

pub use upstream_status::UpstreamStatus;

use super::{head_status::HeadStatus, repository_status::RepositoryStatus, remote::Remote, working_tree_status::WorkingTreeStatus, settings::Settings};
use std::path::{Path, PathBuf};

pub struct Repository {
    repo: git2::Repository,
}

impl Repository {
    pub fn init(path: &Path) -> crate::Result<Self> {
        init::init(path)
    }

    pub fn open(path: &Path) -> crate::Result<Self> {
        open::open(path)
    }

    pub async fn clone(
        dataset_dir: PathBuf,
        name: Option<String>,
        remote: &Remote,
    ) -> crate::Result<Self> {
        clone::clone(dataset_dir, name, remote).await
    }

    pub fn status(
        &self,
        settings: &Settings,
    ) -> crate::Result<(RepositoryStatus, Option<git2::Remote>)> {
        status::status(self, settings)
    }

    pub fn try_open(path: &Path) -> crate::Result<Option<Self>> {
        try_open::try_open(path)
    }

    pub fn head_status(&self) -> Result<HeadStatus, git2::Error> {
        head_status::head_status(self)
    }

    pub fn upstream_status(&self, head_status: &HeadStatus) -> Result<upstream_status::UpstreamStatus, git2::Error> {
        upstream_status::upstream_status(self, head_status)
    }

    pub fn working_tree_status(&self) -> Result<WorkingTreeStatus, git2::Error> {
        working_tree_status::working_tree_status(self)
    }

    pub fn pull<F>(
        &self,
        settings: &Settings,
        status: &RepositoryStatus,
        remote: Option<git2::Remote>,
        switch: bool, // whether to switch to the default branch before pulling
        mut progress_callback: F,
    ) -> crate::Result<pull::PullOutcome>
    where
        F: FnMut(git2::Progress),
    {
        pull::pull(self, settings, status, remote, switch, progress_callback)
    }

    fn create_unborn(
        &self,
        status: &RepositoryStatus,
        fetch_commit: git2::AnnotatedCommit,
    ) -> Result<(), git2::Error> {
        create_unborn::create_unborn(self, status, fetch_commit)
    }

    fn fast_forward(&self, fetch_commit: git2::AnnotatedCommit) -> Result<(), git2::Error> {
        fast_forward::fast_forward(self, fetch_commit)
    }

    pub fn create_branch(&self, settings: &Settings, name: &str) -> crate::Result<()> {
        create_branch::create_branch(self, settings, name)
    }

    fn switch_branch(&self, branch_name: &str) -> Result<(), git2::Error> {
        switch_branch::switch_branch(self, branch_name)
    }

    fn switch(&self, reference: &git2::Reference) -> Result<(), git2::Error> {
        switch::switch(self, reference)
    }

    fn head_branch(&self) -> Result<git2::Branch<'_>, git2::Error> {
        head_branch::head_branch(self)
    }

    fn default_remote(&self, settings: &Settings) -> Result<git2::Remote, crate::Error> {
        default_remote::default_remote(self, settings)
    }

    fn default_branch_for_remote(&self, remote: &git2::Remote) -> Result<String, crate::Error> {
        default_branch_for_remote::default_branch_for_remote(self, remote)
    }

    fn try_default_branch(&self, settings: &Settings) -> (Option<String>, Option<git2::Remote>) {
        try_default_branch::try_default_branch(self, settings)
    }

    pub fn commit(&self) -> Result<(), git2::Error> {
        commit::commit(self)
    }

    fn find_last_commit(&self) -> Result<git2::Commit, git2::Error> {
        find_last_commit::find_last_commit(self)
    }

    pub fn find_remote(&self, remote: &str) -> Result<git2::Remote, git2::Error> {
        self.repo.find_remote(remote)
    }

    pub fn remote(&self, name: &str, url: &str) -> Result<git2::Remote, git2::Error> {
        self.repo.remote(name, url)
    }

    pub fn remotes(&self) -> Result<Vec<String>, git2::Error> {
        let remotes = self.repo
            .remotes()?
            .iter()
            .flatten()
            .map(String::from)
            .collect::<Vec<_>>();

        Ok(remotes)
    }
}
