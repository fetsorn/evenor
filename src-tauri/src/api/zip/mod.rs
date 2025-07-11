mod zip;
mod add_to_zip;

use super::error::Result;
use super::{io::IO, API};

pub trait Zip {
    async fn zip(&self) -> Result<()>;
}

impl<R> Zip for API<R>
where
    R: tauri::Runtime,
{
    async fn zip(&self) -> Result<()> {
        zip::zip(self).await
    }
}

