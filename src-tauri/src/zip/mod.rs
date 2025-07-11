mod add_to_zip;
mod zip;

use super::{Dataset, Result};

pub trait Zip {
    async fn zip(&self) -> Result<()>;
}

impl<R> Zip for Dataset<R>
where
    R: tauri::Runtime,
{
    async fn zip(&self) -> Result<()> {
        zip::zip(self).await
    }
}
