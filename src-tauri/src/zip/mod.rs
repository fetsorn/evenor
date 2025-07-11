mod add_to_zip;
mod zip;

use super::{Dataset, Result};
use tauri::Runtime;

pub trait Zip {
    async fn zip(&self) -> Result<()>;
}

impl<R: Runtime> Zip for Dataset<R> {
    async fn zip(&self) -> Result<()> {
        zip::zip(self).await
    }
}
