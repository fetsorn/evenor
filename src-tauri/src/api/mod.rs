mod csvs;
mod error;
mod git;
mod io;
mod repository;
// mod test;
mod zip;
pub use crate::api::{
    csvs::{SelectEvent, CSVS},
    git::{Git, Remote},
    zip::Zip,
};
pub use error::{Error, Result};
use tauri::{AppHandle, Manager, Runtime};

pub struct API<R>
where
    R: Runtime,
{
    app: AppHandle<R>,
    uuid: String,
}

impl<R> API<R>
where
    R: Runtime,
{
    pub fn new(app: AppHandle<R>, uuid: &str) -> Self {
        API {
            app: app,
            uuid: uuid.to_string(),
        }
    }
}
