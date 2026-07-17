import React, { useState, useEffect } from 'react';
import { 
    X, 
    HelpCircle, 
    Send, 
    CheckCircle, 
    AlertCircle, 
    Search, 
    ChevronDown, 
    ChevronUp, 
    BookOpen, 
    MessageSquare,
    Loader2
} from 'lucide-react';
import axios from 'axios';

const SupportModal = ({ isOpen, onClose, user }) => {
    const [activeTab, setActiveTab] = useState('docs'); // 'docs' or 'contact'
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'Bug Report / Technical Error',
        subject: '',
        message: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                category: 'Bug Report / Technical Error',
                subject: '',
                message: ''
            });
            setSubmitSuccess(false);
            setErrorMessage('');
            setActiveTab('docs');
            setSearchQuery('');
            setExpandedFaq(null);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const faqs = [
        {
            q: "How do I claim medical expenses?",
            a: "Navigate to the Benefits tab, click New Entry, select the employee, choose the category, input the receipt amount and date, and upload the claim info. The system will track it against the EPF/Medical annual configuration limit."
        },
        {
            q: "How can I update my profile details?",
            a: "If you need to make changes to your profile details (e.g. spouse, children, contact info), navigate to My Profile. If editing is restricted, please reach out to your HR administrator."
        },
        {
            q: "How do I reset my password?",
            a: "Go to My Profile and click on the 'Change Password' button. Enter your current password followed by your new password (minimum 8 characters with at least one uppercase, lowercase, number, and special character)."
        },
        {
            q: "What is 'Maintenance Mode'?",
            a: "Maintenance Mode suspends system access for all non-superadmin users. It is activated during upgrades or backups. Maintenance configurations are located under the Configuration > Maintenance Mode menu for Super Admins."
        },
        {
            q: "How can I generate and export EPF/Medical reports?",
            a: "Go to the Analytics tab in the sidebar. Select the target employee or year, choose the report format, and click the download button to export the PDF/Excel report."
        }
    ];

    const filteredFaqs = faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.message.trim()) {
            setErrorMessage('Subject and message are required.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/support/contact`,
                formData,
                { withCredentials: true }
            );

            if (res.data.success) {
                setSubmitSuccess(true);
            } else {
                setErrorMessage(res.data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error(err);
            const serverMessage = err.response?.data?.message;
            if (serverMessage && (serverMessage.includes('support email') || serverMessage.includes('SMTP') || err.response?.status === 500)) {
                setErrorMessage('The system was unable to dispatch your ticket via email. This is usually due to a mail server configuration issue. You can copy or download your inquiry details below to send to the administrator directly.');
            } else {
                setErrorMessage(serverMessage || 'Failed to send support ticket. Please check your connection and try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden animate-fadeIn relative max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between premium-gradient text-white flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Help & Support Center</h2>
                            <p className="text-xs text-white/80">Documentation and Technical Support Team</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all duration-200"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-100 bg-slate-50 p-2 flex-shrink-0">
                    <button 
                        onClick={() => setActiveTab('docs')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                            activeTab === 'docs' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Guide & FAQs</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                            activeTab === 'contact' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Contact Technical Team</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {activeTab === 'docs' ? (
                        <div className="space-y-6">
                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    placeholder="Search guide & FAQs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm text-slate-700 bg-slate-50/50"
                                />
                            </div>

                            {/* FAQs list */}
                            <div className="space-y-3">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, idx) => {
                                        const isExpanded = expandedFaq === idx;
                                        return (
                                            <div 
                                                key={idx} 
                                                className="border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-all"
                                            >
                                                <button
                                                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50/30 text-left hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className="font-bold text-sm text-slate-800">{faq.q}</span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                    )}
                                                </button>
                                                {isExpanded && (
                                                    <div className="p-4 bg-white border-t border-slate-50 text-slate-600 text-sm leading-relaxed animate-fadeIn">
                                                        {faq.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        No guide articles found matching your query.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        submitSuccess ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-fadeIn">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200 shadow-sm">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Support Ticket Sent!</h3>
                                <p className="text-slate-500 text-sm max-w-sm">
                                    Your inquiry has been successfully transmitted to our technical support team. A team member will respond to your email shortly.
                                </p>
                                <button 
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all mt-4"
                                >
                                    Close Window
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {errorMessage && (
                                    <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl flex flex-col space-y-3 text-sm text-rose-800 backdrop-blur-sm animate-fadeIn">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-1 flex-1">
                                                <p className="font-bold text-rose-900">Email Delivery Issue (Server Error 500)</p>
                                                <p className="text-xs text-rose-700 leading-relaxed">
                                                    {errorMessage}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pl-8">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        `Subject: ${formData.subject}\nCategory: ${formData.category}\nMessage:\n${formData.message}`
                                                    );
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 2000);
                                                }}
                                                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                            >
                                                {copied ? '✓ Copied Details!' : 'Copy Ticket Details'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const element = document.createElement("a");
                                                    const file = new Blob([
                                                        `SPC Welfare Support Inquiry\n============================\n` +
                                                        `Date: ${new Date().toLocaleString()}\n` +
                                                        `From: ${formData.name} (${formData.email})\n` +
                                                        `Category: ${formData.category}\n` +
                                                        `Subject: ${formData.subject}\n` +
                                                        `Message:\n${formData.message}\n`
                                                    ], {type: 'text/plain'});
                                                    element.href = URL.createObjectURL(file);
                                                    element.download = `support-inquiry-${Date.now()}.txt`;
                                                    document.body.appendChild(element);
                                                    element.click();
                                                    document.body.removeChild(element);
                                                }}
                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                            >
                                                Download Ticket (.txt)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Email</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Inquiry Category</label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-700"
                                    >
                                        <option value="Bug Report / Technical Error">Bug Report / Technical Error</option>
                                        <option value="Access / Permission Issue">Access / Permission Issue</option>
                                        <option value="Welfare Claim Issue">Welfare Claim Issue</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                                    <input 
                                        type="text" 
                                        name="subject"
                                        placeholder="Brief summary of your inquiry"
                                        value={formData.subject}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message / Details</label>
                                    <textarea 
                                        name="message"
                                        rows="4"
                                        placeholder="Please provide full details, including steps to reproduce bugs or EPF numbers if relevant..."
                                        value={formData.message}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-700"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Send Ticket</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )
                    )}
                </div>

                {/* Footer details */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center flex-shrink-0 text-xs text-slate-400">
                    SPC Welfare Portal Technical Support • Available 24/7 for critical system issues
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
