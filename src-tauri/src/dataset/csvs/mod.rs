mod delete_record;
mod select;
mod select_stream;
mod update_record;

use crate::{Dataset, Result};
pub use select_stream::SelectEvent;
use serde_json::Value;
use std::path::PathBuf;
use tauri::{ipc::Channel, Runtime};

pub trait CSVS {
    async fn select(dataset_dir: PathBuf, query: Value) -> Result<Vec<Value>>;
    async fn select_stream(
        dataset_dir: PathBuf,
        query: Value,
        on_event: Channel<SelectEvent>,
    ) -> Result<()>;
    async fn update_record(dataset_dir: PathBuf, record: Value) -> Result<()>;
    async fn delete_record(dataset_dir: PathBuf, record: Value) -> Result<()>;
}

impl<R: tauri::Runtime> CSVS for Dataset<R> {
    async fn select(dataset_dir: PathBuf, query: Value) -> Result<Vec<Value>> {
        select::select(dataset_dir, query).await
    }

    async fn select_stream(
        dataset_dir: PathBuf,
        query: Value,
        on_event: Channel<SelectEvent>,
    ) -> Result<()> {
        select_stream::select_stream(dataset_dir, query, on_event).await
    }

    async fn update_record(dataset_dir: PathBuf, record: Value) -> Result<()> {
        update_record::update_record(dataset_dir, record).await
    }

    async fn delete_record(dataset_dir: PathBuf, record: Value) -> Result<()> {
        delete_record::delete_record(dataset_dir, record).await
    }
}
