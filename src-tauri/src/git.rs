use crate::{Mind, Result};
use git2kit::{Origin, Repository, Settings};
use std::fs::remove_dir_all;
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn init<R>(app: AppHandle<R>, mind: &str, name: Option<&str>) -> Result<()>
where
    R: Runtime,
{
    log::info!("git init");

    //let mind = Mind::new(app, mind);

    //mind.make_mind(name).await?;

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

    //let mind = Mind::new(app, mind);

    //match mind.find_mind() {
    //    Err(_) => (),
    //    Ok(p) => match p {
    //        None => (),
    //        Some(d) => remove_dir_all(d)?,
    //    },
    //};

    //let mind_dir = mind.name_mind(name.as_deref())?;

    //let repo = Repository::clone(mind_dir, &remote).await?;

    Ok(())
}

#[tauri::command]
pub async fn pull<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    log::info!("git pull");

    //let mind = Mind::new(app, mind);

    //let mind_dir = mind.find_mind()?.unwrap();

    //let repo = Repository::open(&mind_dir)?;

    //repo.pull(&remote)?;

    Ok(())
}

#[tauri::command]
pub async fn push<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    log::info!("git push");

    //let mind = Mind::new(app, mind);

    //let mind_dir = mind.find_mind()?.unwrap();

    //let repository = Repository::open(&mind_dir)?;

    //repository.push(&remote)?;

    Ok(())
}

#[tauri::command]
pub async fn set_origin<R>(app: AppHandle<R>, mind: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    log::info!("git set origin");

    //let mind = Mind::new(app, mind);

    //let mind_dir = mind.find_mind()?.unwrap();

    //let repository = Repository::open(&mind_dir)?;

    //repository.set_origin(remote)?;

    Ok(())
}

#[tauri::command]
pub async fn get_origin<R>(app: AppHandle<R>, mind: &str) -> Result<Option<Origin>>
where
    R: Runtime,
{
    log::info!("git get origin");

    Ok(None)

    //let mind = Mind::new(app, mind);

    //let mind_dir = mind.find_mind()?.unwrap();

    //let repository = Repository::open(&mind_dir)?;

    //Ok(repository.get_origin())
}

#[tauri::command]
pub fn commit<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    log::info!("git commit");

    //let mind = Mind::new(app, mind);

    //let mind_dir_path = mind.find_mind()?.unwrap();

    //let repo = Repository::open(&mind_dir_path)?;

    //repo.commit();

    Ok(())
}
