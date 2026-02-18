import { Readability } from "@mozilla/readability";
import { DOMParser } from "linkedom";

export function cleanEmailContent(html: string, text?: string): string {
    let mainText = "";
    let extractedLinks: string[] = [];

    if (html) {
        try {
            // 1. 从原始 HTML 中提取所有链接（纯结构解析，无语言依赖）
            const linkMatches = html.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
            for (const m of linkMatches) {
                const url = m[1]?.trim();
                if (url && !url.startsWith('mailto:') && !url.startsWith('#') && url.length > 10) {
                    const linkText = m[2]?.replace(/<[^>]+>/g, '').trim() || '';
                    extractedLinks.push(`${linkText} → ${url}`);
                }
            }

            // 2. 将链接保留在 HTML 中：<a href="url">text</a> → text [url]
            const htmlWithLinks = html.replace(
                /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
                (_, url, linkText) => {
                    const cleanText = linkText.replace(/<[^>]+>/g, '').trim();
                    return `${cleanText} [${url}]`;
                }
            );

            // 3. 用 Readability 提取正文（保留了内联链接）
            const doc = new DOMParser().parseFromString(htmlWithLinks, "text/html");
            const reader = new Readability(doc as any);
            const article = reader.parse();
            if (article && article.textContent) {
                mainText = article.textContent.replace(/\s+/g, ' ').trim();
            }
        } catch (e) { }
    }

    // 4. 兜底：直接用纯文本
    if (!mainText) {
        mainText = (text || html || "").replace(/<[^>]+>/g, "\n").slice(0, 5000);
    }

    // 5. 附加提取到的链接（确保 AI 能看到完整 URL）
    if (extractedLinks.length > 0) {
        mainText += `\n\n[邮件中的链接]\n${extractedLinks.join('\n')}`;
    }

    return mainText.slice(0, 8000);
}

export interface ParsedEmail {
    title: string;
    summary: string;
    code: string;
    link: string;
    category: string;
    action: boolean;
    keyPoints: string[];
}

export function parseAIResponse(response: string): ParsedEmail {
    const defaultResult: ParsedEmail = {
        title: "新邮件通知",
        summary: "AI 未能生成有效总结，请查看原文。",
        code: "",
        link: "",
        category: "other",
        action: false,
        keyPoints: []
    };

    try {
        // 1. 清理 <think> 标签
        let cleanResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        // 2. 提取所有可能的 JSON 对象
        const allJsonBlocks: string[] = [];

        // 从 markdown 代码块中提取
        const mdMatches = cleanResponse.matchAll(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/g);
        for (const m of mdMatches) {
            allJsonBlocks.push(m[1]);
        }

        // 正则提取独立 JSON 块
        const jsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        let match;
        while ((match = jsonRegex.exec(cleanResponse)) !== null) {
            allJsonBlocks.push(match[0]);
        }

        // 3. 从后往前找有效 JSON（真正的答案通常在最后）
        for (let i = allJsonBlocks.length - 1; i >= 0; i--) {
            try {
                const data = JSON.parse(allJsonBlocks[i]);
                // 过滤提示词模板
                if (data.title?.includes('字以内') || data.title?.includes('中文标题')) continue;
                if (data.title && data.summary) {
                    return {
                        title: data.title || defaultResult.title,
                        summary: data.summary || defaultResult.summary,
                        code: data.code || "",
                        link: data.link || "",
                        category: data.category || "other",
                        action: !!data.action,
                        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : []
                    };
                }
            } catch (e) {
                continue;
            }
        }

        // 4. 兜底：没有有效 JSON 时用原始文本
        if (cleanResponse.length > 10) {
            const lines = cleanResponse.split('\n').filter(l => l.trim().length > 5);
            const lastLine = lines[lines.length - 1]?.trim() || cleanResponse.slice(0, 300);
            return {
                ...defaultResult,
                title: "邮件通知",
                summary: lastLine.slice(0, 300)
            };
        }

        return defaultResult;
    } catch (e) {
        console.error("AI Parse Error:", e, "Raw:", response?.slice(0, 300));
        return defaultResult;
    }
}

// ===== I18N 字典 =====
const I18N: Record<string, any> = {
    zh: {
        verification: "验证",
        notification: "通知",
        newsletter: "订阅",
        transaction: "交易",
        social: "社交",
        other: "其他",
        code: "验证码",
        copyCode: "一键复制验证码",
        copied: "已复制!",
        codeHint: "点击验证码可直接全选 · 请在有效期内使用",
        actionLink: "操作链接",
        clickAction: "点击此处完成操作 →",
        keyPoints: "关键信息",
        actionRequired: "此邮件需要您进行操作，请及时处理",
        viewOriginal: "查看邮件原文",
        newEmail: "新邮件通知"
    },
    en: {
        verification: "Verify",
        notification: "Notice",
        newsletter: "Newsletter",
        transaction: "Billing",
        social: "Social",
        other: "Other",
        code: "Verification Code",
        copyCode: "Copy Code",
        copied: "Copied!",
        codeHint: "Click code to select · Use before expiry",
        actionLink: "Action Link",
        clickAction: "Click here to complete action →",
        keyPoints: "Key Points",
        actionRequired: "Action required, please handle promptly",
        viewOriginal: "View Original Email",
        newEmail: "New Email Notification"
    },
    ja: {
        verification: "認証",
        notification: "通知",
        newsletter: "購読",
        transaction: "取引",
        social: "ソーシャル",
        other: "その他",
        code: "認証コード",
        copyCode: "コードをコピー",
        copied: "コピー完了!",
        codeHint: "クリックで全選択 · 期限内に使用してください",
        actionLink: "操作リンク",
        clickAction: "ここをクリックして操作を完了 →",
        keyPoints: "キーポイント",
        actionRequired: "アクションが必要です。速やかに対応してください",
        viewOriginal: "元のメールを表示",
        newEmail: "新着メール通知"
    }
};

// ===== 邮件分类图标映射 =====
const CATEGORY_MAP: Record<string, { icon: string; i18nKey: string; color: string }> = {
    verification: { icon: "🔐", i18nKey: "verification", color: "#ef4444" },
    notification: { icon: "🔔", i18nKey: "notification", color: "#3b82f6" },
    newsletter: { icon: "📰", i18nKey: "newsletter", color: "#8b5cf6" },
    transaction: { icon: "💰", i18nKey: "transaction", color: "#f59e0b" },
    social: { icon: "💬", i18nKey: "social", color: "#10b981" },
    other: { icon: "📧", i18nKey: "other", color: "#6b7280" }
};

export function renderEmailTemplate(params: {
    senderName: string;
    processTime: string;
    title: string;
    summary: string;
    code: string;
    link: string;
    category: string;
    action: boolean;
    keyPoints: string[];
    htmlOriginal: string;
    textOriginal: string;
    footerText: string;
    provider: string;
    language?: string;
}) {
    const lang = params.language === 'en' || params.language === 'ja' ? params.language : 'zh';
    const t = I18N[lang];
    const cat = CATEGORY_MAP[params.category] || CATEGORY_MAP.other;
    const catLabel = t[cat.i18nKey];

    // 验证码区块
    const codeBlock = params.code ? `
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center">
        <div style="font-size:12px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">📋 ${t.code}</div>
        <div id="vc" style="font-size:40px;font-weight:900;color:#78350f;letter-spacing:10px;font-family:'Courier New',monospace;user-select:all;-webkit-user-select:all;cursor:pointer;padding:8px;background:rgba(255,255,255,0.5);border-radius:8px;display:inline-block;min-width:200px">${params.code}</div>
        <div style="margin-top:12px">
            <button onclick="navigator.clipboard.writeText('${params.code}');this.textContent='✅ ${t.copied}';setTimeout(()=>this.textContent='📋 ${t.copyCode}',2000)" style="background:#78350f;color:#fff;border:none;padding:8px 24px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:1px">📋 ${t.copyCode}</button>
        </div>
        <div style="font-size:11px;color:#a16207;margin-top:10px">${t.codeHint}</div>
    </div>` : '';

    // 验证链接区块
    const linkBlock = params.link ? `
    <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border:2px solid #3b82f6;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
        <div style="font-size:12px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">🔗 ${t.actionLink}</div>
        <a href="${params.link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600">${t.clickAction}</a>
        <div style="font-size:11px;color:#1e40af;margin-top:10px;word-break:break-all;opacity:0.7">${params.link}</div>
    </div>` : '';

    // 关键信息点区块
    const keyPointsBlock = params.keyPoints.length > 0 ? `
    <div style="margin-bottom:20px">
        <div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">📌 ${t.keyPoints}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${params.keyPoints.map(p => `<span style="display:inline-block;background:#f1f5f9;color:#334155;padding:6px 14px;border-radius:20px;font-size:13px;border:1px solid #e2e8f0">${p}</span>`).join('')}
        </div>
    </div>` : '';

    // 需要操作提示
    const actionBanner = params.action ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 16px;margin-bottom:20px;display:flex;align-items:center;gap:8px">
        <span style="font-size:16px">⚡</span>
        <span style="font-size:13px;color:#991b1b;font-weight:600">${t.actionRequired}</span>
    </div>` : '';

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif}
.wrapper{width:100%;margin:0;padding:20px 0;background:#f0f2f5}
.container{width:98%!important;max-width:100%!important;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
@media screen and (max-width: 600px) {
    .wrapper { padding: 0 !important; }
    .container { border-radius: 0 !important; width: 100% !important; }
    .header { padding: 12px 16px !important; }
    .main { padding: 16px !important; }
    .title { font-size: 18px !important; }
}
.header{padding:16px 24px;border-bottom:1px solid #f1f5f9;clear:both}
.header-left{float:left;display:inline-block}
.category-badge-container{float:right;display:inline-block;padding-top:4px}
.avatar{width:36px;height:36px;border-radius:50%;background:${cat.color};display:inline-block;vertical-align:middle;text-align:center;line-height:36px;font-size:16px}
.sender-detail{display:inline-block;vertical-align:middle;margin-left:10px}
.sender-info{font-size:12px;color:#64748b}
.sender-name{font-weight:600;color:#1e293b;font-size:14px;line-height:1.2}
.category-badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;color:${cat.color};background:${cat.color}15;border:1px solid ${cat.color}30}
.main{padding:24px;clear:both}
.title{font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;line-height:1.4}
.summary-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px}
.summary-text{color:#334155;line-height:1.8;font-size:14px;margin:0}
details{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}
summary{padding:14px 18px;cursor:pointer;color:#64748b;font-size:13px;font-weight:500;background:#fafafa;list-style:none}
summary::-webkit-details-marker{display:none}
summary::before{content:"▶ ";font-size:10px}
details[open] summary::before{content:"▼ "}
.original{padding:18px;font-size:13px;color:#475569;line-height:1.7;border-top:1px solid #e2e8f0;overflow:auto;max-height:800px;word-break:break-all}
.footer{padding:14px 24px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;overflow:hidden}
.footer-left{float:left}
.footer-right{float:right}
</style>
</head><body><div class="wrapper"><div class="container">
<div class="header">
    <div class="header-left">
        <div class="avatar">${cat.icon}</div>
        <div class="sender-detail">
            <div class="sender-name">${params.senderName}</div>
            <div class="sender-info">${params.processTime}</div>
        </div>
    </div>
    <div class="category-badge-container">
        <div class="category-badge">${cat.icon} ${catLabel}</div>
    </div>
</div>
<div class="main">
    ${actionBanner}
    ${codeBlock}
    ${linkBlock}
    <h1 class="title">${params.title || t.newEmail}</h1>
    ${keyPointsBlock}
    <div class="summary-card"><p class="summary-text">${params.summary || "..."}</p></div>
    <details><summary>📄 ${t.viewOriginal}</summary><div class="original">${params.htmlOriginal || `<pre style="white-space:pre-wrap;margin:0">${params.textOriginal || ""}</pre>`}</div></details>
</div>
<div class="footer"><div class="footer-left">${params.footerText}</div><div class="footer-right">${params.provider}</div></div>
</div></div></body></html>`;
}
