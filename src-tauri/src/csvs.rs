use crate::error::{Error, Result};
use crate::io::find_dataset;
use async_stream::try_stream;
use csvs::{
    delete, select::select_record_stream, types::entry::Entry, types::into_value::IntoValue, update,
};
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use serde::Serialize;
use serde_json::Value;
use tauri::{ipc::Channel, AppHandle};

#[tauri::command]
pub async fn select<R: tauri::Runtime>(
    app: AppHandle<R>,
    uuid: &str,
    query: Value,
) -> Result<Vec<Value>> {
    let query: Entry = query.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?.unwrap();

    // needed to clone for the stream scope
    let query_for_stream = query.clone();

    let readable_stream = try_stream! {
        yield query_for_stream;
    };

    let s = select_record_stream(readable_stream, dataset_dir_path);

    pin_mut!(s); // needed for iteration

    let mut records: Vec<Value> = vec![];

    while let Some(entry) = s.next().await {
        let entry = entry?;

        records.push(entry.into_value())
    }

    Ok(records)
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum SelectEvent {
    #[serde(rename_all = "camelCase")]
    Started { query: Value },
    #[serde(rename_all = "camelCase")]
    Progress { query: Value, entry: Value },
    #[serde(rename_all = "camelCase")]
    Finished { query: Value },
}

#[tauri::command]
pub async fn select_stream<R: tauri::Runtime>(
    app: AppHandle<R>,
    uuid: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()> {
    let query: Entry = query.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?.unwrap();

    let query_for_stream = query.clone();

    let readable_stream = try_stream! {
        yield query_for_stream;
    };

    let s = select_record_stream(readable_stream, dataset_dir_path);

    pin_mut!(s); // needed for iteration

    on_event
        .send(SelectEvent::Started {
            query: query.clone().into_value(),
        })
        .unwrap();

    while let Some(entry) = s.next().await {
        let entry = entry?;

        on_event
            .send(SelectEvent::Progress {
                query: query.clone().into_value(),
                entry: entry.into_value(),
            })
            .unwrap();
    }

    on_event
        .send(SelectEvent::Finished {
            query: query.into_value(),
        })
        .unwrap();

    Ok(())
}

#[tauri::command]
pub async fn update_record<R: tauri::Runtime>(
    app: AppHandle<R>,
    uuid: &str,
    record: Value,
) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?.unwrap();

    update::update_record(dataset_dir_path, vec![record]).await;

    Ok(())
}

#[tauri::command]
pub async fn delete_record<R: tauri::Runtime>(
    app: AppHandle<R>,
    uuid: &str,
    record: Value,
) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    let dataset_dir_path = find_dataset(&app, uuid)?.unwrap();

    delete::delete_record(dataset_dir_path, vec![record]).await;

    Ok(())
}
