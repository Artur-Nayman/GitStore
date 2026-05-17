pub fn is_platform_asset(filename: &str, platform: &str) -> bool {
    let lower = filename.to_lowercase();
    match platform {
        "windows" => lower.ends_with(".exe") || lower.ends_with(".msi"),
        "linux" => {
            lower.ends_with(".deb")
                || lower.ends_with(".rpm")
                || lower.ends_with(".appimage")
        }
        "android" => lower.ends_with(".apk"),
        _ => false,
    }
}
