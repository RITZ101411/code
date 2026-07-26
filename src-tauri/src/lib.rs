use std::fs;
use tauri::Manager;
use tauri_plugin_decorum::WebviewWindowExt;

#[cfg(target_os = "macos")]
const NS_SCROLL_ELASTICITY_NONE: isize = 1;
#[cfg(target_os = "macos")]
const TRAFFIC_LIGHT_X: f32 = 12.0;
#[cfg(target_os = "macos")]
const TRAFFIC_LIGHT_Y: f32 = 14.0;

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[tauri::command]
fn read_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let mut entries = Vec::new();
    let dir = fs::read_dir(&path).map_err(|e| format!("Failed to read dir {}: {}", path, e))?;

    for entry in dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        entries.push(DirEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
        });
    }

    entries.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(entries)
}

#[derive(serde::Serialize)]
struct DirEntry {
    name: String,
    path: String,
    is_dir: bool,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_opener::init());

    #[cfg(not(target_os = "macos"))]
    let builder = builder.plugin(tauri_plugin_decorum::init());

    builder
        .invoke_handler(tauri::generate_handler![read_file, write_file, read_dir])
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();

            #[cfg(not(target_os = "macos"))]
            main_window.create_overlay_titlebar().unwrap();

            #[cfg(target_os = "macos")]
            {
                main_window
                    .set_traffic_lights_inset(TRAFFIC_LIGHT_X, TRAFFIC_LIGHT_Y)
                    .unwrap();

                let traffic_light_window = main_window.clone();
                main_window.on_window_event(move |event| {
                    if matches!(
                        event,
                        tauri::WindowEvent::Resized(_)
                            | tauri::WindowEvent::ScaleFactorChanged { .. }
                    ) {
                        let _ = traffic_light_window
                            .set_traffic_lights_inset(TRAFFIC_LIGHT_X, TRAFFIC_LIGHT_Y);
                    }
                });

                main_window
                    .with_webview(|webview| unsafe {
                        let wk_webview: *mut objc2::runtime::AnyObject = webview.inner().cast();
                        let scroll_view: *mut objc2::runtime::AnyObject =
                            objc2::msg_send![wk_webview, enclosingScrollView];

                        if !scroll_view.is_null() {
                            let _: () = objc2::msg_send![
                                scroll_view,
                                setVerticalScrollElasticity: NS_SCROLL_ELASTICITY_NONE
                            ];
                            let _: () = objc2::msg_send![
                                scroll_view,
                                setHorizontalScrollElasticity: NS_SCROLL_ELASTICITY_NONE
                            ];
                        }
                    })
                    .unwrap();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
