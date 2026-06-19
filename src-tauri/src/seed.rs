use std::fs;
use std::path::Path;

include!(concat!(env!("OUT_DIR"), "/default_mind_data.rs"));

const MIND_DIR_NAME: &str = "my-family";

/// Seed the default mind into the store if no minds exist yet.
///
/// Writes csvs files directly to the filesystem so that Mindzoo::new()
/// discovers the mind on rebuild.
///
/// Returns true if seeded, false if store already had data.
pub fn seed_default_mind(store_dir: &Path) -> std::io::Result<bool> {
    eprintln!("[seed] store_dir={} exists={}", store_dir.display(), store_dir.exists());
    eprintln!("[seed] DEFAULT_MIND_FILES has {} entries", DEFAULT_MIND_FILES.len());

    // check if any directories exist (besides "root")
    let has_minds = fs::read_dir(store_dir)?
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().map(|ft| ft.is_dir()).unwrap_or(false))
        .any(|e| {
            let name = e.file_name();
            eprintln!("[seed] found dir: {:?}", name);
            name != "root"
        });

    eprintln!("[seed] has_minds={}", has_minds);

    if has_minds {
        return Ok(false);
    }

    let mind_dir = store_dir.join(MIND_DIR_NAME);
    eprintln!("[seed] writing to {}", mind_dir.display());

    for (rel_path, content) in DEFAULT_MIND_FILES {
        let full_path = mind_dir.join(rel_path);

        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::write(&full_path, content)?;
    }

    eprintln!("[seed] done, wrote {} files", DEFAULT_MIND_FILES.len());

    Ok(true)
}
