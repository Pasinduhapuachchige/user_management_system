import React, { useState, useEffect } from 'react';
import { Heart, Save, CheckCircle2, AlertCircle, Loader2, DollarSign, FileText } from 'lucide-react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import { getDeathBenefitConfigApi, updateDeathBenefitConfigApi } from '../../../apis/deathBenefit.api';

const DeathBenefitSettings = ({ currentPath }) => {
    const [defaultAmount, setDefaultAmount] = useState(50000);
    const [description, setDescription] = useState('Standard Death Benefit amount for eligible family members');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const res = await getDeathBenefitConfigApi();
                if (res?.data) {
                    setDefaultAmount(res.data.defaultAmount || 50000);
                    setDescription(res.data.description || '');
                }
            } catch (err) {
                console.error('Failed to load death benefit configuration:', err);
                setError('Failed to load death benefit settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!defaultAmount || Number(defaultAmount) < 0) {
            setError('Please enter a valid positive benefit amount.');
            return;
        }

        try {
            setSaving(true);
            const res = await updateDeathBenefitConfigApi({
                defaultAmount: Number(defaultAmount),
                description
            });
            setMessage(res?.message || 'Death benefit configuration saved successfully!');
        } catch (err) {
            console.error('Error saving death benefit config:', err);
            setError(err.response?.data?.message || 'Failed to save configuration.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Tab>
            <TabHeader
                title="Dead Donation Configuration"
                subtitle="Configure the standard default donation grant amount for eligible family members"
                currentPath={currentPath}
            />

            <div className="max-w-3xl space-y-6">
                {/* Alert Banners */}
                {message && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-fadeIn">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm space-y-6">
                    <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Heart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Standard Death Benefit Policy</h3>
                            <p className="text-xs text-slate-500">This amount automatically populates when issuing new death benefit records</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                            <p className="font-semibold text-sm">Loading configuration...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Default Amount Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Default Death Benefit Amount (LKR) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative max-w-md">
                                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-xs">LKR</span>
                                    <input
                                        type="number"
                                        placeholder="50000"
                                        value={defaultAmount}
                                        onChange={(e) => setDefaultAmount(e.target.value)}
                                        className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Applies to eligible family members: Spouse, Father, Mother, Spouse's Father, Spouse's Mother, and Children.
                                </p>
                            </div>

                            {/* Description / Guidelines */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Policy Description / Guidelines
                                </label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter policy description or notes..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving Configuration...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Tab>
    );
};

export default DeathBenefitSettings;
