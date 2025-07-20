use crate::{Dataset, Result};
use std::path::PathBuf;
use tauri::Runtime;

// make a path for store/uuid-name
pub fn name_dataset<R: Runtime>(dataset: &Dataset<R>, name: Option<&str>) -> Result<PathBuf> {
    let store_dir = dataset.get_store_dir()?;

    let dataset_filename = match name {
        None => &dataset.uuid,
        Some(s) => &format!("{}-{}", dataset.uuid, s),
    };

    let dataset_dir = store_dir.join(dataset_filename);

    Ok(dataset_dir)
}
