use super::error::{Error, Result};
use super::API;
use regex::Regex;
use std::fs::read_dir;
use std::fs::{create_dir, rename};
use std::path::PathBuf;
use tauri::{Manager, Runtime, State};

pub trait IO {
    fn get_store_dir(&self) -> Result<PathBuf>;
    fn name_dir(&self, name: Option<&str>) -> Result<PathBuf>;
    fn find_dataset(&self) -> Result<Option<PathBuf>>;
    fn get_app_data_dir(&self) -> Result<PathBuf>;
}

impl<R> IO for API<R>
where
    R: tauri::Runtime,
{
    #[cfg(test)]
    fn get_app_data_dir(&self) -> Result<PathBuf> {
        // state is initialized in the test case
        // /tmp/t####-0 on linux
        let temp_path: State<PathBuf> = self.app.state();

        // reference to get inner out of state, then clone to move out of scope
        let app_data_dir: PathBuf = temp_path.inner().clone();

        Ok(app_data_dir)
    }

    #[cfg(not(test))]
    fn get_app_data_dir(&self) -> Result<PathBuf> {
        // .local/share on linux
        Ok(self.app.path().app_data_dir()?)
    }

    // ensure app_data_dir/store exists
    fn get_store_dir(&self) -> Result<PathBuf> {
        let app_data_dir = self.get_app_data_dir()?;

        let store_dir = app_data_dir.join("store");

        if !store_dir.exists() {
            create_dir(&store_dir)?;
        }

        Ok(store_dir)
    }

    // make a path for store/uuid-name
    fn name_dir(&self, name: Option<&str>) -> Result<PathBuf> {
        let store_dir = self.get_store_dir()?;

        let dataset_filename = match name {
            None => &self.uuid,
            Some(s) => &format!("{}-{}", self.uuid, s),
        };

        let dataset_dir = store_dir.join(dataset_filename);

        Ok(dataset_dir)
    }

    // find ^uuid in app_data_dir
    fn find_dataset(&self) -> Result<Option<PathBuf>> {
        let store_dir = self.get_store_dir()?;

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

                Regex::new(&format!("^{}", self.uuid)).unwrap().is_match(s)
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
}
