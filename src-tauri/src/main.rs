// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use std::{
    env,
    fs::{self, File},
    io::Write,
};

#[tauri::command]
fn save(file_path: &str, content: &str) {
    match std::fs::write(file_path, content) {
        Ok(_) => println!("Content saved successfully."),
        Err(e) => println!("Failed to save content: {}", e),
    }
}

#[tauri::command]
fn open_file(file_path: &str) -> String {
    match std::fs::read_to_string(&file_path) {
        Ok(res) => res.to_owned(),
        Err(e) => {
            println!("Failed to open file: {}", e);
            return "".to_owned();
        }
    }
}

#[tauri::command]
fn config() -> String {
    let mut exe_dir = env::current_exe().expect("Unable to current exe directory.");
    exe_dir.pop();
    let config_path = exe_dir.join(".config").join("config.json");

    match std::fs::read_to_string(config_path) {
        Ok(res) => res,
        Err(e) => {
            println!("Failed to read config file: {}", e);
            return "".to_owned();
        }
    }
}

fn main() {
    let mut exe_dir = env::current_exe().expect("Unable to current exe directory.");
    exe_dir.pop();
    let config_path = exe_dir.join(".config").join("config.json");

    if !config_path.exists() {
        if let Some(parent) = config_path.parent() {
            fs::create_dir_all(parent).unwrap_or_else(|_| {
                println!("Failed to create parent directories for configuration.");
            })
        }

        let mut config_file = File::create(&config_path).expect("Failed to create config file.");
        let welcome_path = exe_dir.join("Welcome.md");

        write!(
            config_file,
            r#"
            {{
                \"last_open\": \"{}\",
                \"workspace\": ""
            }}
            "#,
            welcome_path.display().to_string().replace("\\", "/")
        )
        .expect("Failed to write to config file");

        let mut welcome_file =
            File::create(welcome_path).expect("Failed to create welcome markdown file.");

        write!(welcome_file, "# Welcome to Tephra")
            .expect("Failed to write to welcome markdown file.");
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save, open_file, config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
