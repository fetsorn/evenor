mod add_remote;
mod clone;
mod commit;
mod create_repo;
mod get_remote;
mod list_remotes;
mod pull;
mod push;
mod remote;
mod repository;

use crate::{Dataset, Result};
pub use remote::Remote;

pub trait Git {
    async fn create_repo(&self, name: Option<&str>) -> Result<()>;
    async fn clone(&self, name: Option<String>, remote: &Remote) -> Result<()>;
    async fn pull(&self, remote: &Remote) -> Result<()>;
    async fn push(&self, remote: &Remote) -> Result<()>;
    async fn list_remotes(&self) -> Result<Vec<String>>;
    async fn add_remote(&self, remote: &Remote) -> Result<()>;
    async fn get_remote(&self, remote: &Remote) -> Result<(String, String)>;
    fn commit(&self) -> Result<()>;
}

impl<R> Git for Dataset<R>
where
    R: tauri::Runtime,
{
    async fn create_repo(&self, name: Option<&str>) -> Result<()> {
        create_repo::create_repo(self, name).await
    }

    async fn clone(&self, name: Option<String>, remote: &Remote) -> Result<()> {
        clone::clone(self, name, remote).await
    }

    async fn pull(&self, remote: &Remote) -> Result<()> {
        pull::pull(self, remote).await
    }

    async fn push(&self, remote: &Remote) -> Result<()> {
        push::push(self, remote).await
    }

    async fn list_remotes(&self) -> Result<Vec<String>> {
        list_remotes::list_remotes(self).await
    }

    async fn add_remote(&self, remote: &Remote) -> Result<()> {
        add_remote::add_remote(self, remote).await
    }

    async fn get_remote(&self, remote: &Remote) -> Result<(String, String)> {
        get_remote::get_remote(self, remote).await
    }

    fn commit(&self) -> Result<()> {
        commit::commit(self)
    }
}
