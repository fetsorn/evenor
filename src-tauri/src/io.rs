use crate::error::{Error, Result};
use regex::Regex;
use std::fs::read_dir;
use tauri::{AppHandle, Manager};

// find ^uuid in .local/share
pub fn find_dataset<R: tauri::Runtime>(
    app: &AppHandle<R>,
    uuid: &str,
) -> Result<std::path::PathBuf> {
    let store_dir = app.path().app_data_dir()?.join("store");

    let existing_dataset = read_dir(store_dir)?.find(|entry| {
        let entry = entry.as_ref().unwrap();

        let file_name = entry.file_name();

        let entry_path: &str = file_name.to_str().unwrap();

        Regex::new(&format!("^{}", uuid))
            .unwrap()
            .is_match(entry_path)
    });

    match existing_dataset {
        None => Err(tauri::Error::UnknownPath.into()),
        Some(dataset_dir) => Ok(dataset_dir?.path()),
    }
}
