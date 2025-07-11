use crate::Result;
mod csvs;
mod zip;
pub use csvs::{SelectEvent, CSVS};
use std::path::PathBuf;
use tauri::{AppHandle, Runtime};
mod find_dataset;
mod get_app_data_dir;
mod get_store_dir;
mod make_dataset;
mod name_dataset;

pub struct Dataset<R>
where
    R: Runtime,
{
    pub app: AppHandle<R>,
    pub uuid: String,
}

impl<R> Dataset<R>
where
    R: Runtime,
{
    pub fn new(app: AppHandle<R>, uuid: &str) -> Self {
        Dataset {
            app: app,
            uuid: uuid.to_string(),
        }
    }

    fn get_app_data_dir(&self) -> Result<PathBuf> {
        get_app_data_dir::get_app_data_dir(self)
    }

    // ensure app_data_dir/store exists
    pub fn get_store_dir(&self) -> Result<PathBuf> {
        get_store_dir::get_store_dir(self)
    }

    // make a path for store/uuid-name
    pub fn name_dataset(&self, name: Option<&str>) -> Result<PathBuf> {
        name_dataset::name_dataset(self, name)
    }

    // find ^uuid in app_data_dir
    pub fn find_dataset(&self) -> Result<Option<PathBuf>> {
        find_dataset::find_dataset(self)
    }

    pub async fn make_dataset(&self, name: Option<&str>) -> Result<()> {
        make_dataset::make_dataset(self, name).await
    }

    pub async fn zip(&self) -> Result<()> {
        zip::zip(self).await
    }
}
