import { Hono } from 'hono'
import { emailHandler } from './email'
import { getConfig } from './config'

interface Env {
    SEND_EMAIL: any;
    AI: any;
    CONFIG_KV: KVNamespace;
    ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>()

// ===== API 接口（供 React 前端调用）=====

app.get('/api/config', async (c) => {
    console.log(`[API] GET /api/config request received`);
    const config = await getConfig(c.env);
    const pwd = c.req.query('pwd');

    if (pwd !== config.ADMIN_PASSWORD) {
        console.warn(`[API] Unauthorized access attempt with pwd: ${pwd}`);
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const raw = await c.env.CONFIG_KV.get("settings");
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    return c.json({ config, raw: raw ? JSON.parse(raw) : null });
})

app.post('/api/save', async (c) => {
    console.log(`[API] POST /api/save request received`);
    const body = await c.req.json();
    const config = await getConfig(c.env);

    if (body.pwd !== config.ADMIN_PASSWORD) {
        console.warn(`[API] Unauthorized save attempt`);
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const s = body.settings;
    const newSettings = {
        TARGET_EMAIL: String(s.TARGET_EMAIL || "").trim(),
        FOOTER_TEXT: String(s.FOOTER_TEXT || "").trim(),
        CF_AI_MODEL: String(s.CF_AI_MODEL || "").trim(),
        OPENAI_API_KEY: String(s.OPENAI_API_KEY || "").trim(),
        OPENAI_BASE_URL: String(s.OPENAI_BASE_URL || "").trim(),
        OPENAI_MODEL: String(s.OPENAI_MODEL || "").trim(),
        ADMIN_PASSWORD: String(s.ADMIN_PASSWORD || config.ADMIN_PASSWORD).trim(),
        SYSTEM_LANGUAGE: String(s.SYSTEM_LANGUAGE || "zh").trim(),
    };

    await c.env.CONFIG_KV.put("settings", JSON.stringify(newSettings));
    console.log(`[API] Configuration updated and saved to KV`);
    return c.json({ success: true });
})

// ===== 所有非 API 的请求，统统交给 ASSETS 处理（返回 React SPA）=====
// 这是 Cloudflare 官方推荐的标准模式
app.post('/api/test-openai', async (c) => {
    const body = await c.req.json();
    const { key, url, model, pwd } = body;
    const config = await getConfig(c.env);

    if (pwd !== config.ADMIN_PASSWORD) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!key || !url || !model) {
        return c.json({ error: 'Missing parameters' }, 400);
    }

    const start = Date.now();
    try {
        const response = await fetch(`${url.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'say hi' }],
                max_tokens: 5
            })
        });

        const duration = Date.now() - start;
        const result = await response.json() as any;

        if (response.ok) {
            return c.json({
                success: true,
                latency: duration,
                message: result.choices?.[0]?.message?.content || '成功获取响应'
            });
        } else {
            return c.json({
                success: false,
                error: result.error?.message || `HTTP ${response.status}: ${response.statusText}`
            }, 400);
        }
    } catch (e: any) {
        return c.json({ success: false, error: e.message || '网络连接失败' }, 500);
    }
})

app.post('/api/test-summary', async (c) => {
    const body = await c.req.json();
    const { pwd, testContent, config: customConfig } = body;
    const config = await getConfig(c.env);

    if (pwd !== config.ADMIN_PASSWORD) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { callAI } = await import('./services/ai');
    const { parseAIResponse } = await import('./utils');
    const { getAiPrompt } = await import('./constants');

    // 优先使用传入的临时配置（用于诊断测试），否则使用全局配置
    const activeConfig = customConfig ? { ...config, ...customConfig } : config;

    const sampleContent = testContent || "这是一封来自 GitHub 的通知邮件，告知您的 Pull Request #42 已被合并。项目名：CloudflareEmailWorker。合并者：admin。";
    const prompt = getAiPrompt(activeConfig.SYSTEM_LANGUAGE).replace("{CONTENT}", sampleContent);

    const start = Date.now();
    try {
        const aiResult = await callAI(c.env, activeConfig, prompt);
        const duration = Date.now() - start;
        const parsed = parseAIResponse(aiResult.response);
        return c.json({
            success: true,
            latency: duration,
            provider: aiResult.provider,
            rawResponse: aiResult.response,
            parsedResult: parsed,
            debug: aiResult.debug
        });
    } catch (e: any) {
        console.error(`[TestSummary] Error: ${e.message}`);
        return c.json({
            success: false,
            error: e.message || "AI 解析失败",
            latency: Date.now() - start
        }, 500);
    }
})

app.all('*', async (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
})

export default {
    fetch: app.fetch,
    email: emailHandler,
}
