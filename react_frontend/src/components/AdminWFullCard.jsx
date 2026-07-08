import React, { useState } from 'react';
import {
    Shield,
    Edit3,
    Trash2,
    X,
    Save,
    AlertTriangle,
    Calendar,
    User,
    Mail,
    Badge,
    CheckCircle,
    Search,
    ChevronDown,
    ChevronUp,
    UserCheck,
    UserX,
    Power,
    PowerOff,
    LogOut,
    Key,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { deleteAccount, resetAdminPassword, tougleAccountStatus } from '../apis/admin.api';
import { useUserStore } from '../tools/user.zustand';

// Defined outside the component so React sees a stable reference across renders.
// If defined inside, every re-render creates a new component type → input loses focus on each keystroke.
const ModalBackdrop = ({ children, show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                {children}
            </div>
        </div>
    );
};

const AdminWFullCard = ({ adminRecords: initialAdminRecords, type = 'admins' }) => {
    const isGuardian = type === 'admins';

    const { user } = useUserStore();

    const [adminRecords, setAdminRecords] = useState(
        initialAdminRecords
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showSelfDeactivationWarning, setShowSelfDeactivationWarning] = useState(false);
    const [notification, setNotification] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [editData, setEditData] = useState({
        email: '',
        epfNo: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Sync state when initialAdminRecords changes
    React.useEffect(() => {
        setAdminRecords(initialAdminRecords);
    }, [initialAdminRecords]);

    // Filter admin records based on search term
    const filteredAdminRecords = (Array.isArray(adminRecords) ? adminRecords : []).filter(record =>
        record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.epfNo?.toString().includes(searchTerm) ||
        record.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.isActive ? 'active' : 'inactive').includes(searchTerm.toLowerCase())
    );


    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Show system notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const showSuccess = (message) => {
        showNotification('success', message);
    };

    const showError = (message) => {
        showNotification('error', message);
    };


    // Handle card expand/collapse
    const toggleCard = (recordId) => {
        setExpandedCard(expandedCard === recordId ? null : recordId);
    };

    // Handle edit form submission (now only for demonstration - fields are read-only)
    const handleEditSubmit = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real scenario, this would be disabled since admin info can't be edited
            const updatedRecords = adminRecords.map(record =>
                record._id === selectedRecord._id
                    ? {
                        ...record,
                        // email: editData.email, // Commented out - no longer editable
                        // epfNo: parseInt(editData.epfNo), // Commented out - no longer editable
                        updatedAt: new Date().toISOString()
                    }
                    : record
            );

            setAdminRecords(updatedRecords);
            setShowEditModal(false);
            setSelectedRecord(null);
            showSuccess(`${isGuardian ? 'Guardian' : 'Staff'} account viewed successfully!`);
        } catch (error) {
            console.error('Error viewing account:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle account status toggle
    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            const res = await tougleAccountStatus(selectedRecord._id)

            if (res.success) {
                const updatedRecords = adminRecords.map(record =>
                    record._id === selectedRecord._id
                        ? {
                            ...record,
                            isActive: !record.isActive,
                            updatedAt: new Date().toISOString()
                        }
                        : record
                );

                setAdminRecords(updatedRecords);
                setShowToggleModal(false);
                setShowSelfDeactivationWarning(false);
                const newStatus = !selectedRecord.isActive;
                setSelectedRecord(null);
                showSuccess(`${isGuardian ? 'Guardian' : 'Staff'} account ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                
                // Add a small delay for the success message to be seen before reload
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showError(res.message || 'Failed to toggle account status. Please check your permissions.');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            const res = await deleteAccount(selectedRecord._id)

            if (res.success) {
                const updatedRecords = (Array.isArray(adminRecords) ? adminRecords : []).filter(
                    record => record._id !== selectedRecord._id
                );
                setAdminRecords(updatedRecords);
                setShowDeleteModal(false);
                setSelectedRecord(null);
                setExpandedCard(null);
                showSuccess(`${isGuardian ? 'Guardian' : 'Staff'} account deleted successfully!`);
            } else {
                showError(res.message || 'Failed to delete account. Please check your permissions.');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Open reset password modal
    const openResetPasswordModal = (record) => {
        setSelectedRecord(record);
        setNewPassword('');
        setShowResetPasswordModal(true);
    };

    // Handle password reset
    const handleResetPassword = async () => {
        if (!newPassword) {
            showError('Please enter a new password');
            return;
        }
        if (newPassword.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }
        setIsLoading(true);
        try {
            await resetAdminPassword(selectedRecord.email, newPassword);
            setShowResetPasswordModal(false);
            setNewPassword('');
            setSelectedRecord(null);
            showSuccess('Password reset successfully!');
        } catch (error) {
            console.error('Error resetting password:', error);
            showError(error?.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Open edit modal (now view-only)
    const openEditModal = (record) => {
        setSelectedRecord(record);
        setEditData({
            email: record.email,
            epfNo: record.epfNo.toString()
        });
        setShowEditModal(true);
    };

    // Open toggle modal
    const openToggleModal = (record) => {
        setSelectedRecord(record);

        // Check if user is trying to deactivate their own account
        if (record.isActive && user.email === record.email) {
            setShowSelfDeactivationWarning(true);
        } else {
            setShowToggleModal(true);
        }
    };

    // Proceed with self-deactivation after warning confirmation
    const proceedWithSelfDeactivation = () => {
        setShowSelfDeactivationWarning(false);
        setShowToggleModal(true);
    };

    // Open delete modal
    const openDeleteModal = (record) => {
        setSelectedRecord(record);
        setShowDeleteModal(true);
    };


    // Notification toast
    const ToastNotification = () => {
        if (!notification) return null;

        return (
            <div className={`fixed top-6 right-6 z-[100] max-w-md p-4 rounded-lg border shadow-lg flex items-start space-x-3 animate-fadeIn ${notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1 text-sm font-medium">{notification.message}</span>
                <button
                    onClick={() => setNotification(null)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <>
            <ToastNotification />

            <div className="space-y-4">
                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={`Search by email, EPF, role or status...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 outline-none"
                        />
                    </div>
                    {searchTerm && (
                        <p className="text-sm text-gray-600 mt-2">
                            Found {filteredAdminRecords.length} record{filteredAdminRecords.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Admin Records */}
                {filteredAdminRecords.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        {isGuardian ? <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" /> : <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
                        <p className="text-gray-600">No {isGuardian ? 'guardian' : 'staff'} accounts found matching your search.</p>
                    </div>
                ) : (
                    filteredAdminRecords.map((record) => {
                        const isExpanded = expandedCard === record._id;

                        return (
                            <div
                                key={record._id}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
                            >
                                {/* Clickable Header */}
                                <div
                                    className={`bg-gradient-to-r ${isGuardian ? 'from-purple-50 to-indigo-50' : 'from-emerald-50 to-teal-50'} px-6 py-4 border-b border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 group`}
                                    onClick={() => toggleCard(record._id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${isGuardian ? 'from-purple-500 to-indigo-600' : 'from-emerald-500 to-teal-600'} rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                                                {isGuardian ? <Shield className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex items-center justify-between flex-1">
                                                <div className="w-64 min-w-64">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Identifier</p>
                                                    <p className="font-semibold text-gray-900 truncate">{record.email}</p>
                                                </div>
                                                <div className="w-32 min-w-32 text-center border-x border-gray-100">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                        record.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700' : 
                                                        record.role === 'hr_officer' ? 'bg-teal-100 text-teal-700' :
                                                        record.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
                                                        record.role === 'hr_manager' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {record.role}
                                                    </span>
                                                </div>
                                                <div className="w-32 min-w-32 text-center">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">EPF Hub</p>
                                                    <p className="font-semibold text-gray-900">{record.epfNo}</p>
                                                </div>
                                                <div className="w-32 min-w-32 text-center">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Integrity</p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {record.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <div className="group-hover:text-purple-600 transition-colors duration-200">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="bg-white/50 px-6 py-6 border-t border-gray-100 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Details Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Node</p>
                                                        <p className="text-sm font-bold text-slate-800">{record.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                                                        <Badge className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Code</p>
                                                        <p className="text-sm font-bold text-slate-800">{record.epfNo}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                                                        <UserCheck className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Protocol</p>
                                                        <p className="text-sm font-bold text-slate-800 tracking-wide uppercase">{record.role}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group/actions">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover/actions:scale-150 transition-all duration-700"></div>
                                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Execution Protocols</h4>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button 
                                                        onClick={() => openResetPasswordModal(record)}
                                                        className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn"
                                                    >
                                                        <Key className="w-6 h-6 mb-2 text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Reset Password</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => openToggleModal(record)}
                                                        className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn"
                                                    >
                                                        {record.isActive ? <PowerOff className="w-6 h-6 mb-2 text-orange-400" /> : <Power className="w-6 h-6 mb-2 text-green-400" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{record.isActive ? 'Deactivate' : 'Activate'} Account</span>
                                                    </button>
                                                    {record.role !== 'superadmin' && (
                                                        <button 
                                                            onClick={() => openDeleteModal(record)}
                                                            className="flex flex-col items-center justify-center p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all col-span-2 group/btn"
                                                        >
                                                            <Trash2 className="w-6 h-6 mb-2 text-red-500 group-hover/btn:scale-110 transition-transform" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Purge Record</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-gray-100 pt-4 px-2">
                                            <div className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-2" />
                                                <span>Initialized: {formatDate(record.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <RefreshCw className="w-3 h-3 mr-2" />
                                                <span>Last Sync: {formatDate(record.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Self-Deactivation Warning Modal */}
            <ModalBackdrop show={showSelfDeactivationWarning} onClose={() => setShowSelfDeactivationWarning(false)}>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Warning: Self-Deactivation</h2>
                            <p className="text-sm text-gray-500 mt-1">You are about to deactivate your own account</p>
                        </div>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Critical Warning
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p className="mb-2">
                                        You are attempting to deactivate your own admin account. If you proceed:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>You will be immediately logged out of the system</li>
                                        <li>You will lose all admin privileges and access</li>
                                        <li>You cannot reactivate your account yourself</li>
                                        <li>Another admin will need to reactivate your account</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedRecord && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <p className="text-gray-800">
                                Account to be deactivated: <strong>{selectedRecord.email}</strong>
                            </p>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowSelfDeactivationWarning(false)}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={proceedWithSelfDeactivation}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>I Understand, Proceed</span>
                        </button>
                    </div>
                </div>
            </ModalBackdrop>

            {/* Edit Modal - Now View Only */}
            <ModalBackdrop show={showEditModal} onClose={() => setShowEditModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Edit3 className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">View Admin Account</h2>
                        </div>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={editData.email}
                                readOnly
                                className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                placeholder="Enter email address"
                            />
                            <p className="text-xs text-gray-500 mt-1">Admin information cannot be modified</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                EPF Number
                            </label>
                            <input
                                type="number"
                                value={editData.epfNo}
                                readOnly
                                className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                placeholder="Enter EPF number"
                            />
                            <p className="text-xs text-gray-500 mt-1">Admin information cannot be modified</p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </ModalBackdrop>

            {/* Account Status Toggle Modal */}
            <ModalBackdrop show={showToggleModal} onClose={() => setShowToggleModal(false)}>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedRecord?.isActive
                            ? 'bg-orange-100'
                            : 'bg-green-100'
                            }`}>
                            {selectedRecord?.isActive ? (
                                <PowerOff className="w-6 h-6 text-orange-600" />
                            ) : (
                                <Power className="w-6 h-6 text-green-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedRecord?.isActive ? 'Deactivate' : 'Activate'} Admin Account
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This will {selectedRecord?.isActive ? 'restrict' : 'restore'} account access
                            </p>
                        </div>
                    </div>

                    {selectedRecord && (
                        <div className={`border rounded-lg p-4 mb-6 ${selectedRecord.isActive
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-green-50 border-green-200'
                            }`}>
                            <p className={`${selectedRecord.isActive ? 'text-orange-800' : 'text-green-800'
                                }`}>
                                Are you sure you want to {selectedRecord.isActive ? 'deactivate' : 'activate'} the
                                admin account <strong>"{selectedRecord.email}"</strong>?
                                {selectedRecord.isActive
                                    ? ' This will prevent the user from accessing the admin panel.'
                                    : ' This will restore full admin access for this user.'
                                }
                            </p>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowToggleModal(false)}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors duration-200"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 text-white text-sm rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 ${selectedRecord?.isActive
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {selectedRecord?.isActive ? (
                                <PowerOff className="w-4 h-4" />
                            ) : (
                                <Power className="w-4 h-4" />
                            )}
                            <span>
                                {isLoading
                                    ? 'Processing...'
                                    : selectedRecord?.isActive
                                        ? 'Deactivate Account'
                                        : 'Activate Account'
                                }
                            </span>
                        </button>
                    </div>
                </div>
            </ModalBackdrop>

            {/* Delete Confirmation Modal */}
            <ModalBackdrop show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Delete Admin Account</h2>
                            <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                        </div>
                    </div>

                    {selectedRecord && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">
                                Are you sure you want to permanently delete the admin account
                                <strong> "{selectedRecord.email}"</strong> (EPF: {selectedRecord.epfNo})?
                                This will remove all admin privileges and cannot be reversed.
                            </p>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors duration-200"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>{isLoading ? 'Deleting...' : 'Delete Account'}</span>
                        </button>
                    </div>
                </div>
            </ModalBackdrop>

            {/* Reset Password Modal */}
            <ModalBackdrop show={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)}>
                <div className="p-6 text-left">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Key className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-left">Reset Admin Password</h2>
                        </div>
                        <button
                            onClick={() => setShowResetPasswordModal(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {selectedRecord && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                                <p className="text-sm text-indigo-800">
                                    Resetting password for: <strong>{selectedRecord.email}</strong>
                                </p>
                            </div>
                        )}

                        <div className="text-left">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowResetPasswordModal(false)}
                                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                {isLoading ? 'Processing...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </ModalBackdrop>
        </>
    );
};

export default AdminWFullCard;