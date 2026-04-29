use mindzoo::mind::Mind;
use crate::Result;
use crate::fs::get_app_data_dir;
use async_stream::try_stream;
use csvs::{Dataset, Entry, IntoValue};
use futures_core::stream::Stream;
use std::pin::Pin;
use tokio::sync::Mutex;
use std::collections::HashMap;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use serde::Serialize;
use serde_json::Value;
use tauri::{AppHandle, Manager, Runtime, State};

#[tauri::command]
pub async fn csvsinit<R: Runtime>(app: AppHandle<R>, mind: &str) -> Result<()> {
    let path = get_app_data_dir(app)?;

    let mind = Mind::new(path, mind);

    let mind_dir = mind.find_mind()?.ok_or_else(|| crate::Error::from_message("mind not found"))?;

    Dataset::create(&mind_dir, false).await?;

    Ok(())
}

#[tauri::command]
pub async fn select<R: Runtime>(app: AppHandle<R>, mind: &str, query: Value) -> Result<Vec<Value>> {
    //let _ = crate::log(&app, "select");

    let path = get_app_data_dir(app)?;

    let mind = Mind::new(path, mind);

    let mind_dir = mind.find_mind()?.ok_or_else(|| crate::Error::from_message("mind not found"))?;

    let dataset = Dataset::open(&mind_dir).await?;

    let query = query.try_into()?;

    let entries = dataset.select_record(vec![query]).await?;

    let records = entries.into_iter().map(|e| e.into_value()).collect();

    Ok(records)
}

#[tauri::command]
pub async fn build_record<R: Runtime>(
    app: AppHandle<R>,
    mind: &str,
    query: Value,
) -> Result<Value> {
    let path = get_app_data_dir(app)?;

    let mind = Mind::new(path, mind);

    let mind_dir = mind.find_mind()?.ok_or_else(|| crate::Error::from_message("mind not found"))?;

    let dataset = Dataset::open(&mind_dir).await?;

    let query: Entry = query.try_into()?;

    let record = dataset.build_record(query).await?;

    Ok(record.into_value())
}

#[derive(Debug, Clone, Serialize)]
pub struct SelectNext {
    pub done: bool,
    pub value: Option<Value>,
}

pub struct StreamMap {
    pub stream_map: Mutex<HashMap<String, Pin<Box<dyn Stream<Item = csvs::Result<Entry>> + Send>>>>
}

#[tauri::command]
pub async fn select_stream<R: Runtime>(
    app: AppHandle<R>,
    mind: &str,
    streamid: &str,
    query: Value,
) -> Result<SelectNext> {
    //let _ = crate::log(&app, "select stream");
    let path = get_app_data_dir(app.clone())?;

    // will set on first run, and return false on others
    app.manage(StreamMap {
        stream_map: Default::default(),
    });

    let stream_map: State<'_, StreamMap> = app.state();

    let mind = Mind::new(path, mind);

    let mind_dir = mind.find_mind()?.ok_or_else(|| crate::Error::from_message("mind not found"))?;

    let dataset = Dataset::open(&mind_dir).await?;

    let query: Entry = query.try_into()?;

    // if not started, start the pull stream
    if stream_map.stream_map.lock().await.get(streamid).is_none()  {
        let readable_stream = try_stream! {
            yield query;
        };

        let s = dataset.select_record_stream(readable_stream, true);

        stream_map.stream_map.lock().await.insert(streamid.to_string(), s.boxed());
    }

    let mut guard = stream_map.stream_map.lock().await;

    let stream: &mut Pin<Box<dyn Stream<Item = csvs::Result<Entry>> + Send>> = guard.get_mut(streamid).unwrap();

    pin_mut!(stream); // needed for iteration

    let next = stream.next().await;

    if let Some(entry) = next {
        let entry = entry?;

        // if started, return a window of results
        return Ok(SelectNext { done: false, value: Some(entry.into_value()) })
    }

    // stream ended, remove it from the map to avoid memory leak
    drop(guard);
    stream_map.stream_map.lock().await.remove(streamid);

    Ok(SelectNext { done: true, value: None })
}

#[tauri::command]
pub async fn update_record<R: Runtime>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()> {
    let path = get_app_data_dir(app)?;

    let mind = Mind::new(path, mind);

    let mind_dir = mind.find_mind()?.ok_or_else(|| crate::Error::from_message("mind not found"))?;

    let dataset = Dataset::open(&mind_dir).await?;

    let record = record.try_into()?;

    let _a = dataset.update_record(vec![record]).await?;

    Ok(())
}

#[tauri::command]
pub async fn delete_record<R: Runtime>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()> {
    //let _ = crate::log(&app, "delete record");
    let path = get_app_data_dir(app)?;

    let record = record.try_into()?;

    let mind = Mind::new(path, mind);

    let mind_dir = mind.find_mind()?.ok_or_else(|| crate::Error::from_message("mind not found"))?;

    let dataset = Dataset::open(&mind_dir).await?;

    dataset.delete_record(vec![record]).await?;

    Ok(())
}
