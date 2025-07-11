use crate::{Dataset, Result};
use csvs::{types::entry::Entry, update};
use serde_json::Value;
use tauri::Runtime;

pub async fn update_record<R: Runtime>(api: &Dataset<R>, record: Value) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = api.find_dataset()?.unwrap();

    // TODO rewrite to record.update after csvs-rs refactor
    update::update_record(dataset_dir_path, vec![record]).await;

    Ok(())
}
