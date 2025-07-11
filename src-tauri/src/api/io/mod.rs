mod find_dataset;
mod get_app_data_dir;
mod get_store_dir;
mod name_dir;
use super::API;
use crate::api::error::Result;
use std::path::PathBuf;

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
    fn get_app_data_dir(&self) -> Result<PathBuf> {
        get_app_data_dir::get_app_data_dir(self)
    }

    // ensure app_data_dir/store exists
    fn get_store_dir(&self) -> Result<PathBuf> {
        get_store_dir::get_store_dir(self)
    }

    // make a path for store/uuid-name
    fn name_dir(&self, name: Option<&str>) -> Result<PathBuf> {
        name_dir::name_dir(self, name)
    }

    // find ^uuid in app_data_dir
    fn find_dataset(&self) -> Result<Option<PathBuf>> {
        find_dataset::find_dataset(self)
    }
}
