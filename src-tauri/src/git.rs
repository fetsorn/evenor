use crate::log;
use crate::{Error, Mind, Result};
use git2kit::{Origin, Repository, Resolve, Settings};
use std::fs;
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn init<R>(app: AppHandle<R>, mind: &str, name: Option<&str>) -> Result<()>
where
    R: Runtime,
{
    log(&app, "git init");

    let mind = Mind::new(app, mind);

    mind.make_mind(name)?;

    Ok(())
}

#[tauri::command]
pub async fn rename<R>(app: AppHandle<R>, mind: &str, source: &str) -> Result<()>
where
    R: Runtime,
{
    let target = Mind::new(app.clone(), mind);

    let target_dir = target.name_mind(None)?;

    let source = Mind::new(app, source);

    let source_dir = source.find_mind()?;

    // NOTE rename won't work with mount points
    match source_dir {
        None => Err(Error::from_message("no mind found")),
        Some(dir) => Ok(fs::rename(dir, target_dir)?),
    }
}

#[tauri::command]
pub async fn clone<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    crate::log(&app, "clone");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.name_mind(None)?;

    let existing_mind = mind.find_mind()?;

    match existing_mind {
        None => (),
        Some(dir) => fs::remove_dir_all(dir)?,
    };

    let repo = Repository::clone(mind_dir, &remote)?;

    repo.set_origin(remote)?;

    Ok(())
}

#[tauri::command]
pub async fn set_origin<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
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
    crate::log(&app, "commit");

    let mind = Mind::new(app, mind);

    let mind_dir_path = mind.find_mind()?.unwrap();

    let repo = Repository::open(&mind_dir_path)?;

    repo.commit();

    Ok(())
}

#[tauri::command]
pub async fn resolve<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<Resolve>
where
    R: Runtime,
{
    log(&app, "git init");

    let mind = Mind::new(app, mind);

    let mind_dir = mind.find_mind()?.unwrap();

    let repository = Repository::open(&mind_dir)?;

    let resolve = repository.resolve(&remote)?;

    Ok(resolve)
}
