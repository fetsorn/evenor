use crate::{Mind, Result};
use std::path::PathBuf;
use tauri::Runtime;

// make a path for store/mind-name
pub fn name_mind<R: Runtime>(mind: &Mind<R>, name: Option<&str>) -> Result<PathBuf> {
    let store_dir = mind.get_store_dir()?;

    let mind_filename = match name {
        None => &mind.mind,
        Some(s) => &format!("{}-{}", mind.mind, s),
    };

    let mind_dir = store_dir.join(mind_filename);

    Ok(mind_dir)
}
