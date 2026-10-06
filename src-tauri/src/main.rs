#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod commands;
mod db;
mod utils;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            db::init_db(app.app_handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::github::search_repositories,
            commands::github::fetch_latest_release,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
