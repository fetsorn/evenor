use crate::api::error::Result;
use crate::api::API;
use std::path::PathBuf;
use tauri::{Manager, State};

#[cfg(test)]
pub fn get_app_data_dir<R>(api: &API<R>) -> Result<PathBuf>
where
    R: tauri::Runtime,
{
    // state is initialized in the test case
    // /tmp/t####-0 on linux
    let temp_path: State<PathBuf> = api.app.state();

    // reference to get inner out of state, then clone to move out of scope
    let app_data_dir: PathBuf = temp_path.inner().clone();

    Ok(app_data_dir)
}

#[cfg(not(test))]
pub fn get_app_data_dir<R>(api: &API<R>) -> Result<PathBuf>
where
    R: tauri::Runtime,
{
    // .local/share on linux
    Ok(api.app.path().app_data_dir()?)
}
