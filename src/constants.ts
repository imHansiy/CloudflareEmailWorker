export const DEFAULT_CONFIG = {
  TARGET_EMAIL: "your-email@example.com",
  FOOTER_TEXT: "由智能邮件助手自动总结",
  CF_AI_MODEL: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_MODEL: "gpt-4o-mini",
  ADMIN_PASSWORD: "admin888",
  SYSTEM_LANGUAGE: "zh"
};

export const LANGUAGES = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
];

export const getAiPrompt = (lang: string = 'zh') => {
  const langMap: Record<string, string> = {
    'zh': '中文',
    'en': 'English',
    'ja': 'Japanese'
  };
  const targetLang = langMap[lang] || '中文';

  return `Analyze the following email content and extract key information. Reply strictly in JSON format. All textual values (title, summary, keyPoints) MUST be in ${targetLang}.

Fields:
- title: Brief summary of the email (approx. 15 characters or equivalent length)
- summary: Detailed summary of core content (100-300 words/characters, including key details like time, amount, donor, etc.)
- code: If the email contains a verification code (e.g., "Your code is 123456"), extract it. Note: Years (e.g., 2026), copyright years, or dates are NOT codes. If none, return an empty string.
- link: If there's a verification/confirmation/activation link, extract the full URL. If none, return an empty string.
- category: One of: verification, notification, newsletter, transaction, social, other.
- action: Boolean, true if user action is required (e.g., click link, enter code).
- keyPoints: Array of strings (max 5 items), each approx. 20 characters, summarizing main points.

Email Content:
{CONTENT}

Output only the JSON block.`;
};

