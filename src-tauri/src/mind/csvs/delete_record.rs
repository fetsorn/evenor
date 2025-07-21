use crate::{Mind, Result};
use csvs::{delete, types::entry::Entry};
use serde_json::Value;
use std::path::PathBuf;

pub async fn delete_record(mind_dir: PathBuf, record: Value) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    // TODO rewrite to record.delete after csvs-rs refactor
    delete::delete_record(mind_dir, vec![record]).await;

    Ok(())
}
