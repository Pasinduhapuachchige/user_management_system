import React, { useState, useEffect } from 'react';
import { 
    Wrench, Save, RefreshCw, AlertTriangle, 
    CheckCircle, AlertCircle, ShieldAlert, Settings, Info
} from 'lucide-react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import { getMaintenanceSettings, updateMaintenanceSettings } from '../../../apis/maintenance.api';

const MaintenanceSettings = ({ currentPath }) => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [originalMode, setOriginalMode] = useState(false);
    const [originalMessage, setOriginalMessage] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmInput, setConfirmInput] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setFetching(true);
        setNotification(null);
        try {
            const response = await getMaintenanceSettings();
            if (response.success) {
                setMaintenanceMode(response.data.maintenanceMode);
                setMaintenanceMessage(response.data.maintenanceMessage);
                setOriginalMode(response.data.maintenanceMode);
                setOriginalMessage(response.data.maintenanceMessage);
            } else {
                showNotification('error', response.message || 'Failed to load settings');
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            showNotification('error', err.message || 'An error occurred while loading settings');
        } finally {
            setFetching(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const hasChanges = maintenanceMode !== originalMode || maintenanceMessage !== originalMessage;

    const handleSaveClick = (e) => {
        e.preventDefault();
        
        // If we are activating maintenance mode, show a high-alert warning modal
        if (maintenanceMode && !originalMode) {
            setShowConfirmModal(true);
            setConfirmInput('');
        } else {
            submitChanges();
        }
    };

    const submitChanges = async () => {
        setLoading(true);
        setNotification(null);
        setShowConfirmModal(false);
        try {
            const response = await updateMaintenanceSettings({
                maintenanceMode,
                maintenanceMessage
            });
            if (response.success) {
                showNotification('success', response.message || 'Settings updated successfully');
                setOriginalMode(maintenanceMode);
                setOriginalMessage(maintenanceMessage);
            } else {
                showNotification('error', response.message || 'Failed to update settings');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            showNotification('error', err.message || 'An error occurred while saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tab>
            <TabHeader
                title="System Maintenance Protocol"
                subtitle="Manage scheduled down-times and restrict system access"
                currentPath={currentPath}
            />

            <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 animate-fadeIn">
                {/* Status Card */}
                <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 mb-8 shadow-2xl">
                    {/* Background glow */}
                    <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-10 transition-all duration-1000 ${
                        maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                maintenanceMode 
                                    ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' 
                                    : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                            }`}>
                                <Wrench className={`w-8 h-8 ${maintenanceMode ? 'animate-bounce' : ''}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">Current State</p>
                                <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                                    {fetching ? 'Reading Configuration...' : (maintenanceMode ? 'Maintenance Mode Active' : 'System Fully Operational')}
                                </h2>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                                    {maintenanceMode 
                                        ? 'Access is suspended for all standard users. Only Super Administrators can log in.' 
                                        : 'All components are online. Normal HR administrators and employees can log in and access system services.'}
                                </p>
                            </div>
                        </div>

                        {/* Switch Switcher */}
                        {!fetching && (
                            <button
                                type="button"
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer ${
                                    maintenanceMode ? 'bg-amber-500' : 'bg-slate-800'
                                }`}
                            >
                                <span
                                    className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-500 ${
                                        maintenanceMode ? 'translate-x-14' : 'translate-x-2'
                                    }`}
                                />
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications */}
                {notification && (
                    <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border animate-fadeIn ${
                        notification.type === 'success' 
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
                            : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                    }`}>
                        {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-semibold">{notification.message}</span>
                    </div>
                )}

                {/* Configuration Details Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/80 p-8 shadow-xl">
                    <form onSubmit={handleSaveClick}>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-indigo-500" />
                                    Protocol Parameters
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">Configure warning messages and banner alerts visible to users on the login interface.</p>
                            </div>

                            {/* Alert Box showing caution information */}
                            {maintenanceMode && (
                                <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-4">
                                    <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-wider mb-1">Active Lockout Notice</h4>
                                        <p className="text-xs text-amber-300/80 leading-relaxed font-medium">
                                            Warning: Saving this configuration will immediately terminate all active sessions for standard admin staff, HR officers, and employees. They will be logged out automatically and blocked from access until Maintenance Mode is deactivated.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Message input */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Banner Message
                                </label>
                                <textarea
                                    value={maintenanceMessage}
                                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                                    placeholder="Enter instructions or notification message..."
                                    rows={4}
                                    disabled={fetching || loading}
                                    className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium leading-relaxed"
                                />
                                <p className="text-[11px] text-slate-500 leading-normal flex items-center gap-1.5 font-medium">
                                    <Info size={12} className="text-indigo-400" />
                                    This text is dynamically displayed inside the alert banner at the top of the login portal.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-800/80">
                                <button
                                    type="submit"
                                    disabled={fetching || loading || !hasChanges}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save Protocol Configuration
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={fetchSettings}
                                    disabled={fetching || loading}
                                    className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-semibold hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Revert Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* DANGER CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
                    
                    {/* Modal */}
                    <div className="relative bg-slate-900 border border-rose-500/30 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-fadeIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 animate-pulse">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Initiate System Lockdown?</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                                You are about to activate **Maintenance Mode**. Standard users will be disconnected and blocked from logging in. 
                                <br /><br />
                                To proceed, type <span className="text-rose-400 font-bold tracking-widest select-none">ACTIVATE</span> below.
                            </p>
                            
                            <input
                                type="text"
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder="Type confirmation keyword..."
                                className="w-full text-center bg-slate-950 border border-slate-800 focus:border-rose-500/60 rounded-xl p-3 text-sm font-bold tracking-widest text-rose-300 placeholder-slate-700 focus:outline-none transition-all uppercase mb-6"
                            />
                            
                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={submitChanges}
                                    disabled={confirmInput !== 'ACTIVATE' || loading}
                                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    Activate Lockdown
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                                >
                                    Cancel Protocol
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Tab>
    );
};

export default MaintenanceSettings;
