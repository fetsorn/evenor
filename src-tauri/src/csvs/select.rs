use crate::{Dataset, Result};
use async_stream::try_stream;
use csvs::{select::select_record_stream, types::entry::Entry, types::into_value::IntoValue};
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use serde_json::Value;

pub async fn select<R>(api: &Dataset<R>, query: Value) -> Result<Vec<Value>>
where
    R: tauri::Runtime,
{
    let query: Entry = query.try_into().unwrap();

    let dataset_dir_path = api.find_dataset()?.unwrap();

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

mod test {
    use crate::create_app;
    use crate::{Dataset, Result, CSVS};
    use assert_json_diff::assert_json_eq;
    use tauri::test::{mock_builder, mock_context, noop_assets};
    use tauri::Manager;

    //#[tokio::test]
    //async fn select_test() -> Result<()> {
    //    let app = create_app(mock_builder());
    //
    //    let uuid = "a";
    //
    //    // TODO: mock csvs-rs here somewhere
    //    let query = serde_json::json!({ "a": "b" });
    //
    //    let overview = select(app.handle().clone(), uuid, query).await?;
    //
    //    let stub_overview = serde_json::json!({
    //        });
    //
    //    assert_json_eq!(overview, stub_overview);
    //
    //    Ok(())
    //}
}
