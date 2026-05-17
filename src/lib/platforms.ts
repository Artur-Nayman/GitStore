export type Platform = 'windows' | 'linux' | 'android';

export const platformExtensions: Record<Platform, string[]> = {
  windows: ['.exe', '.msi'],
  linux: ['.deb', '.rpm', '.AppImage'],
  android: ['.apk'],
};

export const platformLabels: Record<Platform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  android: 'Android',
};

export const detectPlatform = (): Platform => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/linux/i.test(ua)) return 'linux';
  return 'windows';
};

export const filterAssetsByPlatform = (
  assets: Array<{ name: string; browser_download_url: string }>,
  platform: Platform
): Array<{ name: string; url: string }> => {
  const extensions = platformExtensions[platform];
  return assets
    .filter(asset => extensions.some(ext => asset.name.toLowerCase().endsWith(ext)))
    .map(asset => ({ name: asset.name, url: asset.browser_download_url }));
};
