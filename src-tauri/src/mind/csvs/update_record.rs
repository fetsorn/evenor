use crate::{Mind, Result};
use csvs::{types::entry::Entry, update};
use serde_json::Value;
use std::path::PathBuf;

pub async fn update_record(mind_dir: PathBuf, record: Value) -> Result<()> {
    let record: Entry = record.try_into().unwrap();

    // TODO rewrite to record.update after csvs-rs refactor
    update::update_record(mind_dir, vec![record]).await;

    Ok(())
}
