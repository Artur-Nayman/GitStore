import { ReleaseAsset } from '../hooks/useSearch';

interface InstallButtonProps {
  asset: ReleaseAsset;
}

export default function InstallButton({ asset }: InstallButtonProps) {
  const getPlatformIcon = () => {
    const name = asset.name.toLowerCase();
    if (name.endsWith('.apk')) return '📱';
    if (name.endsWith('.exe') || name.endsWith('.msi')) return '🪟';
    if (name.endsWith('.deb') || name.endsWith('.rpm') || name.endsWith('.appimage')) return '🐧';
    return '📦';
  };

  const getLabel = () => {
    const name = asset.name.toLowerCase();
    if (name.endsWith('.apk')) return 'APK';
    if (name.endsWith('.exe')) return 'EXE';
    if (name.endsWith('.msi')) return 'MSI';
    if (name.endsWith('.deb')) return 'DEB';
    if (name.endsWith('.rpm')) return 'RPM';
    if (name.endsWith('.appimage')) return 'AppImage';
    return asset.name;
  };

  return (
    <a
      href={asset.url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary flex items-center gap-2 text-sm"
    >
      <span>{getPlatformIcon()}</span>
      <span>Install {getLabel()}</span>
    </a>
  );
}
