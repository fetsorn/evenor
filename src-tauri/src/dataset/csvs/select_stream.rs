use crate::{Dataset, Result};
use async_stream::try_stream;
use csvs::{select::select_record_stream, types::entry::Entry, types::into_value::IntoValue};
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use serde::Serialize;
use serde_json::Value;
use tauri::{ipc::Channel, Runtime};
use std::path::PathBuf;

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

pub async fn select_stream(
    dataset_dir: PathBuf,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()> {
    let query: Entry = query.try_into().unwrap();

    let query_for_stream = query.clone();

    let readable_stream = try_stream! {
       yield query_for_stream;
    };

    let s = select_record_stream(readable_stream, dataset_dir);

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
