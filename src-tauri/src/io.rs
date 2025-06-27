use crate::error::{Error, Result};
use regex::Regex;
use std::fs::read_dir;
use std::fs::{create_dir, rename};
use std::path::PathBuf;
use tauri::{Manager, Runtime, State};

#[cfg(test)]
fn get_app_data_dir<'a, R, T>(app: &'a T) -> Result<PathBuf>
where
    R: Runtime,
    T: Manager<R>,
{
    // state is initialized in the test case
    // /tmp/t####-0 on linux
    let temp_path: State<PathBuf> = app.state();

    // reference to get inner out of state, then clone to move out of scope
    let app_data_dir: PathBuf = temp_path.inner().clone();

    Ok(app_data_dir)
}

#[cfg(not(test))]
fn get_app_data_dir<R, T>(app: &T) -> Result<PathBuf>
where
    R: Runtime,
    T: Manager<R>,
{
    // .local/share on linux
    Ok(app.path().app_data_dir()?)
}

// ensure app_data_dir/store exists
pub fn get_store_dir<R, T>(app: &T) -> Result<PathBuf>
where
    R: Runtime,
    T: Manager<R>,
{
    let app_data_dir = get_app_data_dir(app)?;

    let store_dir = app_data_dir.join("store");

    if !store_dir.exists() {
        create_dir(&store_dir)?;
    }

    Ok(store_dir)
}

// make a path for store/uuid-name
pub fn name_dir<R, T>(app: &T, uuid: &str, name: Option<&str>) -> Result<PathBuf>
where
    R: Runtime,
    T: Manager<R>,
{
    let store_dir = get_store_dir(app)?;

    let dataset_filename = match name {
        None => uuid,
        Some(s) => &format!("{}-{}", uuid, s),
    };

    let dataset_dir = store_dir.join(dataset_filename);

    Ok(dataset_dir)
}

// find ^uuid in app_data_dir
pub fn find_dataset<R, T>(app: &T, uuid: &str) -> Result<Option<PathBuf>>
where
    R: Runtime,
    T: Manager<R>,
{
    let store_dir = get_store_dir(app)?;

    let existing_entry = read_dir(store_dir)?
        .map(|res| res.map(|e| e.path()))
        .find(|entry| {
            let entry = match entry {
                Err(_) => return false,
                Ok(e) => e,
            };

            let file_name = entry.file_name();

            let entry_path = match file_name {
                None => return false,
                Some(p) => p,
            };

            let s = entry_path.to_str();

            let s = match s {
                None => return false,
                Some(s) => s,
            };

            Regex::new(&format!("^{}", uuid)).unwrap().is_match(s)
        });

    let existing_dataset: Option<PathBuf> = match existing_entry {
        None => None,
        Some(res) => match res {
            Err(e) => None,
            Ok(p) => Some(p),
        },
    };

    Ok(existing_dataset)
}
