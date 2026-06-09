import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle, AlertCircle, Shield, Users, BarChart3, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../apis/login.api';
import spcLogo from '../assets/spc-logo.png';

const LoginUI = ({ forgotClicked = () => { } }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');
    const [shake, setShake] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const navigate = useNavigate();

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
            setMessage(error.response?.data?.message || 'Invalid credentials. Please try again.');
            setMessageType('error');
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setIsLoading(false);
        }
    };

    const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    const features = [
        { icon: Users, label: 'Employee Management', desc: 'Centralized HR records' },
        { icon: BarChart3, label: 'EPF & Analytics', desc: 'Real-time insights' },
        { icon: Shield, label: 'Role-Based Access', desc: 'Secure & controlled' },
        { icon: Zap, label: 'Instant Operations', desc: 'Fast & reliable' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    background: #080812;
                    overflow: hidden;
                }

                /* ══════════ LEFT PANEL ══════════ */
                .login-left {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 60px 56px;
                    position: relative;
                    overflow: hidden;
                    background: #080812;
                }

                /* ─── Perspective grid ─── */
                .grid-floor {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(99,102,241,.13) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,.13) 1px, transparent 1px);
                    background-size: 48px 48px;
                    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
                    animation: gridDrift 12s linear infinite;
                }
                @keyframes gridDrift {
                    0%   { background-position: 0 0; }
                    100% { background-position: 48px 48px; }
                }

                /* ─── Pulsing concentric rings ─── */
                .rings-wrap {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }
                .ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(99,102,241,.25);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    animation: ringPulse 5s ease-out infinite;
                }
                .ring:nth-child(1) { width: 160px; height: 160px; animation-delay: 0s; }
                .ring:nth-child(2) { width: 280px; height: 280px; animation-delay: 1s; }
                .ring:nth-child(3) { width: 420px; height: 420px; animation-delay: 2s; border-color: rgba(139,92,246,.15); }
                .ring:nth-child(4) { width: 560px; height: 560px; animation-delay: 3s; border-color: rgba(99,102,241,.08); }
                .ring:nth-child(5) { width: 700px; height: 700px; animation-delay: 4s; border-color: rgba(99,102,241,.04); }
                @keyframes ringPulse {
                    0%   { transform: translate(-50%,-50%) scale(0); opacity: .9; }
                    80%  { opacity: .1; }
                    100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
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

                /* ─── Orbiting dots ─── */
                .orbit {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform-origin: 0 0;
                    pointer-events: none;
                }
                .orbit-ring {
                    position: absolute;
                    top: 50%; left: 50%;
                    border-radius: 50%;
                    border: 1px dashed rgba(99,102,241,.2);
                    transform: translate(-50%, -50%);
                }
                .orbit-dot {
                    position: absolute;
                    border-radius: 50%;
                    background: #818cf8;
                    box-shadow: 0 0 8px #818cf8, 0 0 20px rgba(129,140,248,.4);
                    top: 50%; left: 50%;
                }
                /* Orbit 1 */
                .orb1-ring  { width: 180px; height: 180px; }
                .orb1-dot   { width: 7px; height: 7px; margin: -3.5px; animation: orbit1 6s linear infinite; }
                /* Orbit 2 */
                .orb2-ring  { width: 280px; height: 280px; border-color: rgba(139,92,246,.18); }
                .orb2-dot   { width: 5px; height: 5px; margin: -2.5px; background: #c084fc; box-shadow: 0 0 6px #c084fc; animation: orbit2 10s linear infinite reverse; }
                /* Orbit 3 */
                .orb3-ring  { width: 370px; height: 370px; border-color: rgba(99,102,241,.12); }
                .orb3-dot   { width: 4px; height: 4px; margin: -2px; background: #60a5fa; box-shadow: 0 0 6px #60a5fa; animation: orbit3 15s linear infinite; }

                @keyframes orbit1 {
                    from { transform: translate(calc(-50% + 90px), -50%) rotate(0deg)   translateX(-90px); }
                    to   { transform: translate(calc(-50% + 90px), -50%) rotate(360deg) translateX(-90px); }
                }
                @keyframes orbit2 {
                    from { transform: translate(calc(-50% + 140px), -50%) rotate(0deg)   translateX(-140px); }
                    to   { transform: translate(calc(-50% + 140px), -50%) rotate(360deg) translateX(-140px); }
                }
                @keyframes orbit3 {
                    from { transform: translate(calc(-50% + 185px), -50%) rotate(120deg)   translateX(-185px); }
                    to   { transform: translate(calc(-50% + 185px), -50%) rotate(480deg) translateX(-185px); }
                }

                /* ─── Floating hexagons ─── */
                .hex-wrap {
                    position: absolute;
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
                    position: absolute;
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
                    width: 480px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    padding: 48px 40px;
                    background: #0d0d1e;
                    border-left: 1px solid rgba(255,255,255,.05);
                    position: relative;
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

                @media (max-width: 900px) {
                    .login-left  { display: none; }
                    .login-right { width: 100%; }
                }
            `}</style>

            <div className="login-root">
                {/* ═══════ LEFT PANEL ═══════ */}
                <div className="login-left">
                    {/* background elements */}
                    <div className="bg-blob bg-blob-1" />
                    <div className="bg-blob bg-blob-2" />
                    <div className="grid-floor" />

                    {/* concentric pulsing rings + orbiting dots */}
                    <div className="rings-wrap">
                        <div className="ring" />
                        <div className="ring" />
                        <div className="ring" />
                        <div className="ring" />
                        <div className="ring" />

                        {/* orbiting dot 1 */}
                        <div className="orbit-ring orb1-ring" />
                        <div className="orbit-dot orb1-dot" />

                        {/* orbiting dot 2 */}
                        <div className="orbit-ring orb2-ring" />
                        <div className="orbit-dot orb2-dot" />

                        {/* orbiting dot 3 */}
                        <div className="orbit-ring orb3-ring" />
                        <div className="orbit-dot orb3-dot" />

                        {/* center glow */}
                        <div className="center-orb" />
                    </div>

                    {/* floating hexagons */}
                    <div className="hex-wrap">
                        {[
                            { size: 28, left: '8%',  top: '70%', dur: '9s',  delay: '0s'   },
                            { size: 18, left: '18%', top: '55%', dur: '12s', delay: '2s'   },
                            { size: 22, left: '72%', top: '75%', dur: '10s', delay: '1.5s' },
                            { size: 14, left: '82%', top: '60%', dur: '14s', delay: '3.5s' },
                            { size: 20, left: '55%', top: '80%', dur: '11s', delay: '0.8s' },
                            { size: 12, left: '40%', top: '65%', dur: '8s',  delay: '4s'   },
                            { size: 25, left: '25%', top: '82%', dur: '13s', delay: '2.8s' },
                            { size: 16, left: '90%', top: '50%', dur: '10s', delay: '1s'   },
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

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 10, marginBottom: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                            <img src={spcLogo} alt="SPC Logo" style={{ width: 54, height: 54, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(129,140,248,.5))' }} />
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    SPC <span style={{ color: '#818cf8' }}>HR</span>
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(148,163,184,.5)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                    Management System
                                </div>
                            </div>
                        </div>

                        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.18, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
                            Smarter HR,<br />
                            <span style={{ background: 'linear-gradient(90deg,#818cf8 0%,#c084fc 60%,#60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                better outcomes
                            </span>
                        </h1>
                        <p style={{ fontSize: 14, color: 'rgba(148,163,184,.6)', lineHeight: 1.75, maxWidth: 340, margin: 0 }}>
                            Manage employees, EPF, departments, and access — all from a single secure platform built for modern HR teams.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {features.map(({ icon: Icon, label, desc }, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon">
                                    <Icon size={17} color="#fff" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{label}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(148,163,184,.5)', marginTop: 1 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Status badge */}
                    <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', paddingTop: 36 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.18)' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'inline-block', animation: 'orbBreath 2s ease-in-out infinite' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(134,239,172,.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                System Online · Secure Connection
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
                        <div style={{ marginBottom: 30 }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
                                Welcome back 👋
                            </div>
                            <div style={{ fontSize: 14, color: 'rgba(148,163,184,.5)', fontWeight: 500 }}>
                                Sign in to your account to continue
                            </div>
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
                            {/* Email */}
                            <div className="field-wrap">
                                <Mail size={18} className={`field-icon ${focusedField === 'email' ? 'focused' : ''}`} />
                                <label className={`field-label ${focusedField === 'email' || formData.email ? 'active' : ''}`}>
                                    Email or EPF Number
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    required
                                    autoComplete="username"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="field-input"
                                    placeholder="Email or EPF Number"
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

                        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'rgba(100,116,139,.4)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            © 2026 SPC HR Management · Enterprise Edition
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginUI;