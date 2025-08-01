use crate::{Mind, Result};
use async_stream::try_stream;
use csvs::{Dataset, Entry, IntoValue};
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{ipc::Channel, AppHandle, Manager, Runtime};

#[tauri::command]
pub async fn select<R: Runtime>(app: AppHandle<R>, mind: &str, query: Value) -> Result<Vec<Value>> {
    log::info!("select");
            
    crate::log(&app, "select");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);
    
    let query = query.try_into()?;

    let entries = dataset.select_record(vec![query]).await?;

    let records = entries.into_iter().map(|e| e.into_value()).collect();

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
pub async fn select_stream<R: Runtime>(
    app: AppHandle<R>,
    mind: &str,
    query: Value,
    on_event: Channel<SelectEvent>,
) -> Result<()> {
    log::info!("select stream");
    
    crate::log(&app, "select stream");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);
        
    let query: Entry = query.try_into()?;

    let query_for_stream = query.clone();

    let readable_stream = try_stream! {
       yield query_for_stream;
    };

    let s = dataset.select_record_stream(readable_stream);

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
pub async fn update_record<R: Runtime>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()> {
    log::info!("update record");
    
    crate::log(&app, "update record");

    let mind = Mind::new(app.clone(), mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);
    
    let record = record.try_into()?;

    dataset.update_record(vec![record]).await?;
        
    crate::log(&app, "di");

    Ok(())
}

#[tauri::command]
pub async fn delete_record<R: Runtime>(app: AppHandle<R>, mind: &str, record: Value) -> Result<()> {
    log::info!("delete record");
    
    crate::log(&app, "delete record");

    let record = record.try_into()?;

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let dataset = Dataset::new(&mind_dir);

    dataset.delete_record(vec![record]).await?;

    Ok(())
}
