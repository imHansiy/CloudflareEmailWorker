# 🤖 AI Agent Deployment Guide for IntelEmail-Hub

This document provides a technical roadmap for AI agents (like Gemini, Claude, or GPT) to autonomously install, configure, and deploy this project.

## 📋 Prerequisites checklist
- [ ] Active terminal access.
- [ ] `node >= 18` and `npm` installed.
- [ ] Cloudflare account with `wrangler` CLI authenticated (`wrangler login`).

---

## 🛠 Installation Workflow

### 1. Initialize & Dependencies
The agent should first install all required packages at the project root.
```bash
# Install core dependencies for both worker and admin UI
npm install
```

### 2. Cloudflare Resource Setup
This project depends on **Cloudflare KV** and **Email Routing**.

#### A. KV Namespace
If `CONFIG_KV` doesn't exist, create it:
```bash
npx wrangler kv:namespace create CONFIG_KV
```
**Action**: The agent must extract the `id` from the command output and update the `kv_namespaces` section in `wrangler.jsonc`.

#### B. Email Routing
Ensure the user has enabled "Email Routing" in the Cloudflare Dashboard for the target domain.

### 3. Build & Deploy
The deployment is a two-step process handled by a single script:
1. **Frontend**: Vite builds the React admin UI into `dist/client`.
2. **Backend**: Wrangler deploys the Worker and uploads the assets.

```bash
# Execute full deployment pipeline
npm run deploy
```

---

## ⚙️ Configuration Schema
The project uses a `settings` key in the `CONFIG_KV` namespace. If the agent needs to pre-initialize the system, write a JSON object to KV:

| Key               | Description                          | Default      |
| ----------------- | ------------------------------------ | ------------ |
| `ADMIN_PASSWORD`  | Access key for Admin UI              | `admin888`   |
| `SYSTEM_LANGUAGE` | Default UI language (`zh`/`en`/`ja`) | `zh`         |
| `TARGET_EMAIL`    | Where summarized emails are sent     | (User input) |
| `OPENAI_API_KEY`  | Key for primary AI engine            | (Optional)   |

---

## 🧪 Post-Deployment Verification
After `npm run deploy` succeeds:
1. **URL Discovery**: Extract the Worker URL from the Wrangler output (e.g., `https://email-worker.user.workers.dev`).
2. **Health Check**: Attempt to navigate to the URL and verify the login screen appears.
3. **Login**: Use the default password (`admin888`) to gain access.
4. **Endpoint Test**: Verify `/api/config` responds to ensure KV binding is active.

## 🚩 Troubleshooting for Agents
- **Static Assets 404**: Ensure `dist/client` was populated by Vite before the Wrangler upload.
- **KV Binding error**: Check if the `id` in `wrangler.jsonc` matches your actual KV namespace ID.
- **Unauthorized 401**: Ensure the `pwd` parameter is correctly passed in API requests or the `admin_pwd` is set in LocalStorage.

---
*Note: This project adheres to the Cloudflare Free Tier limits.*
