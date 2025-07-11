use super::IO;
use crate::api::error::Result;
use crate::api::API;
use std::path::PathBuf;

// make a path for store/uuid-name
pub fn name_dir<R>(api: &API<R>, name: Option<&str>) -> Result<PathBuf>
where
    R: tauri::Runtime,
{
    let store_dir = api.get_store_dir()?;

    let dataset_filename = match name {
        None => &api.uuid,
        Some(s) => &format!("{}-{}", api.uuid, s),
    };

    let dataset_dir = store_dir.join(dataset_filename);

    Ok(dataset_dir)
}
