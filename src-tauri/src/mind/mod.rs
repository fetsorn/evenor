use crate::Result;
mod zip;
use std::path::PathBuf;
use tauri::{AppHandle, Runtime};
mod find_mind;
mod get_app_data_dir;
mod get_store_dir;
mod make_mind;
mod name_mind;

pub struct Mind<R>
where
    R: Runtime,
{
    pub app: AppHandle<R>,
    pub mind: String,
}

impl<R> Mind<R>
where
    R: Runtime,
{
    pub fn new(app: AppHandle<R>, mind: &str) -> Self {
        Mind {
            app: app,
            mind: mind.to_string(),
        }
    }

    fn get_app_data_dir(&self) -> Result<PathBuf> {
        get_app_data_dir::get_app_data_dir(self)
    }

    // ensure app_data_dir/store exists
    pub fn get_store_dir(&self) -> Result<PathBuf> {
        get_store_dir::get_store_dir(self)
    }

    // make a path for store/mind-name
    pub fn name_mind(&self, name: Option<&str>) -> Result<PathBuf> {
        name_mind::name_mind(self, name)
    }

    // find ^mind in app_data_dir
    pub fn find_mind(&self) -> Result<Option<PathBuf>> {
        find_mind::find_mind(self)
    }

    pub fn make_mind(&self, name: Option<&str>) -> Result<()> {
        make_mind::make_mind(self, name)
    }

    pub async fn zip(&self) -> Result<()> {
        zip::zip(self).await
    }
}
