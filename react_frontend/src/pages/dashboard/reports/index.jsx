import React, { useState } from 'react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import EPFReportWidget from '../../../components/EpfReportWidget';
import DeathDonationReportWidget from '../../../components/DeathDonationReportWidget';
import BulkImportModal from '../../../components/BulkImportModal';
import { 
    FileBarChart, Heart, Download, Upload, Shield, 
    Sparkles, ArrowRight, FileText, CheckCircle 
} from 'lucide-react';

const Reports = ({ currentPath }) => {
    const [activeCategory, setActiveCategory] = useState('medical'); // 'medical' or 'deathBenefit'
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [presetLoading, setPresetLoading] = useState(null);

    const handleQuickDownload = async (type, year = new Date().getFullYear()) => {
        setPresetLoading(type);
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            let url = '';
            let filename = '';

            if (type === 'medical-summary') {
                url = `${baseUrl}/api/v1/reports/medical-summary/${year}`;
                filename = `Full_Medical_Summary_${year}.pdf`;
            } else if (type === 'death-donation-summary') {
                url = `${baseUrl}/api/v1/reports/death-donation/summary/${year}`;
                filename = `Death_Donation_Master_Summary_${year}.pdf`;
            } else if (type === 'death-donation-all') {
                url = `${baseUrl}/api/v1/reports/death-donation/summary/ALL`;
                filename = `Death_Donation_AllTime_Summary.pdf`;
            }

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Quick download failed.');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Quick download error:', err);
            alert('Failed to generate quick report. Please try using the main report generator form below.');
        } finally {
            setPresetLoading(null);
        }
    };

    return (
        <Tab>
            <TabHeader
                title="Reports & Analytics Hub"
                subtitle="Generate and download official PDF reports for Medical Allowances and Death Benefit Donations"
                currentPath={currentPath}
            />

            <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
                
                {/* ── Top Hero Presets & Quick Export Section ──────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Preset Card 1: Medical Summary */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl shadow-blue-200/50 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                        <div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/10">
                                <FileBarChart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Company Master Report</span>
                            <h3 className="text-xl font-black mt-1">Medical Allowance Summary</h3>
                            <p className="text-xs text-blue-100/80 mt-1 font-semibold leading-relaxed">
                                Complete organization-wide medical expense allocations & balances statement for {new Date().getFullYear()}.
                            </p>
                        </div>
                        <button
                            onClick={() => handleQuickDownload('medical-summary')}
                            disabled={presetLoading === 'medical-summary'}
                            className="mt-6 w-full py-3 bg-white text-blue-700 font-black text-xs rounded-2xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                        >
                            {presetLoading === 'medical-summary' ? (
                                <div className="w-4 h-4 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span>Quick Export {new Date().getFullYear()} PDF</span>
                        </button>
                    </div>

                    {/* Preset Card 2: Death Benefit Summary */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-xl shadow-amber-200/50 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                        <div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/10">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">Company Master Report</span>
                            <h3 className="text-xl font-black mt-1">Death Donation Summary</h3>
                            <p className="text-xs text-amber-100/80 mt-1 font-semibold leading-relaxed">
                                Disbursed death benefit grants breakdown, claimant relationships, and voucher references.
                            </p>
                        </div>
                        <button
                            onClick={() => handleQuickDownload('death-donation-summary')}
                            disabled={presetLoading === 'death-donation-summary'}
                            className="mt-6 w-full py-3 bg-white text-amber-800 font-black text-xs rounded-2xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                        >
                            {presetLoading === 'death-donation-summary' ? (
                                <div className="w-4 h-4 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span>Quick Export {new Date().getFullYear()} PDF</span>
                        </button>
                    </div>

                    {/* Preset Card 3: Bulk Import & Data Actions */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                        <div>
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-slate-700" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Import & Actions</span>
                            <h3 className="text-xl font-black text-slate-900 mt-1">Bulk Medical Import</h3>
                            <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                                Upload monthly EPF medical claim CSV/Excel datasets into the system database.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="mt-6 w-full py-3 bg-slate-900 text-white font-black text-xs rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Launch Bulk Import Wizard</span>
                        </button>
                    </div>
                </div>

                {/* ── Category Selection Hub Navigation ───────────────────────── */}
                <div className="bg-slate-100 p-1.5 rounded-3xl flex items-center gap-2 max-w-xl mx-auto shadow-inner">
                    <button
                        onClick={() => setActiveCategory('medical')}
                        className={`flex-1 py-3.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2.5 ${
                            activeCategory === 'medical'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FileBarChart className="w-4 h-4" />
                        <span>Medical Allowance Reports</span>
                    </button>

                    <button
                        onClick={() => setActiveCategory('deathBenefit')}
                        className={`flex-1 py-3.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2.5 ${
                            activeCategory === 'deathBenefit'
                                ? 'bg-white text-amber-700 shadow-md'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Heart className="w-4 h-4 text-amber-600" />
                        <span>Death Donation Reports</span>
                    </button>
                </div>

                {/* ── Active Report Generator Component ───────────────────────── */}
                <div className="transition-all duration-300">
                    {activeCategory === 'medical' ? (
                        <EPFReportWidget />
                    ) : (
                        <DeathDonationReportWidget />
                    )}
                </div>

                {/* Bulk Import Modal */}
                <BulkImportModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onSuccess={() => {
                        setIsBulkModalOpen(false);
                    }}
                />
            </div>
        </Tab>
    );
};

export default Reports;