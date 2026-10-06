use tauri::State;
use crate::db::DbPool;

#[tauri::command]
pub fn cache_search_result(
    query: String,
    data: String,
    ttl: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    let pool = db.0.lock().map_err(|e| e.to_string())?;
    let ttl = ttl.unwrap_or(3600);

    pool.execute(
        "INSERT OR REPLACE INTO search_cache (query, data, timestamp, ttl) VALUES (?, ?, strftime('%s', 'now'), ?)",
        [query, data, ttl.to_string()],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

