import React from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // In a real application, you might log the error to an error reporting service.
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        // Recovery mechanism: Clear state and attempt a reload.
        window.location.reload();
    };

    handleHome = () => {
        // Redirection to safety.
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Premium Fallback UI
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Animated Mesh Gradients */}
                    <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow"></div>

                    <div className="glass-card max-w-2xl w-full p-12 rounded-[3.5rem] border border-white/5 relative z-10 text-center animate-modalIn">
                        <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] border border-rose-500/20 flex items-center justify-center mx-auto mb-10 shadow-2xl">
                            <ShieldAlert className="w-12 h-12 text-rose-500" />
                        </div>

                        <div className="space-y-6 mb-12">
                            <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                                <span>CRITICAL SYSTEM KERNEL PANIC</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-outfit">
                                Terminal Logic Failure Identified
                            </h1>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                                The master application instance encountered an unrecoverable state. Critical data buffers have been isolated for safety.
                            </p>
                        </div>

                        {/* Error Diagnostic (Hidden by default but accessible) */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-left mb-10 font-mono text-xs overflow-auto max-h-32 custom-scrollbar">
                            <div className="text-rose-400 font-bold mb-2 uppercase tracking-widest text-[9px]">Diagnostic Dump 0x404:</div>
                            <p className="text-slate-400 italic">
                                {this.state.error?.toString() || 'Unknown Kernel Trap'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center space-x-3 bg-white text-indigo-600 py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Initiate Recovery</span>
                            </button>
                            <button
                                onClick={this.handleHome}
                                className="flex items-center justify-center space-x-3 bg-white/5 text-white border border-white/10 py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                            >
                                <Home className="w-4 h-4 opacity-70" />
                                <span>Sector Extraction</span>
                            </button>
                        </div>
                    </div>

                    <style jsx={'true'}>{`
                        @keyframes pulse-slow {
                            0%, 100% { opacity: 0.2; transform: scale(1); }
                            50% { opacity: 0.3; transform: scale(1.1); }
                        }
                        .animate-pulse-slow {
                            animation: pulse-slow 8s infinite ease-in-out;
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
