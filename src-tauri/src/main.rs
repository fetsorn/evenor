// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use evenor_lib::AppBuilder;

pub fn main() {
  AppBuilder::new().run();
}
