use crate::{Mind, Result};
use git2kit::{Origin, Repository, Settings};
use std::fs::remove_dir_all;
use tauri::{ipc::Channel, AppHandle, Runtime};
use crate::{log};

#[tauri::command]
pub async fn init<R>(app: AppHandle<R>, mind: &str, name: Option<&str>) -> Result<()>
where
    R: Runtime,
{
    log::info!("git init");
        
    log(&app, "git init");
    
    let mind = Mind::new(app.clone(), mind);

    mind.make_mind(name).await?;

    Ok(())
}

#[tauri::command]
pub async fn clone<R>(
    app: AppHandle<R>,
    mind: &str,
    name: Option<String>,
    remote: Origin,
) -> Result<()>
where
    R: Runtime,
{
    log::info!("git clone");
    
    crate::log(&app, "clone");

    let mind = Mind::new(app, mind);

    match mind.find_mind() {
        Err(_) => (),
        Ok(p) => match p {
            None => (),
            Some(d) => remove_dir_all(d)?,
        },
    };

    let mind_dir = mind.name_mind(name.as_deref())?;

    let repo = Repository::clone(mind_dir, &remote).await?;

    Ok(())
}

#[tauri::command]
pub async fn pull<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    log::info!("git pull");
    
    crate::log(&app, "pull");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let repo = Repository::open(&mind_dir)?;

    repo.pull(&remote)?;

    Ok(())
}

#[tauri::command]
pub async fn push<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    log::info!("git push");
    
    crate::log(&app, "push");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let repository = Repository::open(&mind_dir)?;

    repository.push(&remote)?;

    Ok(())
}

#[tauri::command]
pub async fn set_origin<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    log::info!("git set origin");
    
    crate::log(&app, "set origin");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let repository = Repository::open(&mind_dir)?;

    repository.set_origin(remote)?;

    Ok(())
}

#[tauri::command]
pub async fn get_origin<R>(app: AppHandle<R>, mind: &str) -> Result<Option<Origin>>
where
    R: Runtime,
{
    log::info!("git get origin");
    
    crate::log(&app, "get origin");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let repository = Repository::open(&mind_dir)?;

    Ok(repository.get_origin())
}

#[tauri::command]
pub fn commit<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    log::info!("git commit");
    
    crate::log(&app, "commit");

    let mind = Mind::new(app, mind);

    let mind_dir_path = mind.find_mind()?.unwrap();

    let repo = Repository::open(&mind_dir_path)?;

    repo.commit();

    Ok(())
}
