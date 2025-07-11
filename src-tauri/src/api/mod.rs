pub mod csvs;
pub mod error;
pub mod git;
pub mod io;
pub mod zip;
pub use csvs::{SelectEvent, CSVS};
pub use error::{Error, Result};
pub use git::{Git, Remote};
pub use io::IO;
use tauri::{AppHandle, Runtime};
pub use zip::Zip;

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
