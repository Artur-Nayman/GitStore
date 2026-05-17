use tauri::State;
use crate::db::DbPool;

#[tauri::command]
pub fn get_cached_search(query: String, db: State<'_, DbPool>) -> Result<Option<String>, String> {
    let pool = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = pool
        .prepare("SELECT data FROM search_cache WHERE query = ? AND (strftime('%s', 'now') - timestamp) < ttl")
        .map_err(|e| e.to_string())?;

    let result = stmt.query_row([query], |row| row.get::<_, String>(0));

    match result {
        Ok(data) => Ok(Some(data)),
        Err(_) => Ok(None),
    }
}

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

#[tauri::command]
pub fn clear_cache(db: State<'_, DbPool>) -> Result<(), String> {
    let pool = db.0.lock().map_err(|e| e.to_string())?;
    pool.execute("DELETE FROM search_cache", [])
        .map_err(|e| e.to_string())?;
    pool.execute("DELETE FROM release_cache", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}
