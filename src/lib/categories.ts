export const categories = [
  { id: 'all', label: 'All', topics: [] },
  { id: 'dev-tools', label: 'Developer Tools', topics: ['developer-tools', 'ide', 'code-editor'] },
  { id: 'media', label: 'Media', topics: ['media-player', 'audio-player', 'video-player', 'music'] },
  { id: 'communication', label: 'Communication', topics: ['chat', 'messaging', 'email', 'voip'] },
  { id: 'utilities', label: 'Utilities', topics: ['utility', 'file-manager', 'system-tools'] },
  { id: 'games', label: 'Games', topics: ['game', 'gaming'] },
  { id: 'security', label: 'Security', topics: ['security', 'encryption', 'password-manager'] },
  { id: 'networking', label: 'Networking', topics: ['networking', 'vpn', 'proxy', 'browser'] },
  { id: 'productivity', label: 'Productivity', topics: ['productivity', 'note-taking', 'calendar'] },
];

export const buildTopicQuery = (categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  if (!category || category.topics.length === 0) return '';
  return category.topics.map(t => `topic:${t}`).join('+OR+');
};
