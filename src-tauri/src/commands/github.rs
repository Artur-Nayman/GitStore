use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbPool;

#[derive(Serialize, Deserialize)]
pub struct SearchParams {
    pub query: String,
    pub category: String,
    pub platform: String,
}

#[derive(Serialize, Deserialize)]
pub struct RepoAsset {
    pub name: String,
    pub url: String,
}

#[derive(Serialize, Deserialize)]
pub struct RepoResult {
    pub id: u64,
    pub full_name: String,
    pub description: Option<String>,
    pub html_url: String,
    pub stargazers_count: u64,
    pub language: Option<String>,
    pub topics: Vec<String>,
    pub avatar_url: String,
    pub assets: Vec<RepoAsset>,
}

#[tauri::command]
pub async fn search_repositories(
    params: SearchParams,
    _db: State<'_, DbPool>,
) -> Result<Vec<RepoResult>, String> {
    let client = reqwest::Client::new();
    let topic_query = build_topic_query(&params.category);
    let search_query = if topic_query.is_empty() {
        params.query.clone()
    } else {
        format!("{}+{}", params.query, topic_query)
    };

    let url = format!(
        "https://api.github.com/search/repositories?q={}&sort=stars&order=desc&per_page=30",
        search_query
    );

    let response = client
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("GitHub API error: {}", response.status()));
    }

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let items = json["items"].as_array().ok_or("No items in response")?;

    let mut results = Vec::new();
    for item in items {
        let owner = item["owner"]["login"].as_str().unwrap_or("");
        let repo = item["name"].as_str().unwrap_or("");

        let assets = fetch_release_assets(&client, owner, repo, &params.platform).await;
        if !assets.is_empty() {
            results.push(RepoResult {
                id: item["id"].as_u64().unwrap_or(0),
                full_name: item["full_name"].as_str().unwrap_or("").to_string(),
                description: item["description"].as_str().map(|s| s.to_string()),
                html_url: item["html_url"].as_str().unwrap_or("").to_string(),
                stargazers_count: item["stargazers_count"].as_u64().unwrap_or(0),
                language: item["language"].as_str().map(|s| s.to_string()),
                topics: item["topics"]
                    .as_array()
                    .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
                    .unwrap_or_default(),
                avatar_url: item["owner"]["avatar_url"].as_str().unwrap_or("").to_string(),
                assets,
            });
        }
    }

    Ok(results)
}

#[tauri::command]
pub async fn fetch_latest_release(
    owner: String,
    repo: String,
    platform: String,
) -> Result<Vec<RepoAsset>, String> {
    let client = reqwest::Client::new();
    let assets = fetch_release_assets(&client, &owner, &repo, &platform).await;
    Ok(assets)
}

async fn fetch_release_assets(
    client: &reqwest::Client,
    owner: &str,
    repo: &str,
    platform: &str,
) -> Vec<RepoAsset> {
    let url = format!(
        "https://api.github.com/repos/{}/{}/releases/latest",
        owner, repo
    );

    let response = match client
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await
    {
        Ok(r) => r,
        Err(_) => return Vec::new(),
    };

    if !response.status().is_success() {
        return Vec::new();
    }

    let json: serde_json::Value = match response.json().await {
        Ok(j) => j,
        Err(_) => return Vec::new(),
    };

    let assets = json["assets"].as_array().unwrap_or(&Vec::new());
    let extensions = get_platform_extensions(platform);

    assets
        .iter()
        .filter_map(|asset| {
            let name = asset["name"].as_str().unwrap_or("");
            if extensions.iter().any(|ext| name.to_lowercase().ends_with(ext)) {
                Some(RepoAsset {
                    name: name.to_string(),
                    url: asset["browser_download_url"].as_str().unwrap_or("").to_string(),
                })
            } else {
                None
            }
        })
        .collect()
}

fn get_platform_extensions(platform: &str) -> Vec<&str> {
    match platform {
        "windows" => vec![".exe", ".msi"],
        "linux" => vec![".deb", ".rpm", ".AppImage"],
        "android" => vec![".apk"],
        _ => vec![],
    }
}

fn build_topic_query(category: &str) -> String {
    let topics = match category {
        "dev-tools" => vec!["developer-tools", "ide", "code-editor"],
        "media" => vec!["media-player", "audio-player", "video-player", "music"],
        "communication" => vec!["chat", "messaging", "email", "voip"],
        "utilities" => vec!["utility", "file-manager", "system-tools"],
        "games" => vec!["game", "gaming"],
        "security" => vec!["security", "encryption", "password-manager"],
        "networking" => vec!["networking", "vpn", "proxy", "browser"],
        "productivity" => vec!["productivity", "note-taking", "calendar"],
        _ => vec![],
    };

    if topics.is_empty() {
        String::new()
    } else {
        topics
            .iter()
            .map(|t| format!("topic:{}", t))
            .collect::<Vec<_>>()
            .join("+OR+")
    }
}
