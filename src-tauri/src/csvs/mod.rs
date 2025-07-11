mod delete_record;
mod select;
mod select_stream;
mod update_record;

use crate::{Dataset, Result};
pub use select_stream::SelectEvent;
use serde_json::Value;
use tauri::{ipc::Channel, Runtime};

pub trait CSVS {
    async fn select(&self, query: Value) -> Result<Vec<Value>>;
    async fn select_stream(&self, query: Value, on_event: Channel<SelectEvent>) -> Result<()>;
    async fn update_record(&self, record: Value) -> Result<()>;
    async fn delete_record(&self, record: Value) -> Result<()>;
}

impl<R: Runtime> CSVS for Dataset<R> {
    async fn select(&self, query: Value) -> Result<Vec<Value>> {
        select::select(self, query).await
    }

    async fn select_stream(&self, query: Value, on_event: Channel<SelectEvent>) -> Result<()> {
        select_stream::select_stream(self, query, on_event).await
    }

    async fn update_record(&self, record: Value) -> Result<()> {
        update_record::update_record(self, record).await
    }

    async fn delete_record(&self, record: Value) -> Result<()> {
        delete_record::delete_record(self, record).await
    }
}
