use crate::{dataset::{Dataset, SelectEvent, CSVS}, error::Result};
use serde_json::Value;
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn select<R>(app: AppHandle<R>, uuid: &str, query: Value) -> Result<Vec<Value>>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    let records = Dataset::<R>::select(dataset_dir, query).await?;

    Ok(records)
}

#[tauri::command]
pub async fn select_stream<R>(
    app: AppHandle<R>,
    uuid: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    Dataset::<R>::select_stream(dataset_dir, query, on_event).await?;

    Ok(())
}

#[tauri::command]
pub async fn update_record<R>(app: AppHandle<R>, uuid: &str, record: Value) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    Dataset::<R>::update_record(dataset_dir, record).await?;

    Ok(())
}

#[tauri::command]
pub async fn delete_record<R>(app: AppHandle<R>, uuid: &str, record: Value) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    Dataset::<R>::delete_record(dataset_dir, record).await?;

    Ok(())
}
