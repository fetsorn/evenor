use crate::{Mind, Result};
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn zip<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    log::info!("zip");
    
    crate::log(&app, "zip");

    //let mind = Mind::new(app, mind);

    //mind.zip().await?;

    Ok(())
}
