#![allow(warnings)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use clap::{Parser, Subcommand};
use tauri::{Manager, State};

/// A command-line utility for comma separated value store datasets
#[derive(Parser)]
#[command(version)]
struct Cli {
    /// Path to the data directory
    #[arg(short, long)]
    data_dir: Option<std::path::PathBuf>,
}

fn main() {
    let cli = Cli::parse();

    evenor_lib::create_app(
        tauri::Builder::default()
            .setup(|app| {
                let data_dir = match cli.data_dir {
                    Some(p) => std::path::Path::new(&p).to_owned(),
                    // .local/share on linux
                    None => app.path().app_data_dir()?,
                };

                app.manage(data_dir);

                Ok(())
            }),
    )
    .run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}
