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
            .plugin(
                tauri_plugin_log::Builder::new()
                    .target(tauri_plugin_log::Target::new(
                        tauri_plugin_log::TargetKind::LogDir {
                            file_name: Some("logs".to_string()),
                        },
                    ))
                    .build(),
            ) // log plugin is outside create_app because log breaks mock_builder in tests
            .setup(|app| {
                let data_dir = match cli.data_dir {
                    Some(p) => std::path::Path::new(&p).to_owned(),
                    // .local/share on linux
                    None => app.path().app_data_dir()?,
                };
                
            if !data_dir.exists() {
                std::fs::create_dir(&data_dir).expect("Could not create application bundle location in data directory");
            }

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
