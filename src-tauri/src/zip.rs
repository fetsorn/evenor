use std::path::Path;
use std::io::{Read, Write};
use zip::write::SimpleFileOptions;
use crate::error::Result;
use tauri::AppHandle;
use crate::io::find_dataset;
use tauri_plugin_dialog::DialogExt;
use walkdir::WalkDir;

#[tauri::command]
pub async fn zip<R: tauri::Runtime>(app: AppHandle<R>, uuid: &str) -> Result<()> {
    let dataset_dir_path = find_dataset(&app, uuid)?;

    let file_path = app
        .dialog()
        .file()
        .add_filter("My Filter", &["zip"])
        .blocking_save_file();

    let writer = std::fs::File::create(file_path.unwrap().as_path().unwrap()).unwrap();

    let walkdir = WalkDir::new(&dataset_dir_path);

    let it = walkdir.into_iter();
    let it = &mut it.filter_map(|e| e.ok());

    let method = zip::CompressionMethod::Stored;

    let mut zip = zip::ZipWriter::new(writer);
    let options = SimpleFileOptions::default()
        .compression_method(method)
        .unix_permissions(0o755);

    let prefix = Path::new(&dataset_dir_path);
    let mut buffer = Vec::new();
    for entry in it {
        let path = entry.path();
        let name = path.strip_prefix(prefix).unwrap();
        let path_as_string = name.to_str().map(str::to_owned).unwrap();
        // .with_context(|| format!("{name:?} Is a Non UTF-8 Path"))?;

        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            println!("adding file {path:?} as {name:?} ...");
            zip.start_file(path_as_string, options)?;
            let mut f = std::fs::File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            println!("adding dir {path_as_string:?} as {name:?} ...");
            zip.add_directory(path_as_string, options)?;
        }
    }

    zip.finish()?;

    Ok(())
}
