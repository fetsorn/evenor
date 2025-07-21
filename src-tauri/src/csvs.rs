use crate::{mind::{Mind, SelectEvent, CSVS}, error::Result};
use serde_json::Value;
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn select<R>(app: AppHandle<R>, mind: &str, query: Value) -> Result<Vec<Value>>
where
    R: Runtime,
{
    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let records = Mind::<R>::select(mind_dir, query).await?;

    Ok(records)
}

#[tauri::command]
pub async fn select_stream<R>(
    app: AppHandle<R>,
    mind: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()>
where
    R: Runtime,
{
    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    Mind::<R>::select_stream(mind_dir, query, on_event).await?;

    Ok(())
}

#[tauri::command]
pub async fn update_record<R>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()>
where
    R: Runtime,
{
    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    Mind::<R>::update_record(mind_dir, record).await?;

    Ok(())
}

#[tauri::command]
pub async fn delete_record<R>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()>
where
    R: Runtime,
{
    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    Mind::<R>::delete_record(mind_dir, record).await?;

    Ok(())
}
