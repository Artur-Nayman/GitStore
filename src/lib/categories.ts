export const categories = [
  { id: 'all', label: 'All', topics: [] },
  { id: 'dev-tools', label: 'Developer Tools', topics: ['developer-tools', 'ide', 'code-editor', 'devtools'] },
  { id: 'media', label: 'Media & Entertainment', topics: ['media-player', 'audio-player', 'video-player', 'music', 'podcast'] },
  { id: 'communication', label: 'Communication', topics: ['chat', 'messaging', 'email', 'voip', 'irc', 'matrix'] },
  { id: 'utilities', label: 'Utilities', topics: ['utility', 'file-manager', 'system-tools', 'clipboard', 'launcher'] },
  { id: 'games', label: 'Games', topics: ['game', 'gaming', 'game-engine', 'emulator'] },
  { id: 'security', label: 'Security & Privacy', topics: ['security', 'encryption', 'password-manager', 'privacy', 'firewall'] },
  { id: 'networking', label: 'Networking', topics: ['networking', 'vpn', 'proxy', 'browser', 'dns', 'torrent'] },
  { id: 'productivity', label: 'Productivity', topics: ['productivity', 'note-taking', 'calendar', 'task-manager', 'kanban'] },
  { id: 'graphics', label: 'Graphics & Design', topics: ['graphics', 'image-editor', 'photo-editor', 'drawing', '3d', 'cad'] },
  { id: 'science', label: 'Science & Education', topics: ['science', 'education', 'math', 'physics', 'chemistry', 'biology'] },
  { id: 'finance', label: 'Finance & Business', topics: ['finance', 'accounting', 'invoice', 'budget', 'crypto'] },
  { id: 'ai-ml', label: 'AI & Machine Learning', topics: ['machine-learning', 'artificial-intelligence', 'llm', 'chatbot', 'neural-network'] },
  { id: 'cloud', label: 'Cloud & DevOps', topics: ['cloud', 'docker', 'kubernetes', 'ci-cd', 'monitoring', 'backup'] },
  { id: 'terminal', label: 'Terminal & CLI', topics: ['cli', 'terminal', 'shell', 'command-line', 'repl'] },
  { id: 'data', label: 'Data & Databases', topics: ['database', 'data-visualization', 'analytics', 'etl'] },
];

export const buildTopicQuery = (categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  if (!category || category.topics.length === 0) return '';
  return category.topics.map(t => `topic:${t}`).join('+OR+');
};
