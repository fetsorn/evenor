use crate::api::{API, IO, Result};
use tauri_plugin_dialog::DialogExt;
use super::add_to_zip::add_to_zip;

pub async fn zip<R>(api: &API<R>) -> Result<()> where R: tauri::Runtime {
    let dataset_dir_path = api.find_dataset()?.expect("no directory");

    let file_path = api
        .app
        .dialog()
        .file()
        .add_filter("My Filter", &["zip"])
        .blocking_save_file();

    let file_path = file_path.unwrap();

    let file_path = file_path.as_path().unwrap();

    add_to_zip(dataset_dir_path, &file_path)?;

    Ok(())
}
