import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Shield, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../apis/login.api';

const LoginUI = ({ forgotClicked = () => { } }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (message) {
            setMessage(null);
            setMessageType('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setMessageType('');

        try {
            const response = await loginApi(formData);
            if (response.success) {
                setMessage(response.message || 'Access Granted');
                setMessageType('success');
                setTimeout(() => navigate('/dashboard'), 1000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Authentication failed. Please verify credentials.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-slate-950">
            {/* Dynamic Mesh Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[440px] animate-fadeIn">
                <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight uppercase">UMS <span className="text-indigo-400">Pro</span></h1>
                        <p className="text-slate-400 text-sm font-medium">Secure Administrative Gateway</p>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`mb-8 p-4 rounded-2xl border flex items-center space-x-3 transition-all animate-fadeIn ${
                            messageType === 'success' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                            {messageType === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <span className="text-xs font-bold leading-tight">{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            {/* Email / EPF */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Account Identity</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email or EPF Number"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Secret Code</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-white/10 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 shadow-sm"
                                />
                                <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Remember Me</span>
                            </label>
                            <button
                                type="button"
                                onClick={forgotClicked}
                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Recover Password
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full premium-gradient text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Verify & Login</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Copyright */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        © 2026 Admin Management • Enterprise Edition
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginUI;