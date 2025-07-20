use super::Dataset;
use crate::Result;
use std::path::PathBuf;
use tauri::{Manager, Runtime, State};

#[cfg(test)]
pub fn get_app_data_dir<R: Runtime>(dataset: &Dataset<R>) -> Result<PathBuf> {
    // state is initialized in the test case
    // /tmp/t####-0 on linux
    let temp_path: State<PathBuf> = dataset.app.state();

    // reference to get inner out of state, then clone to move out of scope
    let app_data_dir: PathBuf = temp_path.inner().clone();

    Ok(app_data_dir)
}

#[cfg(not(test))]
pub fn get_app_data_dir<R: Runtime>(dataset: &Dataset<R>) -> Result<PathBuf> {
    // .local/share on linux
    Ok(dataset.app.path().app_data_dir()?)
}
