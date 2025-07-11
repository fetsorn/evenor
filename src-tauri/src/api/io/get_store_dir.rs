use super::IO;
use crate::api::error::Result;
use crate::api::API;
use std::fs::create_dir;
use std::path::PathBuf;

// ensure app_data_dir/store exists
pub fn get_store_dir<R>(api: &API<R>) -> Result<PathBuf>
where
    R: tauri::Runtime,
{
    let app_data_dir = api.get_app_data_dir()?;

    let store_dir = app_data_dir.join("store");

    if !store_dir.exists() {
        create_dir(&store_dir)?;
    }

    Ok(store_dir)
}
