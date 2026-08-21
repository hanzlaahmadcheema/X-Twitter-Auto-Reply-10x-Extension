import React, { useState, useEffect } from 'react';

export default function App() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [adminEmail, setAdminEmail] = useState(() => sessionStorage.getItem('admin_email') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Broadcast Notice State
  const [notice, setNotice] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonUrl: '',
    enabled: false
  });
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState(null);

  // AI Models Config State
  const DEFAULT_MODELS_STATE = {
    gemini: { name: 'Google Gemini', tier: 'FREE', keyRequired: true, models: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'] },
    groq: { name: 'Groq', tier: 'FREE', keyRequired: true, models: ['openai/gpt-oss-120b', 'qwen/qwen-3.6-27b'] },
    ollama: { name: 'Ollama', tier: 'FREE', keyRequired: false, models: ['gemma2:9b', 'llama3', 'mistral', 'phi3'] },
    grok: { name: 'xAI Grok', tier: 'PAID', keyRequired: true, models: ['grok-2-1212', 'grok-beta'] },
    openai: { name: 'OpenAI', tier: 'PAID', keyRequired: true, models: ['gpt-4o', 'gpt-4o-mini'] }
  };

  const [modelsConfig, setModelsConfig] = useState(DEFAULT_MODELS_STATE);
  const [modelsJsonText, setModelsJsonText] = useState(JSON.stringify(DEFAULT_MODELS_STATE, null, 2));
  const [modelsViewMode, setModelsViewMode] = useState('cards'); // 'cards' | 'json'
  const [modelsSaving, setModelsSaving] = useState(false);
  const [modelsMsg, setModelsMsg] = useState(null);

  // Features State
  const [features, setFeatures] = useState({
    extensionEnabled: true,
    enableVoiceInput: true,
    enableSelectionMenu: true,
    enableScreenshot: true,
    maxDailyRepliesPerUser: 100
  });
  const [featuresSaving, setFeaturesSaving] = useState(false);
  const [featuresMsg, setFeaturesMsg] = useState(null);

  // Tones & Lengths & Languages & SystemPrompt State
  const [tones, setTones] = useState([]);
  const [tonesSaving, setTonesSaving] = useState(false);
  const [tonesMsg, setTonesMsg] = useState(null);

  const [lengths, setLengths] = useState([]);
  const [lengthsSaving, setLengthsSaving] = useState(false);
  const [lengthsMsg, setLengthsMsg] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [languagesSaving, setLanguagesSaving] = useState(false);
  const [languagesMsg, setLanguagesMsg] = useState(null);

  const [systemPrompt, setSystemPrompt] = useState("");
  const [systemPromptSaving, setSystemPromptSaving] = useState(false);
  const [systemPromptMsg, setSystemPromptMsg] = useState(null);

  // Active Admin Section Tab ('killswitch' | 'models' | 'tones' | 'lengths' | 'languages' | 'prompt' | 'notice' | 'users')
  const [activeTab, setActiveTab] = useState('killswitch');

  // Parse token from Google OAuth redirect URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');

    if (tokenFromUrl) {
      const cleanEmail = (emailFromUrl || '').toLowerCase().trim();
      setAdminToken(tokenFromUrl);
      setAdminEmail(cleanEmail);
      sessionStorage.setItem('admin_token', tokenFromUrl);
      sessionStorage.setItem('admin_email', cleanEmail);

      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchFullConfig = async (tokenToUse = adminToken) => {
    if (!tokenToUse) return;
    try {
      const res = await fetch('/api/admin?type=config', {
        headers: { 'Authorization': `Bearer ${tokenToUse}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          if (data.config.features) setFeatures(data.config.features);
          if (data.config.models) {
            setModelsConfig(data.config.models);
            setModelsJsonText(JSON.stringify(data.config.models, null, 2));
          }
          if (data.config.tones) setTones(data.config.tones);
          if (data.config.lengths) setLengths(data.config.lengths);
          if (data.config.languages) setLanguages(data.config.languages);
          if (data.config.systemPrompt) setSystemPrompt(data.config.systemPrompt);
        }
      }
    } catch (err) {
      console.error('Failed to fetch full config:', err);
    }
  };

  const fetchNotice = async (tokenToUse = adminToken) => {
    if (!tokenToUse) return;
    try {
      const res = await fetch('/api/admin?type=notice', {
        headers: { 'Authorization': `Bearer ${tokenToUse}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notice) {
          setNotice({
            title: data.notice.title || '',
            description: data.notice.description || '',
            buttonText: data.notice.buttonText || '',
            buttonUrl: data.notice.buttonUrl || '',
            enabled: Boolean(data.notice.enabled)
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch notice:', err);
    }
  };

  const fetchUsers = async (query = '', tokenToUse = adminToken) => {
    if (!tokenToUse) return;
    try {
      setLoading(true);
      setError(null);
      const url = query ? `/api/admin?q=${encodeURIComponent(query)}` : '/api/admin';
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        const data = await res.json().catch(() => ({}));
        setAdminToken('');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_email');
        throw new Error(data.error || 'Unauthorized Google account access.');
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch users`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchUsers(search, adminToken);
      fetchNotice(adminToken);
      fetchFullConfig(adminToken);
    }
  }, [adminToken]);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth';
  };

  const handleLogout = () => {
    setAdminToken('');
    setAdminEmail('');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
    setUsers([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    try {
      setNoticeSaving(true);
      setNoticeMsg(null);
      const res = await fetch('/api/admin?type=notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ type: 'notice', ...notice })
      });

      if (!res.ok) throw new Error('Failed to save notice');
      const data = await res.json();
      if (data.notice) {
        setNotice({
          title: data.notice.title || '',
          description: data.notice.description || '',
          buttonText: data.notice.buttonText || '',
          buttonUrl: data.notice.buttonUrl || '',
          enabled: Boolean(data.notice.enabled)
        });
        setNoticeMsg({ type: 'success', text: 'Broadcast notice updated successfully!' });
      }
    } catch (err) {
      setNoticeMsg({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleSaveModels = async (payloadObj) => {
    try {
      setModelsSaving(true);
      setModelsMsg(null);
      const payload = payloadObj || modelsConfig;
      const res = await fetch('/api/admin?type=models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ type: 'models', models: payload })
      });

      if (!res.ok) throw new Error('Failed to save models config');
      const data = await res.json();
      if (data.models) {
        setModelsConfig(data.models);
        setModelsJsonText(JSON.stringify(data.models, null, 2));
        setModelsMsg({ type: 'success', text: 'AI Models & Providers updated successfully!' });
      }
    } catch (err) {
      setModelsMsg({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setModelsSaving(false);
    }
  };

  const handleSaveConfigKey = async (type, payloadData) => {
    try {
      if (type === 'features') setFeaturesSaving(true);
      if (type === 'tones') setTonesSaving(true);
      if (type === 'lengths') setLengthsSaving(true);
      if (type === 'languages') setLanguagesSaving(true);
      if (type === 'systemPrompt') setSystemPromptSaving(true);

      const res = await fetch(`/api/admin?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ type, data: payloadData })
      });

      if (!res.ok) throw new Error(`Failed to save ${type}`);
      const data = await res.json();

      const successMsg = { type: 'success', text: `${type.toUpperCase()} configuration updated successfully!` };
      if (type === 'features') { setFeatures(data.data); setFeaturesMsg(successMsg); }
      if (type === 'tones') { setTones(data.data); setTonesMsg(successMsg); }
      if (type === 'lengths') { setLengths(data.data); setLengthsMsg(successMsg); }
      if (type === 'languages') { setLanguages(data.data); setLanguagesMsg(successMsg); }
      if (type === 'systemPrompt') { setSystemPrompt(data.data); setSystemPromptMsg(successMsg); }
    } catch (err) {
      const errorMsg = { type: 'error', text: `Error: ${err.message}` };
      if (type === 'features') setFeaturesMsg(errorMsg);
      if (type === 'tones') setTonesMsg(errorMsg);
      if (type === 'lengths') setLengthsMsg(errorMsg);
      if (type === 'languages') setLanguagesMsg(errorMsg);
      if (type === 'systemPrompt') setSystemPromptMsg(errorMsg);
    } finally {
      if (type === 'features') setFeaturesSaving(false);
      if (type === 'tones') setTonesSaving(false);
      if (type === 'lengths') setLengthsSaving(false);
      if (type === 'languages') setLanguagesSaving(false);
      if (type === 'systemPrompt') setSystemPromptSaving(false);
    }
  };

  const handleUpdateProviderField = (key, field, val) => {
    setModelsConfig(prev => {
      const updated = { ...prev, [key]: { ...prev[key], [field]: val } };
      setModelsJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleUpdateModelsList = (key, rawText) => {
    const arr = rawText.split(',').map(s => s.trim()).filter(Boolean);
    handleUpdateProviderField(key, 'models', arr);
  };

  const handleAddProvider = () => {
    const providerKey = prompt("Enter new provider key (e.g. 'anthropic'):");
    if (!providerKey) return;
    const cleanKey = providerKey.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (modelsConfig[cleanKey]) {
      alert("Provider key already exists!");
      return;
    }

    setModelsConfig(prev => {
      const updated = {
        ...prev,
        [cleanKey]: {
          name: providerKey,
          tier: 'FREE',
          keyRequired: true,
          models: ['claude-3-5-haiku']
        }
      };
      setModelsJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleRemoveProvider = (key) => {
    if (!confirm(`Are you sure you want to delete provider '${key}'?`)) return;
    setModelsConfig(prev => {
      const updated = { ...prev };
      delete updated[key];
      setModelsJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const toggleVerification = async (user) => {
    try {
      setUpdatingId(user.id);
      const newStatus = !user.verified;
      const res = await fetch(`/api/admin?id=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ verified: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verified: data.user.verified } : u));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  // Login view
  if (!adminToken) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b141d', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff', padding: '20px' }}>
        <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', textAlign: 'center' }}>
          
          <img src="/logo.png" alt="HA ReplyX Logo" style={{ width: '64px', height: '64px', borderRadius: '20px', objectFit: 'contain', marginBottom: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', padding: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }} />
          
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>HA ReplyX Admin</h2>
          <p style={{ margin: '8px 0 28px', fontSize: '13px', color: '#71767b', lineHeight: '1.5' }}>
            AI-Powered Replies. Smarter X Engagement.<br />
            Sign in with authorized Google account to manage extension settings.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>

          {error && (
            <div style={{ marginTop: '18px', padding: '12px 14px', background: 'rgba(224,36,94,0.15)', border: '1px solid #e0245e', color: '#e0245e', borderRadius: '10px', fontSize: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b141d', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="HA ReplyX Logo" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'contain', padding: '2px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>HA ReplyX Admin Control Center</h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#71767b' }}>
                AI-Powered Replies. Smarter X Engagement.
                {adminEmail && <span style={{ marginLeft: '10px', color: '#1da1f2', fontWeight: 'bold' }}>({adminEmail})</span>}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { fetchUsers(search); fetchFullConfig(); fetchNotice(); }}
              style={{ background: 'rgba(255,255,255,0.06)', color: '#e7e9ea', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fas fa-rotate"></i>
              Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(224,36,94,0.12)', color: '#e0245e', border: '1px solid rgba(224,36,94,0.3)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fas fa-right-from-bracket"></i>
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'killswitch', label: 'Kill-Switch & Flags', icon: 'fas fa-shield-halved' },
            { id: 'models', label: 'AI Models', icon: 'fas fa-robot' },
            { id: 'tones', label: 'Tones & Rules', icon: 'fas fa-masks-theater' },
            { id: 'lengths', label: 'Reply Lengths', icon: 'fas fa-ruler-combined' },
            { id: 'languages', label: 'Response Languages', icon: 'fas fa-language' },
            { id: 'prompt', label: 'System Prompt', icon: 'fas fa-scroll' },
            { id: 'notice', label: 'Broadcast Notice', icon: 'fas fa-bullhorn' },
            { id: 'users', label: 'User Authorizations', icon: 'fas fa-users-gear' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#1da1f2' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#fff' : '#71767b',
                border: activeTab === tab.id ? '1px solid #1da1f2' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: KILL-SWITCH & FEATURE FLAGS */}
        {activeTab === 'killswitch' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(23,191,99,0.15)', color: '#17bf63', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                <i className="fas fa-shield-halved"></i>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Emergency Kill-Switch & Feature Flags</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#71767b' }}>Control global extension availability and feature toggles in real time.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Emergency Master Kill-Switch */}
              <div style={{ background: features.extensionEnabled ? 'rgba(23,191,99,0.08)' : 'rgba(224,36,94,0.12)', border: features.extensionEnabled ? '1px solid rgba(23,191,99,0.4)' : '1px solid rgba(224,36,94,0.4)', borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <i className={features.extensionEnabled ? 'fas fa-circle-check' : 'fas fa-triangle-exclamation'} style={{ color: features.extensionEnabled ? '#17bf63' : '#e0245e', fontSize: '16px' }}></i>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: features.extensionEnabled ? '#17bf63' : '#e0245e' }}>
                      {features.extensionEnabled ? 'Extension Toolbar Active (Normal)' : 'EMERGENCY KILL-SWITCH ACTIVE'}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#71767b' }}>
                    {features.extensionEnabled ? 'Extension functions normally across all user browsers.' : 'Auto-reply generation is disabled remotely for all users.'}
                  </p>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(features.extensionEnabled)}
                    onChange={(e) => setFeatures(prev => ({ ...prev, extensionEnabled: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#17bf63' }}
                  />
                  <span>{features.extensionEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              {/* Feature Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-microphone" style={{ color: '#1da1f2' }}></i>
                      <span>Voice Input (STT)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(features.enableVoiceInput)}
                      onChange={(e) => setFeatures(prev => ({ ...prev, enableVoiceInput: e.target.checked }))}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1da1f2' }}
                    />
                  </label>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-wand-magic-sparkles" style={{ color: '#1da1f2' }}></i>
                      <span>Selection Menu</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(features.enableSelectionMenu)}
                      onChange={(e) => setFeatures(prev => ({ ...prev, enableSelectionMenu: e.target.checked }))}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1da1f2' }}
                    />
                  </label>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-camera" style={{ color: '#1da1f2' }}></i>
                      <span>Screenshot Tool</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(features.enableScreenshot)}
                      onChange={(e) => setFeatures(prev => ({ ...prev, enableScreenshot: e.target.checked }))}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1da1f2' }}
                    />
                  </label>
                </div>
              </div>

              {/* Max Daily Quota */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '8px' }}>
                  Max Daily Replies Allowed Per User Account
                </label>
                <input
                  type="number"
                  value={features.maxDailyRepliesPerUser || 100}
                  onChange={(e) => setFeatures(prev => ({ ...prev, maxDailyRepliesPerUser: parseInt(e.target.value, 10) || 100 }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleSaveConfigKey('features', features)}
                  disabled={featuresSaving}
                  style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fas fa-floppy-disk"></i>
                  <span>{featuresSaving ? 'Saving Flags...' : 'Save Emergency Flags & Quotas'}</span>
                </button>

                {featuresMsg && (
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: featuresMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={featuresMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                    <span>{featuresMsg.text}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI MODELS & PROVIDERS */}
        {activeTab === 'models' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(29,161,242,0.15)', color: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Manage AI Models & Providers</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#71767b' }}>Configure available models served dynamically to Chrome Extension users.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModelsViewMode(m => m === 'cards' ? 'json' : 'cards')}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className={modelsViewMode === 'cards' ? 'fas fa-code' : 'fas fa-table-cells-large'}></i>
                  <span>{modelsViewMode === 'cards' ? 'JSON Mode' : 'Visual Cards Mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddProvider}
                  style={{ background: 'rgba(29,161,242,0.2)', color: '#1da1f2', border: '1px solid rgba(29,161,242,0.4)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add Provider</span>
                </button>
              </div>
            </div>

            {modelsViewMode === 'json' ? (
              <div>
                <textarea
                  rows={14}
                  value={modelsJsonText}
                  onChange={(e) => setModelsJsonText(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px', background: '#0b141d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#00ffcc', fontFamily: 'monospace', fontSize: '12px', outline: 'none', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(modelsJsonText);
                        setModelsConfig(parsed);
                        handleSaveModels(parsed);
                      } catch (err) {
                        setModelsMsg({ type: 'error', text: `Invalid JSON: ${err.message}` });
                      }
                    }}
                    disabled={modelsSaving}
                    style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-floppy-disk"></i>
                    <span>{modelsSaving ? 'Saving JSON...' : 'Save JSON Configuration'}</span>
                  </button>
                  {modelsMsg && (
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: modelsMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className={modelsMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                      <span>{modelsMsg.text}</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {Object.entries(modelsConfig).map(([pKey, pVal]) => (
                    <div key={pKey} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#1da1f2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Key: {pKey}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProvider(pKey)}
                          style={{ background: 'rgba(224,36,94,0.15)', border: 'none', color: '#e0245e', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', padding: '4px 8px' }}
                          title="Remove Provider"
                        >
                          <i className="fas fa-xmark"></i>
                        </button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#71767b', fontWeight: 'bold', marginBottom: '4px' }}>Provider Name</label>
                        <input
                          type="text"
                          value={pVal.name || ''}
                          onChange={(e) => handleUpdateProviderField(pKey, 'name', e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '11px', color: '#71767b', fontWeight: 'bold', marginBottom: '4px' }}>Tier</label>
                          <select
                            value={pVal.tier || 'FREE'}
                            onChange={(e) => handleUpdateProviderField(pKey, 'tier', e.target.value)}
                            style={{ width: '100%', padding: '8px', background: '#15202b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                          >
                            <option value="FREE">FREE</option>
                            <option value="PAID">PAID</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: '#fff' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(pVal.keyRequired)}
                              onChange={(e) => handleUpdateProviderField(pKey, 'keyRequired', e.target.checked)}
                              style={{ cursor: 'pointer', accentColor: '#1da1f2' }}
                            />
                            Key Req.
                          </label>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#71767b', fontWeight: 'bold', marginBottom: '4px' }}>Model Versions (Comma Separated)</label>
                        <textarea
                          rows={3}
                          value={(pVal.models || []).join(', ')}
                          onChange={(e) => handleUpdateModelsList(pKey, e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '11px', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => handleSaveModels()}
                    disabled={modelsSaving}
                    style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-floppy-disk"></i>
                    <span>{modelsSaving ? 'Saving Models...' : 'Save AI Models Configuration'}</span>
                  </button>

                  {modelsMsg && (
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: modelsMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className={modelsMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                      <span>{modelsMsg.text}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TONES & RULES */}
        {activeTab === 'tones' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(29,161,242,0.15)', color: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <i className="fas fa-masks-theater"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Manage Tones & System Prompt Rules</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#71767b' }}>Configure tone options and custom prompt instructions per tone.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const id = prompt("Enter new Tone ID (e.g., 'witty'):");
                  if (!id) return;
                  const label = prompt("Enter Tone Label (e.g., 'Witty'):") || id;
                  setTones(prev => [...prev, { id, label, icon: 'fas fa-star', prompt: 'Write in a witty tone.' }]);
                }}
                style={{ background: 'rgba(29,161,242,0.2)', color: '#1da1f2', border: '1px solid rgba(29,161,242,0.4)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fas fa-plus"></i>
                <span>Add Tone</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
              {tones.map((t, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '130px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>Tone ID</label>
                    <input
                      type="text"
                      value={t.id}
                      onChange={(e) => {
                        const updated = [...tones];
                        updated[idx].id = e.target.value;
                        setTones(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <div style={{ width: '140px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>Label</label>
                    <input
                      type="text"
                      value={t.label}
                      onChange={(e) => {
                        const updated = [...tones];
                        updated[idx].label = e.target.value;
                        setTones(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>System Prompt Rule</label>
                    <input
                      type="text"
                      value={t.prompt || ''}
                      onChange={(e) => {
                        const updated = [...tones];
                        updated[idx].prompt = e.target.value;
                        setTones(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setTones(prev => prev.filter((_, i) => i !== idx))}
                    style={{ background: 'rgba(224,36,94,0.15)', border: 'none', color: '#e0245e', cursor: 'pointer', fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => handleSaveConfigKey('tones', tones)}
                disabled={tonesSaving}
                style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-floppy-disk"></i>
                <span>{tonesSaving ? 'Saving Tones...' : 'Save Tone Rules'}</span>
              </button>

              {tonesMsg && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: tonesMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={tonesMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                  <span>{tonesMsg.text}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REPLY LENGTHS */}
        {activeTab === 'lengths' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(29,161,242,0.15)', color: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <i className="fas fa-ruler-combined"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Manage Reply Length Options</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#71767b' }}>Configure length presets and character constraints.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {lengths.map((l, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '130px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>ID</label>
                    <input
                      type="text"
                      value={l.id}
                      onChange={(e) => {
                        const updated = [...lengths];
                        updated[idx].id = e.target.value;
                        setLengths(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <div style={{ width: '140px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>Label</label>
                    <input
                      type="text"
                      value={l.label}
                      onChange={(e) => {
                        const updated = [...lengths];
                        updated[idx].label = e.target.value;
                        setLengths(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>Length Value / Instruction</label>
                    <input
                      type="text"
                      value={l.value || ''}
                      onChange={(e) => {
                        const updated = [...lengths];
                        updated[idx].value = e.target.value;
                        setLengths(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => handleSaveConfigKey('lengths', lengths)}
                disabled={lengthsSaving}
                style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-floppy-disk"></i>
                <span>{lengthsSaving ? 'Saving Lengths...' : 'Save Length Rules'}</span>
              </button>

              {lengthsMsg && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: lengthsMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={lengthsMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                  <span>{lengthsMsg.text}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: RESPONSE LANGUAGES */}
        {activeTab === 'languages' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(29,161,242,0.15)', color: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <i className="fas fa-language"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Manage Response Languages</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#71767b' }}>Configure supported speech & target text languages served dynamically to extension users.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const id = prompt("Enter Language ID (e.g., 'es-ES'):");
                  if (!id) return;
                  const label = prompt("Enter Language Label (e.g., 'Spanish'):") || id;
                  setLanguages(prev => [...prev, { id, label, code: id, prompt: `Respond in clear, natural ${label}.` }]);
                }}
                style={{ background: 'rgba(29,161,242,0.2)', color: '#1da1f2', border: '1px solid rgba(29,161,242,0.4)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fas fa-plus"></i>
                <span>Add Language</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {languages.map((langItem, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '130px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>ID / Code</label>
                    <input
                      type="text"
                      value={langItem.id}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].id = e.target.value;
                        updated[idx].code = e.target.value;
                        setLanguages(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>Display Label</label>
                    <input
                      type="text"
                      value={langItem.label}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].label = e.target.value;
                        setLanguages(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#71767b', fontWeight: 'bold', marginBottom: '2px' }}>Prompt Rule / System Instruction</label>
                    <input
                      type="text"
                      value={langItem.prompt || ''}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].prompt = e.target.value;
                        setLanguages(updated);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setLanguages(prev => prev.filter((_, i) => i !== idx))}
                    style={{ background: 'rgba(224,36,94,0.15)', border: 'none', color: '#e0245e', cursor: 'pointer', fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => handleSaveConfigKey('languages', languages)}
                disabled={languagesSaving}
                style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-floppy-disk"></i>
                <span>{languagesSaving ? 'Saving Languages...' : 'Save Language Options'}</span>
              </button>

              {languagesMsg && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: languagesMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={languagesMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                  <span>{languagesMsg.text}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: MASTER SYSTEM PROMPT */}
        {activeTab === 'prompt' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(29,161,242,0.15)', color: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                <i className="fas fa-scroll"></i>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Master System Prompt Template</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#71767b' }}>Customize global AI system identity guidelines and dynamic variable placeholders.</p>
              </div>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '11px', color: '#1da1f2', background: 'rgba(29,161,242,0.1)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-circle-info"></i>
              <span>Available Placeholders: <code>{`{{persona}}`}</code>, <code>{`{{tone}}`}</code>, <code>{`{{accountName}}`}</code>, <code>{`{{lang}}`}</code>, <code>{`{{length}}`}</code>, <code>{`{{customPrompt}}`}</code>, <code>{`{{personalityProfile}}`}</code></span>
            </div>

            <textarea
              rows={14}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px', background: '#0b141d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontFamily: 'monospace', fontSize: '12px', outline: 'none', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => handleSaveConfigKey('systemPrompt', systemPrompt)}
                disabled={systemPromptSaving}
                style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-floppy-disk"></i>
                <span>{systemPromptSaving ? 'Saving Master Prompt...' : 'Save Master System Prompt'}</span>
              </button>

              {systemPromptMsg && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: systemPromptMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={systemPromptMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                  <span>{systemPromptMsg.text}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: BROADCAST NOTICE */}
        {activeTab === 'notice' && (
          <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(29,161,242,0.15)', color: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  <i className="fas fa-bullhorn"></i>
                </div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Broadcast Extension Notice</h2>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: notice.enabled ? '#17bf63' : '#71767b' }}>
                <input
                  type="checkbox"
                  checked={notice.enabled}
                  onChange={(e) => setNotice(prev => ({ ...prev, enabled: e.target.checked }))}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#17bf63' }}
                />
                <span>{notice.enabled ? 'Notice Active' : 'Notice Disabled'}</span>
              </label>
            </div>

            <form onSubmit={handleSaveNotice} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g. Version 4.0 Update Released!"
                  value={notice.title}
                  onChange={(e) => setNotice(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Notice Description</label>
                <textarea
                  placeholder="Describe what users should know..."
                  value={notice.description}
                  onChange={(e) => setNotice(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Button Label (CTA)</label>
                <input
                  type="text"
                  placeholder="e.g. View Full Details"
                  value={notice.buttonText}
                  onChange={(e) => setNotice(prev => ({ ...prev, buttonText: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Button Target URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://x.com/your_handle"
                  value={notice.buttonUrl}
                  onChange={(e) => setNotice(prev => ({ ...prev, buttonUrl: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={noticeSaving}
                  style={{
                    background: '#1da1f2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: noticeSaving ? 'not-allowed' : 'pointer',
                    opacity: noticeSaving ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fas fa-bullhorn"></i>
                  <span>{noticeSaving ? 'Saving Notice...' : 'Save & Broadcast Notice'}</span>
                </button>

                {noticeMsg && (
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: noticeMsg.type === 'success' ? '#17bf63' : '#e0245e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={noticeMsg.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
                    <span>{noticeMsg.text}</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB 8: USERS & AUTHORIZATION */}
        {activeTab === 'users' && (
          <div>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search users by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button
                type="submit"
                style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-magnifying-glass"></i>
                <span>Search</span>
              </button>
            </form>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(224,36,94,0.15)', border: '1px solid #e0245e', color: '#e0245e', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '16px', color: '#71767b', fontWeight: 'bold' }}>User Email</th>
                    <th style={{ padding: '16px', color: '#71767b', fontWeight: 'bold' }}>Status</th>
                    <th style={{ padding: '16px', color: '#71767b', fontWeight: 'bold' }}>Joined</th>
                    <th style={{ padding: '16px', color: '#71767b', fontWeight: 'bold' }}>Last Login</th>
                    <th style={{ padding: '16px', color: '#71767b', fontWeight: 'bold', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#71767b' }}>
                        Loading authorized user records...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#71767b' }}>
                        No user accounts found.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{u.email}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: u.verified ? 'rgba(23,191,99,0.15)' : 'rgba(224,36,94,0.15)',
                            color: u.verified ? '#17bf63' : '#e0245e',
                            border: u.verified ? '1px solid rgba(23,191,99,0.3)' : '1px solid rgba(224,36,94,0.3)'
                          }}>
                            <i className={u.verified ? 'fas fa-circle-check' : 'fas fa-xmark'}></i>
                            <span>{u.verified ? 'Verified' : 'Disabled'}</span>
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#71767b' }}>{formatDate(u.createdAt)}</td>
                        <td style={{ padding: '16px', color: '#71767b' }}>{formatDate(u.lastLogin)}</td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button
                            onClick={() => toggleVerification(u)}
                            disabled={updatingId === u.id}
                            style={{
                              background: u.verified ? 'rgba(224,36,94,0.12)' : 'rgba(23,191,99,0.15)',
                              color: u.verified ? '#e0245e' : '#17bf63',
                              border: u.verified ? '1px solid rgba(224,36,94,0.3)' : '1px solid rgba(23,191,99,0.3)',
                              borderRadius: '8px',
                              padding: '6px 14px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            {updatingId === u.id ? 'Updating...' : u.verified ? 'Disable Access' : 'Authorize User'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
