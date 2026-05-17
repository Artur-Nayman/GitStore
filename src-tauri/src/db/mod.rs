use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub struct DbPool(pub Mutex<Connection>);

pub fn init_db(app: &AppHandle) -> Result<(), String> {
    let db_path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&db_path).map_err(|e| e.to_string())?;
    let db_file = db_path.join("gitstore.db");

    let conn = Connection::open(db_file).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS search_cache (
            query TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            ttl INTEGER DEFAULT 3600
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS release_cache (
            repo_key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            ttl INTEGER DEFAULT 3600
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS oauth_tokens (
            id INTEGER PRIMARY KEY,
            token TEXT NOT NULL,
            expires_at INTEGER,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )",
        [],
    )
    .map_err(|e| e.to_string())?;

    app.manage(DbPool(Mutex::new(conn)));
    Ok(())
}
