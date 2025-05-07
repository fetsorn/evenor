#![allow(warnings)]
use crate::error::{Error, Result};
use async_stream::try_stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use git2::{Cred, RemoteCallbacks, Repository};
use serde::Serialize;
use serde_json::Value;
use std::fs::{create_dir, read_dir, rename};
use std::io::prelude::*;
use std::path::Path;
use tauri::{ipc::Channel, AppHandle, Emitter, EventTarget, Manager};
use tauri_plugin_dialog::DialogExt;
use walkdir::{DirEntry, WalkDir};
