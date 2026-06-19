use std::env;
use std::fs;
use std::io::Write;
use std::path::Path;

/// Walk a directory tree, collecting (relative_path, content) pairs.
fn walk_dir(dir: &Path, prefix: &str, out: &mut Vec<(String, String)>) {
    let mut entries: Vec<_> = fs::read_dir(dir)
        .expect("failed to read default_mind directory")
        .filter_map(|e| e.ok())
        .collect();

    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        let rel = if prefix.is_empty() {
            name.clone()
        } else {
            format!("{prefix}/{name}")
        };

        if path.is_dir() {
            walk_dir(&path, &rel, out);
        } else {
            let content = fs::read_to_string(&path).unwrap_or_else(|e| {
                panic!("failed to read {}: {e}", path.display())
            });
            out.push((rel, content));
        }
    }
}

fn main() {
    tauri_build::build();

    // Generate default_mind_data.rs from the src/default_mind/ directory
    let mind_dir = Path::new("../src/default_mind");

    if mind_dir.exists() {
        let mut files = Vec::new();
        walk_dir(mind_dir, "", &mut files);

        let out_dir = env::var("OUT_DIR").unwrap();
        let dest = Path::new(&out_dir).join("default_mind_data.rs");
        let mut f = fs::File::create(&dest).unwrap();

        writeln!(f, "pub const DEFAULT_MIND_FILES: &[(&str, &str)] = &[").unwrap();

        for (rel_path, content) in &files {
            writeln!(f, "    ({:?}, {:?}),", rel_path, content).unwrap();
        }

        writeln!(f, "];").unwrap();

        // rerun if any file in the default mind changes
        for (rel_path, _) in &files {
            let p = mind_dir.join(rel_path);
            println!("cargo:rerun-if-changed={}", p.display());
        }

        println!("cargo:rerun-if-changed=../src/default_mind");
    }
}
