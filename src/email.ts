import { createMimeMessage } from "mimetext";
import { EmailMessage } from "cloudflare:email";
import PostalMime from "postal-mime";
import { Env } from './types';
import { getConfig } from './config';
import { cleanEmailContent, parseAIResponse, renderEmailTemplate } from './utils';
import { getAiPrompt } from './constants';
import { callAI } from './services/ai';

export const emailHandler = async (message: EmailMessage, env: Env, ctx: any) => {
    const config = await getConfig(env);
    const rawStr = await new Response(message.raw).text();
    const parser = await PostalMime.parse(rawStr);

    // 解析发件人信息
    const fromHeader = (Array.isArray(parser.from) ? parser.from[0] : parser.from) || { name: "", address: message.from };
    const senderName = fromHeader.name || fromHeader.address.split('@')[0] || "发件人";

    // 内容清洗与 AI 调用
    const cleanedContent = cleanEmailContent(parser.html || "", parser.text || "");
    let aiResult = { response: "", provider: "None", debug: {} as any };
    try {
        const prompt = getAiPrompt(config.SYSTEM_LANGUAGE).replace("{CONTENT}", cleanedContent);
        aiResult = await callAI(env, config, prompt);
    } catch (e: any) {
        console.error("AI Service Error:", e);
        aiResult = {
            response: JSON.stringify({ title: "新邮件通知", summary: "AI 服务暂时不可用，已直接为您转发原文。", category: "other", code: "", link: "", action: false, keyPoints: [] }),
            provider: "Fallback",
            debug: { error: e.message }
        };
    }

    const processTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
    const data = parseAIResponse(aiResult.response);

    // 渲染 HTML
    const htmlContent = renderEmailTemplate({
        senderName,
        processTime,
        title: data.title,
        summary: data.summary,
        code: data.code,
        link: data.link,
        category: data.category,
        action: data.action,
        keyPoints: data.keyPoints,
        htmlOriginal: parser.html || "",
        textOriginal: parser.text || "",
        footerText: config.FOOTER_TEXT,
        provider: aiResult.provider,
        language: config.SYSTEM_LANGUAGE
    });

    // 构造邮件标题（验证码邮件在标题中追加验证码）
    let subject = data.title || "新邮件通知";
    if (data.code) {
        subject = `🔐 验证码: ${data.code} | ${subject}`;
    }

    // 构造并发送邮件
    const msg = createMimeMessage();
    msg.setSender({ name: `${senderName} (AI)`, addr: message.to });
    msg.setRecipient(config.TARGET_EMAIL);
    msg.setSubject(subject);
    msg.addMessage({ contentType: "text/html", data: htmlContent });

    const newMessage = new EmailMessage(message.to, config.TARGET_EMAIL, msg.asRaw());
    await env.SEND_EMAIL.send(newMessage);
};

export default {
    email: emailHandler,
};
