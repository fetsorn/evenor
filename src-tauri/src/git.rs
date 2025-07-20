use crate::{dataset::{Dataset, SelectEvent, CSVS}, error::Result};
use git2kit::{Origin, Repository, Settings};
use std::fs::remove_dir_all;
use tauri::{ipc::Channel, AppHandle, Runtime};

#[tauri::command]
pub async fn init<R>(app: AppHandle<R>, uuid: &str, name: Option<&str>) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    dataset.make_dataset(name).await?;

    Ok(())
}

#[tauri::command]
pub async fn clone<R>(
    app: AppHandle<R>,
    uuid: &str,
    name: Option<String>,
    remote: Origin,
) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    match dataset.find_dataset() {
        Err(_) => (),
        Ok(p) => match p {
            None => (),
            Some(d) => remove_dir_all(d)?,
        },
    };

    let dataset_dir = dataset.name_dataset(name.as_deref())?;

    let repo = Repository::clone(dataset_dir, name, &remote).await?;

    Ok(())
}

#[tauri::command]
pub async fn pull<R>(app: AppHandle<R>, uuid: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    let repo = Repository::open(&dataset_dir)?;

    repo.pull()?;

    Ok(())
}

#[tauri::command]
pub async fn push<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    repository.push()?;

    Ok(())
}

#[tauri::command]
pub async fn set_origin<R>(app: AppHandle<R>, uuid: &str, remote: Origin) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    repository.set_origin(remote)?;

    Ok(())
}

#[tauri::command]
pub async fn get_origin<R>(app: AppHandle<R>, uuid: &str) -> Result<Origin>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir = dataset.find_dataset()?.unwrap();

    let repository = Repository::open(&dataset_dir)?;

    let origin = repository.get_origin()?;

    Ok(origin)
}

#[tauri::command]
pub fn commit<R>(app: AppHandle<R>, uuid: &str) -> Result<()>
where
    R: Runtime,
{
    let dataset = Dataset::new(app, uuid);

    let dataset_dir_path = dataset.find_dataset()?.unwrap();

    let repo = Repository::open(&dataset_dir_path)?;

    repo.commit();

    Ok(())
}
