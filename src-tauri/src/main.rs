// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::prelude::*;
use std::io::BufReader;
use std::process::{exit, Command};
use std::str;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_bookmark() -> String {
    let file = File::open(
        "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks",
    )
    .unwrap();
    let mut buf_reader = BufReader::new(file);
    let mut contents = String::new();

    buf_reader.read_to_string(&mut contents).unwrap();
    contents
}

#[tauri::command]
fn get_apps() -> String {
    // let output = Command::new("powershell.exe")
    //     .arg("-Command")
    //     .arg("Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayIcon, InstallLocation")
    //     .output().unwrap();

    // match output.status.success() {
    //     true => {
    //         let s = match str::from_utf8(&output.stdout) {
    //             Ok(v) => v.to_string(),
    //             Err(e) => String::from(" "),
    //         };
    //         s
    //     }
    //     false => {
    //       String::from("")
    //     }
    // }
    String::from("")
}

#[tauri::command]
fn minimize(window: tauri::Window) -> Result<(), String> {
    window
        .minimize()
        .map_err(|err| format!("failed to minimize window: {}", err))
}

#[tauri::command]
fn unsize(window: tauri::Window) -> Result<(), String> {
    match window.is_minimized() {
        Ok(true) => {
            window
                .unminimize()
                .map_err(|err| format!("failed to unminimize window"))?;
            window
                .set_focus()
                .map_err(|err| format!("failed to set focus: {}", err))?;
            Ok(())
        }
        Ok(false) => window
            .minimize()
            .map_err(|err| format!("failed to unminimize window: {}", err)),
        Err(err) => {
            panic!("Failed to check if window is minimized: {}", err)
        }
    }
}

fn main() {
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![
            minimize,
            unsize,
            get_bookmark,
            get_apps
        ])
        // .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
