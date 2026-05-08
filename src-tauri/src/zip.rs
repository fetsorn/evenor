use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use temp_dir::TempDir;
use walkdir::WalkDir;
use zip::{write::SimpleFileOptions, CompressionMethod, ZipWriter};

use crate::Result;

pub fn add_to_zip(mind_dir_path: &Path, file_path: &Path) -> Result<()> {
    let writer = File::create(file_path)?;

    let walkdir = WalkDir::new(mind_dir_path);
    let it = walkdir.into_iter().filter_map(|e| e.ok());

    let options = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Stored)
        .unix_permissions(0o755);

    let mut zip = ZipWriter::new(writer);
    let mut buffer = Vec::new();

    for entry in it {
        let path = entry.path();
        let name = path.strip_prefix(mind_dir_path).unwrap();
        let path_as_string = name.to_str().map(str::to_owned).unwrap();

        if path.is_file() {
            zip.start_file(path_as_string, options)?;
            let mut f = File::open(path)?;
            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            zip.add_directory(path_as_string, options)?;
        }
    }

    zip.finish()?;

    Ok(())
}

/// Zip a mind directory into a temp file and return (TempDir, zip path).
/// Caller must hold the TempDir to keep the file alive.
pub fn zip_to_temp(mind_dir: &Path) -> Result<(TempDir, PathBuf)> {
    let temp_d = TempDir::new().or_else(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            TempDir::from_path(mind_dir.to_path_buf())
        } else {
            Err(e)
        }
    })?;

    let temp_path = temp_d.as_ref().join("archive.zip");

    add_to_zip(mind_dir, &temp_path)?;

    Ok((temp_d, temp_path))
}
