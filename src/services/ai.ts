import { Env, AppConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

export async function callAI(env: Env, config: AppConfig, prompt: string) {
    // ===== 路径 1: OpenAI 兼容接口 (优先) =====
    if (config.OPENAI_API_KEY) {
        try {
            const baseUrl = config.OPENAI_BASE_URL.replace(/\/+$/, "");
            const res = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: config.OPENAI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`OpenAI API ${res.status}: ${errText.slice(0, 200)}`);
            }

            const json = await res.json() as any;
            const choice = json.choices?.[0] || {};
            const msg = choice.message || choice.delta || {};
            const content = msg.content
                || msg.reasoning_content
                || msg.text
                || json.output?.text
                || json.output?.choices?.[0]?.message?.content
                || json.result
                || "";

            const fullResponseStr = JSON.stringify(json).slice(0, 2000);
            const finalResponse = content || `[RAW_API_RESPONSE] ${fullResponseStr}`;

            return {
                response: finalResponse,
                provider: `${config.OPENAI_MODEL}`,
                debug: { fullApiResponse: fullResponseStr, extractedContent: String(content).slice(0, 500) }
            };
        } catch (openaiErr: any) {
            // OpenAI 失败，自动降级到 Cloudflare Workers AI
            console.warn("[AI] OpenAI failed, falling back to CF Workers AI:", openaiErr.message);
        }
    }

    // ===== 路径 2: Cloudflare Workers AI (保底) =====
    const cfModel = config.CF_AI_MODEL || DEFAULT_CONFIG.CF_AI_MODEL;
    console.log(`[AI] Using CF Workers AI: model=${cfModel}`);

    let aiResponse: any;
    try {
        aiResponse = await env.AI.run(cfModel, {
            messages: [
                { role: "system", content: "你是一个专业的邮件分析助手，请严格按要求输出 JSON 格式。" },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
        });
    } catch (chatErr) {
        console.warn("[AI] CF chat format failed, fallback to prompt format:", chatErr);
        aiResponse = await env.AI.run(cfModel, { prompt });
    }

    const rawResponse = typeof aiResponse === 'string'
        ? aiResponse
        : aiResponse?.response || aiResponse?.result || JSON.stringify(aiResponse);

    return {
        response: rawResponse,
        provider: `CF-${cfModel.split('/').pop()}`,
        debug: { rawAiResponse: String(rawResponse).slice(0, 500) }
    };
}
