use crate::{Dataset, Result};
use csvs::{types::entry::Entry, update};
use serde_json::Value;

pub async fn update_record<R>(api: &Dataset<R>, record: Value) -> Result<()>
where
    R: tauri::Runtime,
{
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = api.find_dataset()?.unwrap();

    update::update_record(dataset_dir_path, vec![record]).await;

    Ok(())
}
