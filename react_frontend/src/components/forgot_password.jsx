import React, { useState, useEffect } from 'react';
import { Mail, Shield, ArrowLeft, CheckCircle, Clock, RefreshCw, X, Key, Terminal, Lock, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { sendEmailApi, updateRecoveryPasswordApi, validateOtpApi } from '../apis/recovery.api';

const ForgotPassword = ({ show, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: Password, 4: Success
    const [formData, setFormData] = useState({
        email: '',
        otp: ['', '', '', '', '', ''],
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (show) {
            setCurrentStep(1);
            setFormData({ email: '', otp: ['', '', '', '', '', ''], password: '', confirmPassword: '' });
            setError('');
            setCountdown(0);
            setIsLoading(false);
            setPasswordValidation({
                minLength: false,
                hasUppercase: false,
                hasLowercase: false,
                hasNumber: false,
                hasSpecialChar: false,
                passwordsMatch: false
            });
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [show]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && show) {
                onClose();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [show, onClose]);

    const handleEmailChange = (e) => {
        setFormData(prev => ({ ...prev, email: e.target.value }));
        setError('');
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...formData.otp];
        newOtp[index] = value;
        setFormData(prev => ({ ...prev, otp: newOtp }));
        setError('');

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await sendEmailApi({ email: formData.email });
            if (response && response.success === true) {
                setCurrentStep(2);
                setCountdown(300);
            } else {
                setError(response.message || 'Identity verification failed.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = formData.otp.join('');
        if (otpValue.length !== 6) {
            setError('Incomplete 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await validateOtpApi({
                email: formData.email,
                otp: otpValue
            });
            if (response && response.success === true) {
                setCurrentStep(3);
            } else {
                setError(response.message || 'Invalid or expired code.');
            }
        } catch (error) {
            setError('Verification failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await sendEmailApi({ email: formData.email });
            if (response && response.success === true) {
                setCountdown(300);
                setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
            } else {
                setError(response.message || 'Resend failed.');
            }
        } catch (error) {
            setError('Resend failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const validatePassword = (password, confirmPassword = formData.confirmPassword) => {
        const validation = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            passwordsMatch: password === confirmPassword && password.length > 0 && confirmPassword.length > 0
        };
        setPasswordValidation(validation);
        return validation;
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setFormData(prev => ({ ...prev, password }));
        validatePassword(password);
        setError('');
    };

    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
        setFormData(prev => ({ ...prev, confirmPassword }));
        validatePassword(formData.password, confirmPassword);
        setError('');
    };

    const handleUpdatePassword = async () => {
        const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar, passwordsMatch } = passwordValidation;
        if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar || !passwordsMatch) {
            setError('Security criteria not met.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await updateRecoveryPasswordApi({
                email: formData.email,
                password: formData.password
            });
            if (response && response.success === true) {
                setCurrentStep(4);
            } else {
                setError(response.message || 'Failed to sync new credentials.');
            }
        } catch (error) {
            setError('Update failed. Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={onClose} />

            <div className="relative w-full max-w-[480px] animate-modalIn">
                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl bg-slate-900/40 backdrop-blur-3xl">
                    {/* Header */}
                    <div className="premium-gradient p-8 text-center relative overflow-hidden">
                        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-20">
                            <X className="w-6 h-6" />
                        </button>
                        
                        {/* Background shapes */}
                        <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex justify-center mb-8">
                                <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/10">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div key={step} className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                currentStep >= step ? 'bg-white text-indigo-600 shadow-lg' : 'bg-white/10 text-white/40'
                                            }`}>
                                                {currentStep > step ? <Check className="w-4 h-4" /> : step}
                                            </div>
                                            {step < 4 && <div className={`w-6 h-0.5 mx-1 rounded-full ${currentStep > step ? 'bg-white' : 'bg-white/10'}`} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-xl border border-white/20">
                                {currentStep === 1 && <Mail className="w-8 h-8 text-white" />}
                                {currentStep === 2 && <Shield className="w-8 h-8 text-white" />}
                                {currentStep === 3 && <Key className="w-8 h-8 text-white" />}
                                {currentStep === 4 && <CheckCircle className="w-8 h-8 text-white" />}
                            </div>

                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                {currentStep === 1 && "Security Check"}
                                {currentStep === 2 && "Verification"}
                                {currentStep === 3 && "Reset Access"}
                                {currentStep === 4 && "System Synced"}
                            </h2>
                            <p className="text-blue-100/60 text-sm font-medium mt-1">
                                {currentStep === 1 && "Enter your identity to proceed."}
                                {currentStep === 2 && "Secure 6-digit code transmitted."}
                                {currentStep === 3 && "Establish a robust new credential."}
                                {currentStep === 4 && "Security protocols successfully reset."}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 sm:p-10">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Identity Access</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={handleEmailChange}
                                            placeholder="admin@enterprise.com"
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                                {error && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                                <button
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                    className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? <Terminal className="w-5 h-5 animate-pulse" /> : <><span>Transmit Code</span><ChevronRight className="w-5 h-5" /></>}
                                </button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Authenticating Identity</p>
                                    <p className="text-sm text-white font-medium">{formData.email}</p>
                                </div>
                                <div className="flex justify-between gap-2">
                                    {formData.otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-xl font-black bg-slate-950/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        />
                                    ))}
                                </div>
                                {error && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 justify-center"><AlertCircle className="w-4 h-4" />{error}</div>}
                                <div className="flex flex-col items-center gap-4">
                                    {countdown > 0 ? (
                                        <div className="flex items-center text-[11px] font-black text-slate-500 uppercase tracking-widest"><Clock className="w-3 h-3 mr-2" />Resend in {formatTime(countdown)}</div>
                                    ) : (
                                        <button onClick={handleResendOtp} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2"><RefreshCw className="w-4 h-4" />Request New Code</button>
                                    )}
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isLoading}
                                        className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                                    >
                                        {isLoading ? <Terminal className="w-5 h-5 animate-pulse" /> : "Verify Identity"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">New Credential</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Identity</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Security Checklist</h4>
                                        <div className="grid grid-cols-2 gap-y-2">
                                            {[
                                                { label: '8+ Symbols', met: passwordValidation.minLength },
                                                { label: 'A-Z Case', met: passwordValidation.hasUppercase },
                                                { label: 'a-z Case', met: passwordValidation.hasLowercase },
                                                { label: '0-9 Digits', met: passwordValidation.hasNumber },
                                                { label: 'Special Chars', met: passwordValidation.hasSpecialChar },
                                                { label: 'Sync Match', met: passwordValidation.passwordsMatch }
                                            ].map((item, i) => (
                                                <div key={i} className={`flex items-center text-[10px] font-bold ${item.met ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                    {item.met ? <CheckCircle className="w-3 h-3 mr-1.5" /> : <div className="w-3 h-3 rounded-full border border-slate-700 mr-1.5" />}
                                                    {item.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {error && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">{error}</div>}
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={isLoading}
                                    className="w-full premium-gradient text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20"
                                >
                                    {isLoading ? <Terminal className="w-5 h-5 animate-pulse mx-auto" /> : "Update Security Protocols"}
                                </button>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="text-center space-y-8 animate-fadeIn">
                                <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                                    <Shield className="w-12 h-12 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Access Restored</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">System credentials successfully updated. You may now re-authenticate with the secure gateway.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-2xl"
                                >
                                    Return to Gateway
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;