use crate::{Mind, Result};
use async_stream::try_stream;
use csvs::{Dataset, Entry, IntoValue};
use futures_core::stream::{BoxStream, Stream};
use std::pin::{Pin, pin};
use tokio::sync::Mutex;
use std::collections::HashMap;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{ipc::Channel, AppHandle, Listener, Manager, Runtime, State};

#[tauri::command]
pub async fn select<R: Runtime>(app: AppHandle<R>, mind: &str, query: Value) -> Result<Vec<Value>> {
    crate::log(&app, "select");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);

    let query = query.try_into()?;

    let entries = dataset.select_record(vec![query]).await?;

    let records = entries.into_iter().map(|e| e.into_value()).collect();

    Ok(records)
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
    crate::log(&app, "select stream");

    // will set on first run, and return false on others
    app.manage(StreamMap {
        stream_map: Default::default(),
    });

    let stream_map: State<'_, StreamMap> = app.state();

    let mind = Mind::new(app.clone(), mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);

    let query: Entry = query.try_into()?;

    // if not started, start the pull stream
    if (stream_map.stream_map.lock().await.get(streamid).is_none()) {
        let readable_stream = try_stream! {
            yield query;
        };

        let s = dataset.select_record_stream(readable_stream);

        stream_map.stream_map.lock().await.insert(streamid.to_string(), s.boxed());
    }

    let mut foo = stream_map.stream_map.lock().await;

    let stream: &mut Pin<Box<dyn Stream<Item = csvs::Result<Entry>> + Send>> = foo.get_mut(streamid).unwrap();

    pin_mut!(stream); // needed for iteration

    let a = stream.next().await;

    if let Some(entry) = a {
        let entry = entry?;

        // if started, return a window of results
        return Ok(SelectNext { done: false, value: Some(entry.into_value()) })
    }

    // if stream ended, return undefined
    Ok(SelectNext { done: true, value: None })
}

#[tauri::command]
pub async fn update_record<R: Runtime>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()> {
    let mind = Mind::new(app.clone(), mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);

    let record = record.try_into()?;

    let a = dataset.update_record(vec![record]).await?;

    Ok(())
}

#[tauri::command]
pub async fn delete_record<R: Runtime>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()> {
    crate::log(&app, "delete record");

    let record = record.try_into()?;

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);

    dataset.delete_record(vec![record]).await?;

    Ok(())
}
