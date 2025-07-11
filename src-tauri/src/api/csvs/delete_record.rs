use super::CSVS;
use crate::api::error::{Error, Result};
use crate::api::{io::IO, API};
use csvs::{delete, types::entry::Entry};
use serde_json::Value;

pub async fn delete_record<R>(api: &API<R>, record: Value) -> Result<()>
where
    R: tauri::Runtime,
{
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = api.find_dataset()?.unwrap();

    delete::delete_record(dataset_dir_path, vec![record]).await;

    Ok(())
}
