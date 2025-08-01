use super::Mind;
use crate::Result;
use std::path::PathBuf;
use tauri::{Manager, Runtime, State};

pub fn get_app_data_dir<R: Runtime>(mind: &Mind<R>) -> Result<PathBuf> {
    // initialized with .manage() on app creation
    // in tests as temporary path, /tmp/t####-0 on linux
    // in production from cli arguments or xdg, ~/.local/share/com.evenor on linux
    let data_dir: State<PathBuf> = mind.app.state();

    let app_data_dir: PathBuf = data_dir.inner().clone();

    Ok(app_data_dir)
}
