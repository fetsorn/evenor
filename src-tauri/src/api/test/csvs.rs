use crate::api::{
    csvs::CSVS,
    error::{Error, Result},
    API,
};
use crate::create_app;
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
