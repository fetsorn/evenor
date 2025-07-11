use crate::{Dataset, Result};
use csvs::{delete, types::entry::Entry};
use serde_json::Value;
use tauri::Runtime;

pub async fn delete_record<R: Runtime>(api: &Dataset<R>, record: Value) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = api.find_dataset()?.unwrap();

    // TODO rewrite to record.delete after csvs-rs refactor
    delete::delete_record(dataset_dir_path, vec![record]).await;

    Ok(())
}
