import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle, AlertCircle, Wrench, X, Hash, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../apis/login.api';
import spcLogo from '../assets/spc-logo.png';

// ── Maintenance Mode ──────────────────────────────────────────────────────────
const DEFAULT_MAINTENANCE_MESSAGE = 'The system is currently undergoing scheduled maintenance. Some features may be temporarily unavailable. We apologise for the inconvenience.';
// ─────────────────────────────────────────────────────────────────────────────

const LoginUI = ({ forgotClicked = () => { } }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loginMode, setLoginMode] = useState('staff'); // 'staff' | 'superadmin'
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');
    const [shake, setShake] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState(DEFAULT_MAINTENANCE_MESSAGE);
    const navigate = useNavigate();

    // ── Real backend health check ──
    useEffect(() => {
        const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const check = async () => {
            try {
                const res = await fetch(`${BACKEND}/api/v1/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
                if (res.ok) {
                    setBackendStatus('online');
                    const data = await res.json();
                    setShowMaintenance(!!data.maintenance);
                    if (data.message) {
                        setMaintenanceMessage(data.message);
                    }
                } else {
                    setBackendStatus('offline');
                }
            } catch {
                setBackendStatus('offline');
            }
        };
        check();
        const id = setInterval(check, 5000);
        return () => clearInterval(id);
    }, []);

    const calcStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'password') setPasswordStrength(calcStrength(value));
        if (message) { setMessage(null); setMessageType(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await loginApi(formData);
            if (response.success) {
                setMessage(response.message || 'Access Granted!');
                setMessageType('success');
                setLoginSuccess(true);
                setTimeout(() => navigate('/dashboard'), 1400);
            }
        } catch (error) {
            const errData = error.response?.data;
            setMessage(errData?.message || 'Invalid credentials. Please try again.');
            setMessageType('error');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            if (errData?.requirePasswordReset) {
                setTimeout(() => {
                    if (typeof forgotClicked === 'function') {
                        forgotClicked();
                    }
                }, 1800);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    // Derived colours for the arch diagram
    const beOnline = backendStatus === 'online';
    const beChecking = backendStatus === 'checking';
    const beColor = beOnline ? '#4ade80' : beChecking ? '#facc15' : '#f87171';
    const beGlow = beOnline ? '0 0 8px #4ade80' : beChecking ? '0 0 8px #facc15' : '0 0 8px #f87171';
    const lineColor = beOnline
        ? 'linear-gradient(90deg,rgba(99,102,241,.5),rgba(139,92,246,.5))'
        : 'linear-gradient(90deg,rgba(239,68,68,.3),rgba(239,68,68,.15))';
    const dbColor = beOnline ? '#4ade80' : '#475569';
    const dbGlow = beOnline ? '0 0 8px #4ade80' : 'none';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #080812;
                    overflow: hidden;
                    padding: 40px 20px;
                    gap: 48px;
                }

                /* ══════════ LEFT PANEL ══════════ */
                .login-left {
                    flex: 1;
                    max-width: 500px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0;
                    position: relative;
                    overflow: hidden;
                }

                /* ─── Perspective grid ─── */
                .grid-floor {
                    position: fixed;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(99,102,241,.13) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,.13) 1px, transparent 1px);
                    background-size: 48px 48px;
                    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
                    animation: gridDrift 12s linear infinite;
                    pointer-events: none;
                }
                @keyframes gridDrift {
                    0%   { background-position: 0 0; }
                    100% { background-position: 48px 48px; }
                }

                /* ─── Center glowing orb ─── */
                .center-orb {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(139,92,246,.9) 0%, rgba(99,102,241,.4) 50%, transparent 70%);
                    filter: blur(18px);
                    animation: orbBreath 4s ease-in-out infinite;
                }
                @keyframes orbBreath {
                    0%,100% { transform: translate(-50%,-50%) scale(1);   opacity: .7; }
                    50%     { transform: translate(-50%,-50%) scale(1.5);  opacity: 1; }
                }

                /* ─── Floating hexagons ─── */
                .hex-wrap {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .hex {
                    position: absolute;
                    opacity: 0;
                    animation: hexFloat linear infinite;
                }
                .hex svg { display: block; }
                @keyframes hexFloat {
                    0%   { opacity: 0; transform: translateY(0)    rotate(0deg); }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { opacity: 0; transform: translateY(-120px) rotate(60deg); }
                }

                /* big background glow blobs */
                .bg-blob {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(100px);
                    pointer-events: none;
                }
                .bg-blob-1 { width: 380px; height: 380px; background: rgba(99,102,241,.18); top: -100px; left: -80px; animation: blobDrift 9s ease-in-out infinite; }
                .bg-blob-2 { width: 280px; height: 280px; background: rgba(139,92,246,.14); bottom: -60px; right: -40px; animation: blobDrift 11s ease-in-out infinite 3s; }
                @keyframes blobDrift {
                    0%,100% { transform: translate(0,0); }
                    50%     { transform: translate(20px,-20px); }
                }

                /* feature cards */
                .feature-card {
                    display: flex; align-items: center; gap: 14px;
                    padding: 13px 18px;
                    border-radius: 16px;
                    background: rgba(255,255,255,.03);
                    border: 1px solid rgba(255,255,255,.06);
                    transition: all .3s ease;
                    cursor: default;
                    backdrop-filter: blur(8px);
                }
                .feature-card:hover {
                    background: rgba(99,102,241,.1);
                    border-color: rgba(99,102,241,.28);
                    transform: translateX(8px);
                }
                .feature-icon {
                    width: 38px; height: 38px; border-radius: 10px;
                    background: linear-gradient(135deg,#6366f1,#8b5cf6);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }

                /* ══════════ RIGHT PANEL ══════════ */
                .login-right {
                    width: 460px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    padding: 48px 40px;
                    background: rgba(13,13,30,0.85);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 28px;
                    position: relative;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(99,102,241,.08);
                }

                .login-card {
                    width: 100%;
                    animation: slideUp .55s cubic-bezier(.16,1,.3,1) both;
                    position: relative;
                }
                @keyframes slideUp {
                    from { opacity:0; transform: translateY(28px); }
                    to   { opacity:1; transform: translateY(0); }
                }

                /* shake */
                .shake { animation: shake .5s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%,90%     { transform: translateX(-2px); }
                    20%,80%     { transform: translateX(5px); }
                    30%,50%,70% { transform: translateX(-7px); }
                    40%,60%     { transform: translateX(7px); }
                }

                /* floating label */
                .field-wrap { position: relative; margin-bottom: 20px; }
                .field-label {
                    position: absolute; left: 48px; top: 50%;
                    transform: translateY(-50%);
                    font-size: 14px; color: rgba(148,163,184,.5);
                    pointer-events: none; transition: all .22s ease; font-weight: 500;
                }
                .field-label.active {
                    top: 12px; font-size: 10px; font-weight: 700;
                    letter-spacing: .09em; text-transform: uppercase; color: #818cf8;
                }
                .field-input {
                    width: 100%;
                    background: rgba(255,255,255,.04);
                    border: 1.5px solid rgba(255,255,255,.08);
                    border-radius: 14px;
                    padding: 26px 48px 10px 48px;
                    color: #f1f5f9; font-size: 15px;
                    font-family: 'Inter', sans-serif; outline: none;
                    transition: border-color .22s, background .22s, box-shadow .22s;
                    box-sizing: border-box;
                }
                .field-input::placeholder { color: transparent; }
                .field-input:focus {
                    border-color: rgba(99,102,241,.55);
                    background: rgba(99,102,241,.07);
                    box-shadow: 0 0 0 4px rgba(99,102,241,.13), inset 0 1px 0 rgba(255,255,255,.04);
                }
                .field-icon {
                    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
                    color: rgba(100,116,139,.65); transition: color .22s; pointer-events: none;
                }
                .field-icon.focused { color: #818cf8; }
                .field-eye {
                    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: rgba(100,116,139,.65); transition: color .2s;
                    padding: 4px; display: flex; align-items: center;
                }
                .field-eye:hover { color: #818cf8; }

                /* strength bar */
                .str-track { height: 3px; border-radius: 8px; background: rgba(255,255,255,.07); margin-top: 8px; overflow: hidden; }
                .str-fill   { height: 100%; border-radius: 8px; transition: width .35s ease, background .35s ease; }

                /* button */
                .submit-btn {
                    width: 100%; padding: 16px; border-radius: 14px; border: none;
                    background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                    color: #fff; font-size: 15px; font-weight: 700;
                    font-family: 'Inter', sans-serif; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all .25s ease;
                    box-shadow: 0 8px 32px rgba(99,102,241,.35);
                    position: relative; overflow: hidden; margin-top: 8px;
                }
                .submit-btn::after {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(135deg,rgba(255,255,255,.18),transparent);
                    opacity: 0; transition: opacity .2s;
                }
                .submit-btn:hover:not(:disabled)::after { opacity: 1; }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 42px rgba(99,102,241,.5); }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled { opacity: .55; cursor: not-allowed; }

                /* alert */
                .alert {
                    padding: 12px 16px; border-radius: 12px;
                    display: flex; align-items: center; gap: 10px;
                    font-size: 13px; font-weight: 600; margin-bottom: 20px;
                    animation: slideUp .3s ease;
                }
                .alert-error   { background: rgba(239,68,68,.1);  border:1px solid rgba(239,68,68,.25);  color:#fca5a5; }
                .alert-success { background: rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.25); color:#86efac; }

                /* success overlay */
                .success-overlay {
                    position: absolute; inset: 0; border-radius: 20px;
                    background: rgba(8,8,18,.95);
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
                    z-index: 20; animation: fadeIn .4s ease;
                }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }

                .success-ring {
                    width: 72px; height: 72px; border-radius: 50%;
                    border: 2px solid rgba(34,197,94,.5);
                    background: rgba(34,197,94,.12);
                    display: flex; align-items: center; justify-content: center;
                    animation: ringPop .5s cubic-bezier(.16,1,.3,1);
                }
                @keyframes ringPop {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }

                /* spinner */
                .spinner {
                    width: 20px; height: 20px;
                    border: 2px solid rgba(255,255,255,.25);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin .65s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* forgot */
                .forgot-link {
                    background: none; border: none; cursor: pointer;
                    font-size: 13px; font-weight: 600; color: #818cf8;
                    font-family: 'Inter', sans-serif; transition: color .2s; padding: 0;
                }
                .forgot-link:hover { color: #a5b4fc; }

                /* login mode tabs */
                .login-tabs {
                    display: flex;
                    background: rgba(255,255,255,.04);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 12px;
                    padding: 4px;
                    margin-bottom: 24px;
                    gap: 4px;
                }
                .login-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 9px 12px;
                    border-radius: 9px;
                    border: none;
                    background: none;
                    color: rgba(148,163,184,.5);
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    cursor: pointer;
                    transition: all .22s ease;
                }
                .login-tab.active {
                    background: linear-gradient(135deg,#6366f1,#8b5cf6);
                    color: #fff;
                    box-shadow: 0 4px 16px rgba(99,102,241,.35);
                }
                .login-tab:not(.active):hover {
                    color: rgba(148,163,184,.85);
                    background: rgba(255,255,255,.05);
                }
                .login-mode-hint {
                    font-size: 11px;
                    color: rgba(148,163,184,.38);
                    text-align: center;
                    margin-bottom: 18px;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                }

                /* ── Backend Connection Diagram ── */
                .arch-diagram {
                    position: relative;
                    background: rgba(255,255,255,.025);
                    border: 1px solid rgba(99,102,241,.18);
                    border-radius: 20px;
                    padding: 20px 18px 16px;
                    margin-top: 26px;
                    overflow: hidden;
                }
                .arch-diagram::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(99,102,241,.05) 0%, transparent 60%);
                    border-radius: inherit;
                    pointer-events: none;
                }
                .arch-section-label {
                    font-size: 9px; font-weight: 800; letter-spacing: .18em;
                    text-transform: uppercase; color: rgba(129,140,248,.5);
                    text-align: center; margin-bottom: 16px;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                }
                .arch-section-label::before,
                .arch-section-label::after {
                    content: '';
                    flex: 1; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(99,102,241,.25), transparent);
                }
                .arch-nodes {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 4px;
                }
                .arch-node {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    flex: 1;
                }
                .arch-node-box {
                    width: 54px; height: 54px; border-radius: 15px;
                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                    transition: transform .3s ease;
                }
                .arch-node-box:hover { transform: translateY(-3px); }
                .arch-node-label {
                    font-size: 9px; font-weight: 800; letter-spacing: .06em;
                    text-transform: uppercase; color: rgba(148,163,184,.6);
                    text-align: center; line-height: 1.4;
                }
                .arch-conn {
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
                    position: relative; min-width: 40px;
                }
                .arch-line {
                    width: 100%; height: 1.5px;
                    background: linear-gradient(90deg, rgba(99,102,241,.4), rgba(139,92,246,.4));
                    position: relative;
                    overflow: visible;
                }
                .arch-pulse {
                    position: absolute;
                    top: 50%; left: 0;
                    transform: translateY(-50%);
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #818cf8;
                    box-shadow: 0 0 10px #818cf8, 0 0 20px rgba(129,140,248,.5);
                    animation: pulseTravelFwd 2.4s ease-in-out infinite;
                }
                .arch-pulse.rev {
                    background: #c084fc;
                    box-shadow: 0 0 10px #c084fc, 0 0 20px rgba(192,132,252,.5);
                    animation: pulseTravelRev 2.4s ease-in-out infinite 1s;
                }
                .arch-pulse.p2 { animation-delay: .5s; }
                .arch-pulse.p2.rev { animation-delay: 1.5s; }
                @keyframes pulseTravelFwd {
                    0%   { left: 0%;   opacity: 0; }
                    8%   { opacity: 1; }
                    92%  { opacity: 1; }
                    100% { left: 100%; opacity: 0; }
                }
                @keyframes pulseTravelRev {
                    0%   { left: 100%; opacity: 0; }
                    8%   { opacity: 1; }
                    92%  { opacity: 1; }
                    100% { left: 0%;   opacity: 0; }
                }
                .arch-conn-label {
                    font-size: 8px; font-weight: 700; color: rgba(129,140,248,.45);
                    letter-spacing: .05em; text-transform: uppercase; white-space: nowrap;
                }
                .status-dot {
                    position: absolute; bottom: -3px; right: -3px;
                    width: 11px; height: 11px; border-radius: 50%;
                    background: #22c55e;
                    box-shadow: 0 0 8px #22c55e;
                    border: 2px solid #080812;
                    animation: statusPulse 2s ease-in-out infinite;
                }
                @keyframes statusPulse {
                    0%,100% { opacity: 1; transform: scale(1); }
                    50%     { opacity: .6; transform: scale(1.25); }
                }

                @media (max-width: 900px) {
                    .login-left  { display: none; }
                    .login-right { width: 100%; max-width: 440px; }
                    .login-root  { padding: 20px; gap: 0; }
                }
            `}</style>

            <div className="login-root" style={{ flexDirection: 'column', paddingTop: 0 }}>

                {/* ── Maintenance Mode Banner ── */}
                {showMaintenance && (
                    <div style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #92400e, #b45309, #92400e)',
                        backgroundSize: '200% 100%',
                        animation: 'bannerShift 4s linear infinite',
                        borderBottom: '1px solid rgba(251,191,36,.35)',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        zIndex: 9999,
                        position: 'relative',
                        flexShrink: 0,
                    }}>
                        <style>{`
                            @keyframes bannerShift {
                                0%   { background-position: 0% 50%; }
                                50%  { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                            @keyframes wrenchSpin {
                                0%,100% { transform: rotate(-15deg); }
                                50%     { transform: rotate(15deg); }
                            }
                        `}</style>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={{
                                background: 'rgba(251,191,36,.18)',
                                border: '1px solid rgba(251,191,36,.4)',
                                borderRadius: 10,
                                padding: '6px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Wrench
                                    size={16}
                                    color="#fbbf24"
                                    style={{ animation: 'wrenchSpin 2s ease-in-out infinite' }}
                                />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    color: '#fbbf24',
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    marginBottom: 2,
                                }}>
                                    🔧 Scheduled Maintenance
                                </div>
                                <div style={{
                                    fontSize: 12,
                                    color: 'rgba(253,230,138,.85)',
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    maxWidth: 680,
                                }}>
                                    {maintenanceMessage}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowMaintenance(false)}
                            style={{
                                background: 'rgba(251,191,36,.12)',
                                border: '1px solid rgba(251,191,36,.3)',
                                borderRadius: 8,
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background .2s',
                            }}
                            title="Dismiss"
                        >
                            <X size={14} color="#fbbf24" />
                        </button>
                    </div>
                )}

                {/* ── Panels Wrapper ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 48, padding: '40px 20px', width: '100%' }}>

                    {/* Global bg elements */}
                    <div className="bg-blob bg-blob-1" />
                    <div className="bg-blob bg-blob-2" />
                    <div className="grid-floor" />
                    <div className="hex-wrap">
                        {[
                            { size: 28, left: '8%', top: '70%', dur: '9s', delay: '0s' },
                            { size: 18, left: '18%', top: '55%', dur: '12s', delay: '2s' },
                            { size: 22, left: '72%', top: '75%', dur: '10s', delay: '1.5s' },
                            { size: 14, left: '82%', top: '60%', dur: '14s', delay: '3.5s' },
                            { size: 20, left: '55%', top: '80%', dur: '11s', delay: '0.8s' },
                            { size: 12, left: '40%', top: '65%', dur: '8s', delay: '4s' },
                            { size: 25, left: '25%', top: '82%', dur: '13s', delay: '2.8s' },
                            { size: 16, left: '90%', top: '50%', dur: '10s', delay: '1s' },
                        ].map((h, i) => (
                            <div key={i} className="hex" style={{
                                left: h.left, top: h.top,
                                animationDuration: h.dur,
                                animationDelay: h.delay,
                            }}>
                                <svg width={h.size} height={h.size} viewBox="0 0 24 24">
                                    <polygon
                                        points="12,2 22,7 22,17 12,22 2,17 2,7"
                                        fill="none"
                                        stroke="rgba(129,140,248,0.45)"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* ═══════ LEFT PANEL ═══════ */}
                    <div className="login-left">
                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 10, marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                                <img src={spcLogo} alt="SPC Logo" style={{ width: 54, height: 54, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(129,140,248,.5))' }} />
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                        SPC <span style={{ color: '#818cf8' }}>WMS</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'rgba(148,163,184,.5)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                        Welfare Management System
                                    </div>
                                </div>
                            </div>

                            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.18, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
                                Smarter Welfare,<br />
                                <span style={{ background: 'linear-gradient(90deg,#818cf8 0%,#c084fc 60%,#60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    better outcomes
                                </span>
                            </h1>
                            <p style={{ fontSize: 14, color: 'rgba(148,163,184,.6)', lineHeight: 1.75, maxWidth: 340, margin: 0 }}>
                                Manage welfare benefits, departments, and access — all from a single secure platform built for modern HR teams.
                            </p>
                        </div>



                        {/* ── Backend Connection Diagram ── */}
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <div className="arch-diagram">
                                <div className="arch-section-label">System Architecture · Live Connection</div>
                                <div className="arch-nodes">

                                    {/* Browser / Frontend Node — always online */}
                                    <div className="arch-node">
                                        <div className="arch-node-box" style={{
                                            background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.14))',
                                            border: '1px solid rgba(99,102,241,.35)',
                                            boxShadow: '0 4px 24px rgba(99,102,241,.15)'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2" />
                                                <path d="M8 21h8M12 17v4" />
                                            </svg>
                                            {/* Frontend is always up */}
                                            <div className="status-dot" style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                                        </div>
                                        <div className="arch-node-label">React<br />Frontend</div>
                                    </div>

                                    {/* Connection: Frontend ↔ API — colour reflects backend status */}
                                    <div className="arch-conn">
                                        <div className="arch-line" style={{ background: lineColor }}>
                                            {beOnline && <><div className="arch-pulse" /><div className="arch-pulse rev" /></>}
                                        </div>
                                        <div className="arch-conn-label">REST/HTTPS</div>
                                    </div>

                                    {/* Express API Node — status-aware */}
                                    <div className="arch-node">
                                        <div className="arch-node-box" style={{
                                            background: beOnline
                                                ? 'linear-gradient(135deg,rgba(139,92,246,.2),rgba(192,132,252,.14))'
                                                : 'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.05))',
                                            border: beOnline ? '1px solid rgba(139,92,246,.35)' : '1px solid rgba(239,68,68,.3)',
                                            boxShadow: beOnline ? '0 4px 24px rgba(139,92,246,.15)' : '0 4px 24px rgba(239,68,68,.08)',
                                            transition: 'all .5s ease'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={beOnline ? '#c084fc' : '#f87171'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke .5s' }}>
                                                <rect x="2" y="2" width="20" height="8" rx="2" />
                                                <rect x="2" y="14" width="20" height="8" rx="2" />
                                                <line x1="6" y1="6" x2="6.01" y2="6" />
                                                <line x1="6" y1="18" x2="6.01" y2="18" />
                                            </svg>
                                            <div className="status-dot" style={{ background: beColor, boxShadow: beGlow, transition: 'background .5s, box-shadow .5s' }} />
                                        </div>
                                        <div className="arch-node-label" style={{ color: beOnline ? 'rgba(148,163,184,.6)' : 'rgba(239,68,68,.55)', transition: 'color .5s' }}>Express<br />Backend</div>
                                    </div>

                                    {/* Connection: API ↔ DB */}
                                    <div className="arch-conn">
                                        <div className="arch-line" style={{ background: beOnline ? 'linear-gradient(90deg,rgba(34,197,94,.5),rgba(16,185,129,.5))' : lineColor }}>
                                            {beOnline && <><div className="arch-pulse p2" /><div className="arch-pulse p2 rev" /></>}
                                        </div>
                                        <div className="arch-conn-label">MongoDB</div>
                                    </div>

                                    {/* Database Node — dims when backend is offline */}
                                    <div className="arch-node">
                                        <div className="arch-node-box" style={{
                                            background: beOnline
                                                ? 'linear-gradient(135deg,rgba(34,197,94,.15),rgba(16,185,129,.10))'
                                                : 'linear-gradient(135deg,rgba(71,85,105,.12),rgba(71,85,105,.07))',
                                            border: beOnline ? '1px solid rgba(34,197,94,.3)' : '1px solid rgba(71,85,105,.3)',
                                            boxShadow: beOnline ? '0 4px 24px rgba(34,197,94,.12)' : 'none',
                                            transition: 'all .5s ease'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dbColor} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke .5s' }}>
                                                <ellipse cx="12" cy="5" rx="9" ry="3" />
                                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                            </svg>
                                            <div className="status-dot" style={{ background: dbColor, boxShadow: dbGlow, transition: 'background .5s, box-shadow .5s' }} />
                                        </div>
                                        <div className="arch-node-label" style={{ color: beOnline ? 'rgba(148,163,184,.6)' : 'rgba(71,85,105,.5)', transition: 'color .5s' }}>Database<br />Layer</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status badge — live */}
                        <div style={{ position: 'relative', zIndex: 10, marginTop: 18 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '8px 16px', borderRadius: 999,
                                background: beOnline ? 'rgba(34,197,94,.08)' : beChecking ? 'rgba(250,204,21,.06)' : 'rgba(239,68,68,.08)',
                                border: beOnline ? '1px solid rgba(34,197,94,.18)' : beChecking ? '1px solid rgba(250,204,21,.2)' : '1px solid rgba(239,68,68,.2)',
                                transition: 'background .5s, border-color .5s'
                            }}>
                                <span style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: beColor, boxShadow: beGlow,
                                    display: 'inline-block',
                                    animation: 'orbBreath 2s ease-in-out infinite',
                                    transition: 'background .5s, box-shadow .5s'
                                }} />
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: beOnline ? 'rgba(134,239,172,.7)' : beChecking ? 'rgba(253,224,71,.6)' : 'rgba(252,165,165,.7)',
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    transition: 'color .5s'
                                }}>
                                    {beOnline ? 'Backend Online · Secure Connection' : beChecking ? 'Checking Connection…' : 'Backend Offline · Check Server'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ RIGHT PANEL ═══════ */}
                    <div className="login-right">
                        <div className="login-card">
                            {/* Success overlay */}
                            {loginSuccess && (
                                <div className="success-overlay">
                                    <div className="success-ring">
                                        <CheckCircle size={32} color="#22c55e" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Access Granted!</div>
                                        <div style={{ fontSize: 13, color: 'rgba(148,163,184,.55)' }}>Redirecting to dashboard…</div>
                                    </div>
                                </div>
                            )}

                            {/* Heading */}
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <img src={spcLogo} alt="SPC Logo" style={{ width: 32, height: 32, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(129,140,248,.5))' }} />
                                    <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(148,163,184,.55)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SPC Welfare Management System</div>
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
                                    Welcome WMS 👋
                                </div>
                                <div style={{ fontSize: 14, color: 'rgba(148,163,184,.5)', fontWeight: 500, marginBottom: 26 }}>
                                    Sign in to your account to continue
                                </div>
                            </div>

                            {/* Login Mode Tabs */}
                            <div className="login-tabs">
                                <button
                                    type="button"
                                    id="tab-staff"
                                    className={`login-tab ${loginMode === 'staff' ? 'active' : ''}`}
                                    onClick={() => { setLoginMode('staff'); setFormData({ email: '', password: '' }); setMessage(null); }}
                                >
                                    <Hash size={13} />
                                    Staff Login
                                </button>
                                <button
                                    type="button"
                                    id="tab-superadmin"
                                    className={`login-tab ${loginMode === 'superadmin' ? 'active' : ''}`}
                                    onClick={() => { setLoginMode('superadmin'); setFormData({ email: '', password: '' }); setMessage(null); }}
                                >
                                    <ShieldCheck size={13} />
                                    Super Admin
                                </button>
                            </div>

                            <div className="login-mode-hint">
                                {loginMode === 'staff'
                                    ? 'Enter your EPF number and password'
                                    : 'Enter your email address or EPF number'}
                            </div>

                            {/* Alert */}
                            {message && !loginSuccess && (
                                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                                    {messageType === 'success'
                                        ? <CheckCircle size={16} />
                                        : <AlertCircle size={16} />}
                                    <span>{message}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className={shake ? 'shake' : ''}>
                                {/* EPF / Email field */}
                                <div className="field-wrap">
                                    {loginMode === 'staff'
                                        ? <Hash size={18} className={`field-icon ${focusedField === 'email' ? 'focused' : ''}`} />
                                        : <Mail size={18} className={`field-icon ${focusedField === 'email' ? 'focused' : ''}`} />
                                    }
                                    <label className={`field-label ${focusedField === 'email' || formData.email ? 'active' : ''}`}>
                                        {loginMode === 'staff' ? 'EPF Number' : 'Email or EPF Number'}
                                    </label>
                                    <input
                                        type={loginMode === 'staff' ? 'text' : 'text'}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="field-input"
                                        placeholder={loginMode === 'staff' ? 'EPF Number' : 'Email or EPF Number'}
                                        inputMode={loginMode === 'staff' ? 'numeric' : 'text'}
                                        pattern={loginMode === 'staff' ? '[0-9]*' : undefined}
                                    />
                                </div>

                                {/* Password */}
                                <div className="field-wrap" style={{ marginBottom: formData.password ? 4 : 20 }}>
                                    <Lock size={18} className={`field-icon ${focusedField === 'password' ? 'focused' : ''}`} />
                                    <label className={`field-label ${focusedField === 'password' || formData.password ? 'active' : ''}`}>
                                        Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="field-input"
                                        style={{ paddingRight: 52 }}
                                        placeholder="Password"
                                    />
                                    <button type="button" className="field-eye" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {formData.password && (
                                    <div style={{ marginBottom: 16, paddingLeft: 4 }}>
                                        <div className="str-track">
                                            <div className="str-fill" style={{ width: `${(passwordStrength / 4) * 100}%`, background: strengthColors[passwordStrength] }} />
                                        </div>
                                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 4, color: strengthColors[passwordStrength] }}>
                                            {strengthLabels[passwordStrength]} password
                                        </div>
                                    </div>
                                )}

                                {/* Forgot */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                                    <button type="button" className="forgot-link" onClick={forgotClicked}>
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={isLoading || loginSuccess} className="submit-btn">
                                    {isLoading ? <div className="spinner" /> : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'rgba(148,163,184,.45)', fontWeight: 500, lineHeight: 1.6 }}>
                                <div>© 2026 SPC Welfare Management · Enterprise Edition</div>
                                <div style={{ fontSize: 10, color: 'rgba(148,163,184,.35)', marginTop: 2 }}>Developed by Pasindu Hapuarachchige · All rights reserved</div>
                            </div>
                        </div>
                    </div>
                </div>{/* end panels wrapper */}
            </div>
        </>
    );
};

export default LoginUI;