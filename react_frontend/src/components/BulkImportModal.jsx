import React, { useState, useRef } from 'react';
import { 
    X, Upload, FileText, CheckCircle, 
    AlertCircle, Loader2, Download, 
    Table, BarChart3, ArrowRight
} from 'lucide-react';

const BulkImportModal = ({ isOpen, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select an Excel file first.");
            return;
        }

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/api/v1/epf/bulk-import`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
                setStatus('success');
                if (onRefresh) onRefresh();
            } else {
                throw new Error(data.message || "Failed to import records.");
            }
        } catch (err) {
            console.error("Bulk Import Error:", err);
            setError(err.message);
            setStatus('error');
        }
    };

    const reset = () => {
        setFile(null);
        setStatus('idle');
        setResult(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-white overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Bulk Report Import</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Faster Data Management</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-8">
                    {status === 'idle' || status === 'error' ? (
                        <div className="space-y-8">
                            {/* Drag & Drop Area */}
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className={`group relative border-4 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/20'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                />
                                
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-md group-hover:scale-110 mb-4 ${
                                    file ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'
                                }`}>
                                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                                </div>
                                
                                <div className="text-center">
                                    <h4 className="text-lg font-black text-slate-900 mb-1">
                                        {file ? file.name : "Click to select Excel file"}
                                    </h4>
                                    <p className="text-sm font-bold text-slate-400">
                                        {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drop your .xlsx or .csv files here"}
                                    </p>
                                </div>
                            </div>

                            {/* Template Hint */}
                            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                <Table className="w-5 h-5 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-amber-900 uppercase mb-1">Required Columns</p>
                                    <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                        EPF_Number, Year, Date, Amount, Type (regular/range), Range_Name (if range)
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-fadeIn">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <button 
                                onClick={handleUpload}
                                disabled={!file}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl ${
                                    !file ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                }`}
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span className="uppercase tracking-widest">Start Batch Processing</span>
                            </button>
                        </div>
                    ) : status === 'uploading' ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-8 border-slate-100 rounded-full animate-pulse" />
                                <Loader2 className="w-24 h-24 text-blue-600 animate-spin absolute top-0" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Processing Data</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2">Validating records and updating limits...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Result Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-center">
                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <p className="text-2xl font-black text-emerald-700">{result?.summary.successCount}</p>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Imported Successfully</p>
                                </div>
                                <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
                                    <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <p className="text-2xl font-black text-rose-700">{result?.summary.failCount}</p>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Failed Records</p>
                                </div>
                            </div>

                            {/* Error Details */}
                            {result?.errors.length > 0 && (
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {result.errors.map((err, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-3">
                                            <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded flex items-center justify-center text-[10px] flex-shrink-0">#{err.row}</span>
                                            {err.message}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                onClick={reset}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Done & Refresh
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
