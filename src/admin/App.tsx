import React, { useEffect, useState } from 'react';
import {
    Layout,
    Menu,
    Typography,
    Form,
    Input,
    Button,
    Card,
    message as antMessage,
    Space,
    Badge,
    Divider,
    Result,
    Spin,
    notification,
    Tabs,
    Tag,
    Alert,
    Select,
    Popconfirm
} from 'antd';
import {
    SettingOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
    DatabaseOutlined,
    MailOutlined,
    CheckCircleOutlined,
    LogoutOutlined,
    CloudServerOutlined,
    HistoryOutlined,
    GlobalOutlined,
    GithubOutlined
} from '@ant-design/icons';
import { LANGUAGES } from '../constants';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const UI_I18N: Record<string, any> = {
    zh: {
        configCenter: '调度配置中心',
        logout: '安全退出',
        mainTitle: '算法调度配置',
        mainSub: '管理全球边缘节点的邮件过滤、提取与 AI 摘要策略。',
        diagnose: '诊断 AI 引擎',
        publish: '发布新版策略',
        basicSet: '基本设置',
        aiSet: 'AI 引擎配置',
        securitySet: '安全与高级',
        sysLang: '系统语言 (网页与 AI 总结)',
        sysLangExtra: '决定了后台界面的语言偏好以及 AI 生成邮件总结时的目标语言',
        targetEmail: '目标接收邮箱',
        targetEmailExtra: 'AI 总结后的邮件将发送至此地址',
        footerText: '总结页脚信息',
        footerTextExtra: '出现在转发邮件的最底部',
        forwardHint: '转发提示',
        forwardHintDetail: '请确保目标邮箱已配置白名单，避免 AI 总结邮件被判定为垃圾邮件。',
        restoring: '正在恢复会话...',
        pwdError: '密码不正确',
        serverError: '服务器异常',
        loadSuccess: '配置加载成功',
        diagnoseLoading: '正在执行 AI 全路径诊断 (OpenAI -> CF Fallback)...',
        saveSuccess: '配置已同步至全球节点',
        saveError: '保存失败',
        loadingTitle: '正在加载配置...',
        connectFail: '连接失败',
        primaryEngine: '主引擎：OpenAI 兼容调度',
        backupEngine: '备用引擎：Cloudflare Workers AI',
        apiKey: 'API Secret Key',
        baseUrl: '接口 Base URL',
        modelName: '模型名称',
        innerModel: '内置模型 ID',
        innerModelExtra: '推荐: @cf/meta/llama-3.1-8b-instruct-fp8-fast',
        fallbackTitle: '保底机制已激活',
        fallbackDesc: '内置引擎不仅提供备用，还参与多维度的语义校准。',
        accessControl: '管控访问',
        changePwd: '修改管理后台登录密码',
        kvSnapshot: 'KV 数据快照',
        noData: '// 未加载数据',
        checkInput: '请检查输入项',
        loginTitle: '智能邮件中台',
        loginPlaceholder: '请输入管理员密码',
        loginBtn: '进入管理后台',
        diagnoseResult: '模拟总结成功',
        diagnoseError: '总结失败',
        diagnoseHint: '标题: {title}\n摘要: {summary}...\n\n引擎: {provider}',
        logoutConfirm: '确定要退出吗？',
        emailRequired: '必须填写接收邮件',
        backupSubTitle: '控制主引擎失效时的自动平衡策略。',
        ok: '确定',
        cancel: '取消',
        githubRepo: 'GitHub 仓库'
    },
    en: {
        configCenter: 'Config Center',
        logout: 'Logout',
        mainTitle: 'Algorithm Dispatch',
        mainSub: 'Manage email filtering, extraction and AI summary strategies.',
        diagnose: 'Diagnose AI',
        publish: 'Deploy Policy',
        basicSet: 'Basic Settings',
        aiSet: 'AI Engine',
        securitySet: 'Security & Advanced',
        sysLang: 'System Language (Web & AI)',
        sysLangExtra: 'Determines the UI language and AI output language.',
        targetEmail: 'Target Email',
        targetEmailExtra: 'AI summaries will be sent to this address',
        footerText: 'Footer Text',
        footerTextExtra: 'Appears at the bottom of forwarded emails',
        forwardHint: 'Forwarding Hint',
        forwardHintDetail: 'Make sure the target mailbox is whitelisted to avoid being marked as spam.',
        restoring: 'Restoring session...',
        pwdError: 'Incorrect password',
        serverError: 'Server error',
        loadSuccess: 'Config loaded',
        diagnoseLoading: 'Running AI diagnosis (OpenAI -> CF Fallback)...',
        saveSuccess: 'Config synced to all nodes',
        saveError: 'Save failed',
        checkInput: 'Please check form fields',
        loginTitle: 'Mail Hub AI',
        loginPlaceholder: 'Enter admin password',
        loginBtn: 'Login to Admin',
        diagnoseResult: 'Simulation Success',
        diagnoseError: 'Simulation Failed',
        diagnoseHint: 'Title: {title}\nSummary: {summary}...\n\nEngine: {provider}',
        logoutConfirm: 'Confirm logout?',
        loadingTitle: 'Loading config...',
        connectFail: 'Connection failed',
        primaryEngine: 'Primary: OpenAI Compatible',
        backupEngine: 'Backup: Cloudflare Workers AI',
        apiKey: 'API Secret Key',
        baseUrl: 'Interface Base URL',
        modelName: 'Model Name',
        innerModel: 'Built-in Model ID',
        innerModelExtra: 'Recommended: @cf/meta/llama-3.1-8b-instruct-fp8-fast',
        fallbackTitle: 'Fallback Active',
        fallbackDesc: 'Built-in engine provides backup and semantic calibration.',
        accessControl: 'Access Control',
        changePwd: 'Change Admin Password',
        kvSnapshot: 'KV Data Snapshot',
        noData: '// No data loaded',
        emailRequired: 'Target email is required',
        backupSubTitle: 'Automatic balancing strategy when main engine fails.',
        ok: 'OK',
        cancel: 'Cancel',
        githubRepo: 'GitHub Repo'
    },
    ja: {
        configCenter: '配信設定センター',
        logout: 'ログアウト',
        mainTitle: 'アルゴリズム配信設定',
        mainSub: 'エッジノードのメールフィルタリング、抽出、AIサマリー戦略を管理します。',
        diagnose: 'AI診断',
        publish: 'ポリシーを適用',
        basicSet: '基本設定',
        aiSet: 'AIエンジン設定',
        securitySet: 'セキュリティ設定',
        sysLang: 'システム言語 (Web & AI)',
        sysLangExtra: '管理画面とAIサマリーの言語を決定します。',
        targetEmail: '転送先メール',
        targetEmailExtra: 'AIサマリーはこのアドレスに送信されます',
        footerText: 'フッターテキスト',
        footerTextExtra: '転送メールの最下部に表示されます',
        forwardHint: '転送時の注意',
        forwardHintDetail: 'スパム判定を避けるため、転送先メールアドレスをホワイトリストに登録してください。',
        restoring: 'セッションを復元中...',
        pwdError: 'パスワードが正しくありません',
        serverError: 'サーバーエラー',
        loadSuccess: '設定を読み込みました',
        diagnoseLoading: 'AI診断を実行中 (OpenAI -> CF Fallback)...',
        saveSuccess: '設定を保存しました',
        saveError: '保存に失敗しました',
        checkInput: '入力内容を確認してください',
        loginTitle: 'スマートメールハブ',
        loginPlaceholder: 'パスワードを入力してください',
        loginBtn: '管理画面にログイン',
        diagnoseResult: '診断成功',
        diagnoseError: '診断失敗',
        diagnoseHint: 'タイトル: {title}\nサマリー: {summary}...\n\nエンジン: {provider}',
        logoutConfirm: 'ログアウトしますか？',
        loadingTitle: '設定を読み込み中...',
        connectFail: '接続に失敗しました',
        primaryEngine: '主エンジン：OpenAI互換配信',
        backupEngine: '予備エンジン：Cloudflare Workers AI',
        apiKey: 'APIシークレットキー',
        baseUrl: 'ベースURL',
        modelName: 'モデル名',
        innerModel: '内蔵モデルID',
        innerModelExtra: '推奨: @cf/meta/llama-3.1-8b-instruct-fp8-fast',
        fallbackTitle: 'バックアップ有効',
        fallbackDesc: '内蔵エンジンは予備だけでなく、セマンティック校正にも参加します。',
        accessControl: 'アクセス制御',
        changePwd: '管理パスワードの変更',
        kvSnapshot: 'KVデータスナップショット',
        noData: '// データが読み込まれていません',
        emailRequired: '受信メールアドレスを入力してください',
        backupSubTitle: 'メインエンジン故障時の自動バランス戦略の制御。',
        ok: 'はい',
        cancel: 'いいえ',
        githubRepo: 'GitHub リポジトリ'
    }
};

const getAppLang = () => {
    return localStorage.getItem('interface_lang') || 'zh';
};

const AdminPage = () => {
    const [form] = Form.useForm();
    const systemLanguage = Form.useWatch('SYSTEM_LANGUAGE', form);

    // 基础语言从本地缓存读(用于登录页等瞬间)，然后根据 Form 状态实时切换
    const [uiLang, setUiLang] = useState(getAppLang());

    // 只要表单里的语言变了，就同步到本地缓存并更新 UI
    useEffect(() => {
        if (systemLanguage) {
            setUiLang(systemLanguage);
            localStorage.setItem('interface_lang', systemLanguage);
        }
    }, [systemLanguage]);

    const t = UI_I18N[uiLang] || UI_I18N.zh;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rawKV, setRawKV] = useState<any>(null);
    const [isLogged, setIsLogged] = useState(false);
    const [password, setPassword] = useState('');
    const [testing, setTesting] = useState(false);
    const [testingSummary, setTestingSummary] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [currentMenu, setCurrentMenu] = useState('config');
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const savedPwd = localStorage.getItem('admin_pwd');
        if (savedPwd) {
            setPassword(savedPwd);
            fetchConfig(savedPwd).finally(() => setInitializing(false));
        } else {
            setInitializing(false);
        }
    }, []);

    const fetchConfig = async (pwd: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            setLoading(true);
            const url = `/api/config?pwd=${encodeURIComponent(pwd)}&_t=${Date.now()}`;
            const res = await fetch(url, {
                signal: controller.signal,
                headers: { 'Cache-Control': 'no-cache' }
            });
            clearTimeout(timeoutId);

            if (res.status === 401) {
                antMessage.error(t.pwdError);
                setIsLogged(false);
                return;
            }
            if (!res.ok) throw new Error(`${t.serverError} (${res.status})`);

            const data = await res.json();
            if (data && data.config) {
                form.setFieldsValue(data.config);
                // 确保 UI 语言与后端配置同步
                if (data.config.SYSTEM_LANGUAGE) {
                    setUiLang(data.config.SYSTEM_LANGUAGE);
                    localStorage.setItem('interface_lang', data.config.SYSTEM_LANGUAGE);
                }
                setRawKV(data.raw || data.config);
                setIsLogged(true);
                localStorage.setItem('admin_pwd', pwd);
                antMessage.success(t.loadSuccess);
            }
        } catch (e: any) {
            clearTimeout(timeoutId);
            antMessage.error(`连接失败: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const onTestOpenAI = async () => {
        const values = form.getFieldsValue();

        try {
            setTesting(true);
            antMessage.loading({ content: t.diagnoseLoading, key: 'ai-test' });

            // 直接执行全路径模拟解析测试，这会经历真实的 callAI 逻辑：
            // 优先使用 OpenAI，如果失败（如 Key 错误或超时）则自动降级到 CF
            await onTestSummary(values);

            antMessage.destroy('ai-test');
        } catch (e: any) {
            antMessage.error({ content: `诊断中断: ${e.message}`, key: 'ai-test' });
        } finally {
            setTesting(false);
        }
    };

    const onTestSummary = async (customConfig?: any) => {
        try {
            setTestingSummary(true);
            const res = await fetch('/api/test-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pwd: password,
                    config: customConfig
                })
            });
            const data = await res.json() as any;

            console.group(`%c[邮件总结测试] ${data.success ? '✅' : '❌'}`, 'font-weight:bold');
            console.log('Provider:', data.provider);
            console.log('Result:', data.parsedResult);
            console.log('Debug:', data.debug);
            console.groupEnd();

            if (res.ok && data.success) {
                notification.success({
                    message: t.diagnoseResult,
                    description: t.diagnoseHint
                        .replace('{title}', data.parsedResult?.title || '')
                        .replace('{summary}', data.parsedResult?.summary.slice(0, 100) || '')
                        .replace('{provider}', data.provider),
                    duration: 0,
                    style: { width: 500 }
                });
            } else {
                notification.error({
                    message: t.diagnoseError,
                    description: data.error || '...',
                });
            }
        } catch (e: any) {
            antMessage.error(`${t.connectFail}: ${e.message}`);
        } finally {
            setTestingSummary(false);
        }
    };

    const onSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pwd: password, settings: values })
            });
            if (res.ok) {
                antMessage.success(t.saveSuccess);
                setRawKV(values);
            } else {
                antMessage.error(t.saveError);
            }
        } catch (e) {
            antMessage.warning(t.checkInput);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        setIsLogged(false);
        setPassword('');
        localStorage.removeItem('admin_pwd'); // 清除持久化状态
        form.resetFields();
    };

    if (initializing) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 24, fontSize: 14 }}>{t.restoring}</Text>
            </div>
        );
    }

    if (!isLogged) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', padding: 0 }} bodyStyle={{ padding: 0 }}>
                    <div style={{ background: '#1677ff', padding: '32px 24px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CloudServerOutlined style={{ color: '#fff', fontSize: 32 }} />
                        </div>
                        <Title level={3} style={{ color: '#fff', margin: 0 }}>{t.loginTitle}</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Email Intelligence Platform</Text>
                    </div>
                    <div style={{ padding: '32px 24px' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Input.Password
                                prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder={t.loginPlaceholder}
                                size="large"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onPressEnter={() => fetchConfig(password)}
                                style={{ borderRadius: 8 }}
                            />
                            <Button type="primary" size="large" block onClick={() => fetchConfig(password)} loading={loading} style={{ borderRadius: 8, height: 45, fontWeight: 'bold' }}>
                                {t.loginBtn}
                            </Button>
                            <div style={{ textAlign: 'center', fontSize: 12, color: '#999', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div>© 2026 Powered by Cloudflare Workers</div>
                                <a
                                    href="https://github.com/imHansiy/CloudflareEmailWorker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                >
                                    <GithubOutlined /> {t.githubRepo}
                                </a>
                            </div>
                        </Space>
                    </div>
                </Card>
            </div>
        );
    }

    const tabItems = [
        {
            key: '1',
            label: <span><MailOutlined />{t.basicSet}</span>,
            children: (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <Alert
                        message={t.forwardHint}
                        description={t.forwardHintDetail}
                        type="info"
                        showIcon
                        style={{ marginBottom: 24, borderRadius: 8 }}
                    />
                    <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}>
                        <Form.Item name="TARGET_EMAIL" label={<Text strong>{t.targetEmail}</Text>} rules={[{ required: true, message: t.emailRequired }]} extra={t.targetEmailExtra}>
                            <Input size="large" placeholder="your-email@example.com" prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} style={{ borderRadius: 8 }} />
                        </Form.Item>
                        <Divider style={{ margin: '24px 0' }} />
                        <Form.Item name="FOOTER_TEXT" label={<Text strong>{t.footerText}</Text>} extra={t.footerTextExtra}>
                            <Input size="large" placeholder="..." style={{ borderRadius: 8 }} />
                        </Form.Item>
                    </Card>
                </div>
            )
        },
        {
            key: '2',
            label: <span><RocketOutlined />{t.aiSet}</span>,
            children: (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <Card
                        title={
                            <Space>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
                                <Text strong>{t.primaryEngine}</Text>
                            </Space>
                        }
                        style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #e6f4ff', background: '#fdfdff' }}
                    >
                        <Form.Item name="OPENAI_API_KEY" label={t.apiKey}>
                            <Input.Password placeholder="sk-..." prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} style={{ borderRadius: 8 }} />
                        </Form.Item>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16 }}>
                            <Form.Item name="OPENAI_BASE_URL" label={t.baseUrl}>
                                <Input placeholder="https://api.openai.com/v1" style={{ borderRadius: 8 }} />
                            </Form.Item>
                            <Form.Item name="OPENAI_MODEL" label={t.modelName}>
                                <Input placeholder="gpt-4o-mini / glm-4" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </div>
                    </Card>

                    <Card
                        title={
                            <Space>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677ff' }} />
                                <Text strong>{t.backupEngine}</Text>
                            </Space>
                        }
                        style={{ borderRadius: 12, background: '#fcfcfc' }}
                    >
                        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                            {t.backupSubTitle}
                        </Paragraph>
                        <Form.Item name="CF_AI_MODEL" label={t.innerModel} extra={t.innerModelExtra}>
                            <Input placeholder="@cf/meta/llama-3.1-8b-instruct" style={{ borderRadius: 8 }} />
                        </Form.Item>
                        <Divider style={{ margin: '16px 0' }} />
                        <Alert
                            type="info"
                            showIcon
                            message={t.fallbackTitle}
                            description={t.fallbackDesc}
                            style={{ borderRadius: 8 }}
                        />
                    </Card>
                </div>
            )
        },
        {
            key: '3',
            label: <span><SafetyCertificateOutlined />{t.securitySet}</span>,
            children: (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <Card title={t.accessControl} style={{ marginBottom: 24, borderRadius: 12 }}>
                        <Form.Item name="ADMIN_PASSWORD" label={t.changePwd}>
                            <Input.Password prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} style={{ borderRadius: 8 }} />
                        </Form.Item>
                    </Card>
                    <Card title={<Space><DatabaseOutlined />{t.kvSnapshot}</Space>} style={{ borderRadius: 12, background: '#fafafa' }}>
                        <Paragraph copyable={{ text: JSON.stringify(rawKV, null, 2) }}>
                            <pre style={{ fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
                                {rawKV ? JSON.stringify(rawKV, null, 2) : t.noData}
                            </pre>
                        </Paragraph>
                    </Card>
                </div>
            )
        }
    ];

    const renderContent = () => {
        return (
            <div style={{ maxWidth: 880, margin: '0 auto' }}>
                <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <Title level={2} style={{ margin: '0 0 8px' }}>{t.mainTitle}</Title>
                        <Text type="secondary">{t.mainSub}</Text>
                    </div>
                    <Space>
                        <Button
                            icon={<RocketOutlined />}
                            loading={testing || testingSummary}
                            onClick={onTestOpenAI}
                            style={{ height: 48, borderRadius: 10, fontWeight: 'bold' }}
                        >
                            {t.diagnose}
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            loading={saving}
                            onClick={onSave}
                            style={{ height: 48, padding: '0 32px', borderRadius: 10, boxShadow: '0 4px 12px rgba(22,119,255,0.4)', fontWeight: 'bold' }}
                        >
                            {t.publish}
                        </Button>
                    </Space>
                </div>
                <Form form={form} layout="vertical">
                    {/* 隐藏字段用于持久化语言设置 */}
                    <Form.Item name="SYSTEM_LANGUAGE" hidden>
                        <Input />
                    </Form.Item>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        type="line"
                        size="large"
                        tabBarStyle={{ marginBottom: 32 }}
                    />
                </Form>
            </div>
        );
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Sider
                theme="light"
                width={260}
                style={{
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                    zIndex: 11,
                    position: 'fixed',
                    height: '100vh'
                }}
            >
                <div style={{ height: 64, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ background: '#1677ff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RocketOutlined style={{ color: '#fff' }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: '900', letterSpacing: '1px', color: '#141414' }}>MAIL HUB AI</span>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[currentMenu]}
                    onClick={({ key }) => {
                        if (key === 'github') {
                            window.open('https://github.com/imHansiy/CloudflareEmailWorker', '_blank');
                        } else {
                            setCurrentMenu(key);
                        }
                    }}
                    style={{ borderRight: 0, padding: 12 }}
                    items={[
                        { key: 'config', icon: <SettingOutlined />, label: t.configCenter },
                        { key: 'github', icon: <GithubOutlined />, label: t.githubRepo },
                    ]}
                    className="side-menu"
                />

                <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '24px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e6f4ff', color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 'bold' }}>Administrator</div>
                            <div style={{ fontSize: 10, color: '#999' }}>Cluster Master</div>
                        </div>
                    </div>
                    <Popconfirm
                        title={t.logoutConfirm}
                        onConfirm={handleLogout}
                        okText={t.ok}
                        cancelText={t.cancel}
                    >
                        <Button block icon={<LogoutOutlined />} danger>{t.logout}</Button>
                    </Popconfirm>
                </div>
            </Sider>

            <Layout style={{ marginLeft: 260 }}>
                <Header style={{ background: '#fff', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #f0f0f0' }}>
                    <Space size="large">
                        <Select
                            variant="borderless"
                            value={uiLang}
                            onChange={(val) => {
                                setUiLang(val);
                                localStorage.setItem('interface_lang', val);
                                form.setFieldsValue({ SYSTEM_LANGUAGE: val });
                            }}
                            style={{ width: 100, display: 'flex', alignItems: 'center' }}
                            suffixIcon={<GlobalOutlined style={{ color: '#1677ff' }} />}
                            popupMatchSelectWidth={false}
                        >
                            {LANGUAGES.map(lang => (
                                <Select.Option key={lang.value} value={lang.value}>{lang.label}</Select.Option>
                            ))}
                        </Select>
                        <Divider type="vertical" />
                        <Button
                            type="primary"
                            ghost
                            icon={<GithubOutlined />}
                            href="https://github.com/imHansiy/CloudflareEmailWorker"
                            target="_blank"
                            title="GitHub Repository"
                            style={{ display: 'flex', alignItems: 'center', borderRadius: 8 }}
                        >
                            {t.githubRepo}
                        </Button>
                    </Space>
                </Header>

                <Content style={{ padding: '40px 48px', minHeight: 280, animation: 'fadeIn 0.4s' }}>
                    {renderContent()}
                </Content>
            </Layout>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .side-menu .ant-menu-item {
                    border-radius: 8px !important;
                    height: 48px !important;
                    line-height: 48px !important;
                    margin-bottom: 4px !important;
                }
                .side-menu .ant-menu-item-selected {
                    background: #e6f4ff !important;
                    font-weight: bold;
                }
                .ant-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .ant-card:hover { transform: translateY(-2px); border-color: #1677ff40; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .ant-tabs-nav::before { border-bottom: none !important; }
            `}</style>
        </Layout>
    );
};

export default AdminPage;
