use crate::{Dataset, Result};
use tauri::Runtime;
use tauri_plugin_dialog::DialogExt;

use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use zip::{write::SimpleFileOptions, CompressionMethod, ZipWriter};

pub fn add_to_zip(dataset_dir_path: PathBuf, file_path: &Path) -> Result<()> {
    let writer = File::create(file_path).unwrap();

    let walkdir = WalkDir::new(&dataset_dir_path);

    let it = walkdir.into_iter();
    let it = &mut it.filter_map(|e| e.ok());

    let method = CompressionMethod::Stored;

    let mut zip = ZipWriter::new(writer);
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
            let mut f = File::open(path)?;

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

mod test {
    use super::add_to_zip;
    use crate::{create_app, Dataset, Result};
    use std::fs::{create_dir, write, File};
    use std::io::prelude::*;
    use tauri::test::{mock_builder, mock_context, noop_assets};
    use tauri::{Manager, State};
    use temp_dir::TempDir;
    use zip::ZipArchive;

    #[tokio::test]
    async fn zip_test() -> Result<()> {
        // create a temporary directory, will be deleted by destructor
        // must assign to keep in scope;
        let temp_dir = TempDir::new();

        // reference temp_dir to not move it out of scope
        let temp_path = temp_dir.as_ref().unwrap().path().to_path_buf();

        let app = create_app(mock_builder());

        // save temporary directory path in the tauri state
        app.manage(temp_path.clone());

        let uuid = "euuid";

        let name = "ename";

        let api = Dataset::new(app.handle().clone(), &uuid);

        let dataset_dir = api.name_dataset(None)?;

        create_dir(&dataset_dir)?;

        let check_path = dataset_dir.join("check.txt");

        write(check_path, "check")?;

        let file_path = temp_path.join("a.zip");

        add_to_zip(dataset_dir, &file_path)?;

        let mut reader = File::open(&file_path)?;

        let mut zip = ZipArchive::new(reader)?;

        for i in 0..zip.len() {
            let mut file = zip.by_index(i)?;

            assert_eq!(file.name(), "check.txt");

            let mut a = String::from("");

            file.read_to_string(&mut a)?;

            assert_eq!(a, "check");
        }

        Ok(())
    }
}

pub async fn zip<R: Runtime>(api: &Dataset<R>) -> Result<()> {
    let dataset_dir = api.find_dataset()?.expect("no directory");

    let file_path = api
        .app
        .dialog()
        .file()
        .add_filter("My Filter", &["zip"])
        .blocking_save_file();

    let file_path = file_path.unwrap();

    let file_path = file_path.as_path().unwrap();

    add_to_zip(dataset_dir, &file_path)?;

    Ok(())
}
