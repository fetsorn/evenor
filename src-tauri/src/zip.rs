use crate::{dataset::{Dataset, SelectEvent, CSVS}, error::Result};
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn zip<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    dataset.zip().await?;

    Ok(())
}
