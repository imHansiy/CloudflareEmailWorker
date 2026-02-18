import { Env, AppConfig } from './types';
import { DEFAULT_CONFIG } from './constants';

export async function getConfig(env: Env): Promise<AppConfig> {
    let kvConfig: any = {};
    try {
        const kvConfigStr = await env.CONFIG_KV.get("settings");
        if (kvConfigStr) {
            const parsed = JSON.parse(kvConfigStr);
            if (parsed && typeof parsed === 'object') {
                kvConfig = parsed;
            }
        }
    } catch (e) {
        console.error("KV Config parse error:", e);
    }

    return {
        TARGET_EMAIL: kvConfig.TARGET_EMAIL || DEFAULT_CONFIG.TARGET_EMAIL,
        FOOTER_TEXT: kvConfig.FOOTER_TEXT || DEFAULT_CONFIG.FOOTER_TEXT,
        CF_AI_MODEL: kvConfig.CF_AI_MODEL || DEFAULT_CONFIG.CF_AI_MODEL,
        OPENAI_API_KEY: kvConfig.OPENAI_API_KEY || "",
        OPENAI_BASE_URL: kvConfig.OPENAI_BASE_URL || DEFAULT_CONFIG.OPENAI_BASE_URL,
        OPENAI_MODEL: kvConfig.OPENAI_MODEL || DEFAULT_CONFIG.OPENAI_MODEL,
        ADMIN_PASSWORD: kvConfig.ADMIN_PASSWORD || DEFAULT_CONFIG.ADMIN_PASSWORD,
        SYSTEM_LANGUAGE: kvConfig.SYSTEM_LANGUAGE || DEFAULT_CONFIG.SYSTEM_LANGUAGE,
    };
}
