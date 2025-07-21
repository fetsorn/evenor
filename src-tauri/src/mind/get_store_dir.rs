use crate::{Mind, Result};
use std::fs::create_dir;
use std::path::PathBuf;
use tauri::Runtime;

// ensure app_data_dir/store exists
pub fn get_store_dir<R: Runtime>(mind: &Mind<R>) -> Result<PathBuf> {
    let app_data_dir = mind.get_app_data_dir()?;

    let store_dir = app_data_dir.join("store");

    if !store_dir.exists() {
        create_dir(&store_dir)?;
    }

    Ok(store_dir)
}
