#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn hello_world(some_variable: &str) -> String {
    println!("helloWorld in Rust");
    format!("{} from Rust!", some_variable)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, hello_world])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
