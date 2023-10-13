// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn minimize(window: tauri::Window) -> Result<(), String>  {
    window.minimize().map_err(|err| format!("failed to minimize window: {}", err))
}

#[tauri::command]
fn unsize(window: tauri::Window) -> Result<(), String>  {
    window.unminimize().map_err(|err| format!("failed to unminimize window: {}", err))
}

fn main() {
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![minimize, unsize])
        // .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
