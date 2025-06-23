use crate::create_app;
use crate::error::{Error, Result};
use crate::io::find_dataset;
use tauri::test::{mock_builder, mock_context, noop_assets};
use tauri::Manager;

#[tokio::test]
async fn find_dataset_test() -> Result<()> {
    let app = create_app(mock_builder());

    let uuid = "atest";

    let name = "etest";

    let dir = format!("{uuid}-{name}");

    let dirpath = format!(
        "{}/.local/share/com.evenor/store/{dir}",
        std::env::home_dir().unwrap().to_str().unwrap()
    );

    std::fs::create_dir(&dirpath);

    let dataset = find_dataset(&app.handle(), uuid)?;

    assert_eq!(dataset.to_str().unwrap(), dirpath);

    std::fs::remove_dir(&dirpath);

    Ok(())
}
