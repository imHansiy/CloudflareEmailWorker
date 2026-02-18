export interface Env {
    SEND_EMAIL: any;
    AI: any;
    CONFIG_KV: KVNamespace;
    ASSETS: Fetcher;
}

export interface AppConfig {
    TARGET_EMAIL: string;
    FOOTER_TEXT: string;
    CF_AI_MODEL: string;
    OPENAI_API_KEY: string;
    OPENAI_BASE_URL: string;
    OPENAI_MODEL: string;
    ADMIN_PASSWORD: string;
    SYSTEM_LANGUAGE: string;
}
