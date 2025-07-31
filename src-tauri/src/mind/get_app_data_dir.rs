use super::Mind;
use crate::Result;
use std::path::PathBuf;
use tauri::{Manager, Runtime, State};
use std::fs::create_dir;

pub fn get_app_data_dir<R: Runtime>(mind: &Mind<R>) -> Result<PathBuf> {
    // initialized with .manage() on app creation
    // in tests as temporary path, /tmp/t####-0 on linux
    // in production from cli arguments or xdg, ~/.loca/share/com.evenor on linux
    let data_dir: State<PathBuf> = mind.app.state();

    let app_data_dir: PathBuf = data_dir.inner().clone();

    create_dir(&app_data_dir);

    // mind.app.path().app_data_dir()?
    // .local/share on linux
    Ok(app_data_dir)
}
