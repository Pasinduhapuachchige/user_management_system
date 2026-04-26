import React, { useState, useEffect, useRef } from 'react';
import { 
    Download, User, Calendar, Search, X, 
    FileText, PieChart, Users, AlertCircle, 
    CheckCircle, Shield, Briefcase, FileBarChart, Upload
} from 'lucide-react';
import { getEmployeesApi } from '../apis/employee.api.jsx';
import BulkImportModal from './BulkImportModal';

const EPFReportWidget = () => {
    // --- STATE ---
    const [reportType, setReportType] = useState('individual'); // 'individual' or 'summary'
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    
    const searchRef = useRef(null);

    // --- EFFECTS ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2 || reportType === 'summary') {
                setSuggestions([]);
                return;
            }
            try {
                const data = await getEmployeesApi({ search: searchTerm });
                setSuggestions(data.data || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Error fetching employees:', err);
                setSuggestions([]);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, reportType]);

    // --- HANDLERS ---
    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(employee.name);
        setShowSuggestions(false);
        setError('');
    };

    const handleClearSelection = () => {
        setSelectedEmployee(null);
        setSearchTerm('');
        setSuggestions([]);
        setError('');
    };

    const handleDownload = async () => {
        if (reportType === 'individual' && !selectedEmployee) {
            setError('Please select an employee for the individual report.');
            return;
        }

        if (!year || year.length !== 4) {
            setError('Please enter a valid 4-digit year.');
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const url = reportType === 'individual' 
                ? `${baseUrl}/api/v1/reports/epf/${selectedEmployee._id}/${year}`
                : `${baseUrl}/api/v1/reports/medical-summary/${year}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Report generation failed server-side.');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            const filename = reportType === 'individual'
                ? `Medical_Report_${selectedEmployee.name.replace(/\s+/g, '_')}_${year}.pdf`
                : `Full_Medical_Summary_${year}.pdf`;
                
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            setSuccessMessage(`${reportType === 'individual' ? 'Individual' : 'Summary'} report generated successfully.`);
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to generate report. Please verify connection and data availability.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-100/50 border border-blue-50">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <FileBarChart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Generator</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Medical Allowance Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                    <button 
                        onClick={() => { setReportType('individual'); setError(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                            reportType === 'individual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <User className="w-4 h-4" /> Individual
                    </button>
                    <button 
                        onClick={() => { setReportType('summary'); handleClearSelection(); setError(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                            reportType === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <PieChart className="w-4 h-4" /> Full Summary
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <Upload className="w-4 h-4" /> Bulk Import
                    </button>
                </div>
            </div>

            {/* Main Configuration Card */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 border border-slate-100 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 1: Target Identification */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-4 h-4" /> 1. Report Scope
                        </h3>

                        {reportType === 'individual' ? (
                            <div ref={searchRef} className="relative">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Search Employee</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (!e.target.value) setSelectedEmployee(null);
                                        }}
                                        onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                        placeholder="Find employee by name..."
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                                    />
                                    {selectedEmployee && (
                                        <button
                                            onClick={handleClearSelection}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-all"
                                        >
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    )}
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in">
                                        {suggestions.map((employee) => (
                                            <button
                                                key={employee._id}
                                                onClick={() => handleSelectEmployee(employee)}
                                                className="w-full p-4 text-left hover:bg-blue-600 group transition-all border-b border-slate-50 last:border-0"
                                            >
                                                <div className="font-bold text-slate-900 group-hover:text-white">{employee.name}</div>
                                                <div className="text-xs font-bold text-slate-400 group-hover:text-blue-100 flex items-center gap-2 mt-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 group-hover:bg-blue-500 rounded text-slate-500 group-hover:text-white uppercase">{employee.epfNumber}</span>
                                                    <span>{employee.department?.name || 'N/A'}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-black text-blue-900 uppercase">All Employees</h4>
                                <p className="text-xs font-bold text-blue-400 mt-1">Generating a master summary for the entire organization.</p>
                            </div>
                        )}

                        {selectedEmployee && reportType === 'individual' && (
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-2xl animate-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Target</p>
                                        <p className="text-sm font-bold text-indigo-900">{selectedEmployee.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 2: Date Configuration */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> 2. Period Selection
                        </h3>
                        
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Report Year</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['2024', '2025', '2026'].map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setYear(y)}
                                        className={`py-3 rounded-xl font-bold transition-all border-2 ${
                                            year === y 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 ml-1">Or Specific Year</p>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="e.g. 2023"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Feedback */}
                {(error || successMessage) && (
                    <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in ${
                        error ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                    }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            error ? 'bg-rose-100' : 'bg-emerald-100'
                        }`}>
                            {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <p className="text-sm font-bold leading-tight">{error || successMessage}</p>
                    </div>
                )}

                {/* Final Action */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleDownload}
                        disabled={loading || (reportType === 'individual' && !selectedEmployee)}
                        className={`w-full py-5 rounded-[2rem] font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl ${
                            loading || (reportType === 'individual' && !selectedEmployee)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download className="w-6 h-6" />
                        )}
                        <span className="text-lg uppercase tracking-widest">
                            {loading ? 'Compiling Report...' : `Generate ${reportType === 'individual' ? 'Medical Report' : 'Master Summary'}`}
                        </span>
                    </button>
                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        State Pharmaceuticals Corporation · Authorized Personnel Only
                    </p>
                </div>
            </div>

            <BulkImportModal 
                isOpen={isBulkModalOpen} 
                onClose={() => setIsBulkModalOpen(false)} 
                onRefresh={() => {
                    // Force a refresh if needed, though most data is fetched on demand
                    setSuccessMessage('Data imported! Reports are now up to date.');
                    setTimeout(() => setSuccessMessage(''), 5000);
                }}
            />
        </div>
    );
};

export default EPFReportWidget;