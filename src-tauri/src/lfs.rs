use crate::{Error, Mind, Result};
use git2kit::Origin;
use sha2::{Digest, Sha256};
use std::path::PathBuf;
use tauri::{ipc::Channel, AppHandle, Runtime};
use tauri_plugin_dialog::DialogExt;

const LFS_DIR: &str = "lfs";

/// Create LFS directory structure and .gitattributes for a mind.
#[tauri::command]
pub fn create_lfs<R>(app: AppHandle<R>, mind: &str) -> Result<()>
where
    R: Runtime,
{
    let mind = Mind::new(app, mind);
    let mind_dir = mind.find_mind()?.ok_or_else(|| Error::from_message("no mind found"))?;

    // Create lfs/ directory
    let lfs_path = mind_dir.join(LFS_DIR);
    std::fs::create_dir_all(&lfs_path)?;

    // Write .gitattributes for LFS tracking
    let gitattributes_path = mind_dir.join(".gitattributes");
    std::fs::write(
        &gitattributes_path,
        format!("{}/** filter=lfs diff=lfs merge=lfs -text\n", LFS_DIR),
    )?;

    // Write LFS filter config to .git/config
    let git_config_path = mind_dir.join(".git").join("config");
    if git_config_path.exists() {
        let repo = git2::Repository::open(&mind_dir)?;
        let mut config = repo.config()?;
        config.set_str("filter.lfs.clean", "git-lfs clean -- %f")?;
        config.set_str("filter.lfs.smudge", "git-lfs smudge -- %f")?;
        config.set_str("filter.lfs.process", "git-lfs filter-process")?;
        config.set_bool("filter.lfs.required", true)?;
    }

    Ok(())
}

/// Read a file from the LFS directory or asset path.
/// Tries: 1) configured asset.path + filename, 2) lfs/ + filename
#[tauri::command]
pub async fn fetch_asset<R>(app: AppHandle<R>, mind: &str, filename: &str) -> Result<Vec<u8>>
where
    R: Runtime,
{
    let mind_obj = Mind::new(app, mind);
    let mind_dir = mind_obj.find_mind()?.ok_or_else(|| Error::from_message("no mind found"))?;

    // Try configured asset path first
    if let Ok(repo) = git2::Repository::open(&mind_dir) {
        if let Ok(config) = repo.config() {
            if let Ok(asset_path) = config.get_string("asset.path") {
                let full_path = PathBuf::from(&asset_path).join(filename);
                if full_path.exists() {
                    return Ok(std::fs::read(&full_path)?);
                }
            }
        }
    }

    // Fall back to lfs/ directory
    let lfs_path = mind_dir.join(LFS_DIR).join(filename);
    if lfs_path.exists() {
        return Ok(std::fs::read(&lfs_path)?);
    }

    Err(Error::from_message(format!("asset not found: {}", filename)))
}

/// Write a file to the LFS directory.
#[tauri::command]
pub async fn put_asset<R>(app: AppHandle<R>, mind: &str, filename: &str, buffer: Vec<u8>) -> Result<()>
where
    R: Runtime,
{
    let mind_obj = Mind::new(app, mind);
    let mind_dir = mind_obj.find_mind()?.ok_or_else(|| Error::from_message("no mind found"))?;

    let lfs_path = mind_dir.join(LFS_DIR);
    std::fs::create_dir_all(&lfs_path)?;

    let file_path = lfs_path.join(filename);
    std::fs::write(&file_path, &buffer)?;

    Ok(())
}

/// Pick a file via system dialog, hash it, write to LFS, return metadata.
#[tauri::command]
pub async fn upload_file<R>(app: AppHandle<R>, mind: &str) -> Result<Vec<serde_json::Value>>
where
    R: Runtime,
{
    let mind_obj = Mind::new(app.clone(), mind);
    let mind_dir = mind_obj.find_mind()?.ok_or_else(|| Error::from_message("no mind found"))?;

    // Use Tauri file dialog to pick files
    let files = app.dialog().file().blocking_pick_files();

    let files = match files {
        Some(f) => f,
        None => return Ok(vec![]), // user cancelled
    };

    let lfs_path = mind_dir.join(LFS_DIR);
    std::fs::create_dir_all(&lfs_path)?;

    let mut metadata = vec![];

    for file_response in files {
        let file_path = file_response.into_path()
            .map_err(|e| Error::from_message(format!("failed to resolve file path: {}", e)))?;
        let content = std::fs::read(&file_path)?;

        // SHA-256 hash
        let mut hasher = Sha256::new();
        hasher.update(&content);
        let hash_bytes = hasher.finalize();
        let hash_hex = hex::encode(hash_bytes);

        // Extract name and extension
        let stem = file_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("file")
            .to_string();
        let extension = file_path
            .extension()
            .and_then(|s| s.to_str())
            .map(|s| s.to_string());

        // Build asset filename: hash.ext
        let asset_name = match &extension {
            Some(ext) => format!("{}.{}", hash_hex, ext),
            None => hash_hex.clone(),
        };

        // Write to LFS directory
        let dest = lfs_path.join(&asset_name);
        std::fs::write(&dest, &content)?;

        let mut metadatum = serde_json::json!({
            "hash": hash_hex,
            "name": stem,
        });
        if let Some(ext) = &extension {
            metadatum["extension"] = serde_json::Value::String(ext.clone());
        }
        metadata.push(metadatum);
    }

    Ok(metadata)
}

/// Upload LFS blobs to remote — stub for now, requires HTTP LFS batch API.
#[tauri::command]
pub async fn upload_blobs_lfs<R>(
    app: AppHandle<R>,
    mind: &str,
    remote: Origin,
    files: &str,
) -> Result<()>
where
    R: Runtime,
{
    // TODO: implement LFS batch upload API
    // This requires HTTP requests to {remote_url}/info/lfs/objects/batch
    // with basic auth, then PUT to the upload href.
    // Deferring to a future pass.
    Ok(())
}

/// Save asset content to a user-chosen location via file dialog.
#[tauri::command]
pub async fn download_asset<R>(
    app: AppHandle<R>,
    mind: &str,
    content: Vec<u8>,
    filename: &str,
) -> Result<()>
where
    R: Runtime,
{
    let save_path = app
        .dialog()
        .file()
        .set_file_name(filename)
        .blocking_save_file();

    match save_path {
        Some(path) => {
            std::fs::write(path.as_path().unwrap(), &content)?;
            Ok(())
        }
        None => Ok(()), // user cancelled
    }
}

/// Get download URL from LFS pointer — stub, requires HTTP LFS batch API.
#[tauri::command]
pub async fn download_url_from_pointer<R>(
    app: AppHandle<R>,
    mind: &str,
    remote: Origin,
    pointer_info: &str,
) -> Result<Option<String>>
where
    R: Runtime,
{
    // TODO: implement LFS batch download URL resolution
    // Parse pointer_info as JSON { oid, size }, POST to
    // {remote_url}/info/lfs/objects/batch with operation: "download"
    Ok(None)
}

/// Store a custom asset path in the mind's git config.
#[tauri::command]
pub async fn set_asset_path<R>(app: AppHandle<R>, mind: &str, asset_path: &str) -> Result<()>
where
    R: Runtime,
{
    let mind_obj = Mind::new(app, mind);
    let mind_dir = mind_obj.find_mind()?.ok_or_else(|| Error::from_message("no mind found"))?;

    let repo = git2::Repository::open(&mind_dir)?;
    let mut config = repo.config()?;
    config.set_str("asset.path", asset_path)?;

    Ok(())
}

/// Read the custom asset path from the mind's git config.
#[tauri::command]
pub async fn get_asset_path<R>(app: AppHandle<R>, mind: &str) -> Result<Option<String>>
where
    R: Runtime,
{
    let mind_obj = Mind::new(app, mind);
    let mind_dir = mind_obj.find_mind()?.ok_or_else(|| Error::from_message("no mind found"))?;

    let repo = git2::Repository::open(&mind_dir)?;
    let config = repo.config()?;

    match config.get_string("asset.path") {
        Ok(path) => Ok(Some(path)),
        Err(_) => Ok(None),
    }
}
