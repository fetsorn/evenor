use crate::{Mind, Result};
use tauri::{Runtime, AppHandle};
use tauri_plugin_dialog::DialogExt;

use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_fs::{FilePath, Fs, FsExt, OpenOptions};
use temp_dir::TempDir;
use walkdir::WalkDir;
use zip::{write::SimpleFileOptions, CompressionMethod, ZipWriter};

pub fn add_to_zip<R: Runtime>(mind_dir_path: PathBuf, file_path: &Path, app: AppHandle<R>) -> Result<()> {
    let writer = File::create(file_path).unwrap();

    let walkdir = WalkDir::new(&mind_dir_path);

    let it = walkdir.into_iter();
    let it = &mut it.filter_map(|e| e.ok());

    let method = CompressionMethod::Stored;

    let mut zip = ZipWriter::new(writer);
    let options = SimpleFileOptions::default()
        .compression_method(method)
        .unix_permissions(0o755);

    let prefix = Path::new(&mind_dir_path);
    let mut buffer = Vec::new();
    for entry in it {
        let path = entry.path();
        let name = path.strip_prefix(prefix).unwrap();
        let path_as_string = name.to_str().map(str::to_owned).unwrap();
        // .with_context(|| format!("{name:?} Is a Non UTF-8 Path"))?;

        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            crate::log(&app, format!("adding file {path:?} as {name:?} ...").as_ref());
            zip.start_file(path_as_string, options)?;
            let mut f = File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            crate::log(&app, format!("adding dir {path_as_string:?} as {name:?} ...").as_ref());
            zip.add_directory(path_as_string, options)?;
        }
    }

    zip.finish()?;

    Ok(())
}

pub async fn zip<R: Runtime>(mind: &Mind<R>) -> Result<()> {
    let mind_dir = mind.find_mind()?.expect("no directory");

    // must assign a variable to create the directory
    // must assign inside the stream scope to keep the directory
    let temp_d = TempDir::new();

    // on android <13 std::env::temp_dir() returns /data/local/tmp
    // which is inaccessible on some android systems
    let temp_d = match temp_d {
       Err(e) if e.kind() == std::io::ErrorKind::PermissionDenied => {
          TempDir::from_path(mind_dir.clone())
       }
       Err(e) => Err(e),
       Ok(td) => Ok(td)
    };

    let temp_d = temp_d?;

    let temp_path = temp_d.as_ref().join("archive.zip");

    crate::log(&mind.app, format!("{:?}", temp_path).as_ref());

    add_to_zip(mind_dir, &temp_path, mind.app.clone())?;

    let file_path = mind
        .app
        .dialog()
        .file()
        .add_filter("My Filter", &["zip"])
        .blocking_save_file();

    crate::log(&mind.app, format!("{:?}", file_path).as_ref());

    match file_path {
        None => (),
        Some(p) => {
            crate::log(&mind.app, format!("{:?}", p).as_ref());

            let buf = std::fs::read(temp_path)?;

            // try to create the file on desktop
            // file already exists on mobile
            if let Ok(a) = p.clone().into_path() {
                _ = std::fs::File::create_new(a);
            };

            let mut opts = OpenOptions::new();

            opts.write(true);

            let r = mind.app.fs().open(p, opts.clone());

            crate::log(&mind.app, format!("{:?}", r).as_ref());

            let mut f = r?;

            crate::log(&mind.app, format!("{:?}", f).as_ref());

            f.write_all(&buf)?;
        }
    };

    Ok(())
}

mod test {
    use super::add_to_zip;
    use crate::{create_app, Mind, Result};
    use std::fs::{create_dir_all, write, File};
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

        let mind = "emind";

        let name = "ename";

        let mind = Mind::new(app.handle().clone(), &mind);

        let mind_dir = mind.name_mind(None)?;

        create_dir_all(&mind_dir)?;

        let check_path = mind_dir.join("check.txt");

        write(check_path, "check")?;

        let file_path = temp_path.join("a.zip");

        add_to_zip(mind_dir, &file_path)?;

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
