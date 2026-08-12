import React, { useState, useEffect } from 'react';
import {
    User, Edit3, Trash2, X, Save, AlertTriangle, Calendar, Mail, Phone,
    Building2, CreditCard, Heart, CheckCircle, Briefcase, ChevronRight,
    Camera, Info, Users, Baby, UserX, UserCheck
} from 'lucide-react';
import { toggleEmployeeStatusApi, updateEmployeeApi, uploadBirthCertificateApi, deleteBirthCertificateApi } from '../apis/employee.api';
import { fetchDepartmentsApi } from '../apis/department.api';
import { getMaxEpf, getEmpEpf } from '../apis/epf.api';
import { createPortal } from 'react-dom';
import { GeneralTab, EmploymentTab, FamilyTab } from './EmployeeDetailTabs';
import './EmployeeCardStyles.css';

const EmployeeWFullCard = ({ initialEmployee }) => {
    // --- STATE ---
    const [employee, setEmployee] = useState(initialEmployee);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [errors, setErrors] = useState({});
    const [allowanceData, setAllowanceData] = useState({ total: 0, spent: 0 });

    // --- EFFECTS ---
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetchDepartmentsApi();
                setDepartments(response.data || []);
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    // Fetch medical allowance when modal opens
    useEffect(() => {
        if (showDetailModal && employee?._id) {
            const fetchAllowance = async () => {
                try {
                    const [configRes, epfRes] = await Promise.all([
                        getMaxEpf(),
                        getEmpEpf({ user_id: employee._id, year: new Date().getFullYear() })
                    ]);

                    const total = configRes?.data?.maxEpf || 15000;
                    const spent = epfRes?.data?.length > 0 ? epfRes.data[0].expense : 0;
                    
                    setAllowanceData({ total, spent });
                } catch (err) {
                    console.error('Error fetching allowance data:', err);
                }
            };
            fetchAllowance();
        }
    }, [showDetailModal, employee?._id]);

    // Sync editedEmployee when joining edit mode
    useEffect(() => {
        if (isEditing && !editedEmployee) {
            setEditedEmployee({ ...employee });
        }
    }, [isEditing, employee, editedEmployee]);

    // --- HELPERS ---
    const showNotice = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleToggleEdit = () => {
        if (isEditing) {
            setEditedEmployee(null);
            setErrors({});
        }
        setIsEditing(!isEditing);
    };

    const handleUpdateField = (field, value) => {
        setEditedEmployee(prev => ({ ...prev, [field]: value }));
        // Basic real-time clear of errors
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleUpdateFamilyItem = (type, index, field, value) => {
        setEditedEmployee(prev => {
            const items = [...(prev[type] || [])];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, [type]: items };
        });
    };

    const handleAddFamilyItem = (type, defaultValue) => {
        setEditedEmployee(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), defaultValue]
        }));
    };

    const handleRemoveFamilyItem = (type, index) => {
        setEditedEmployee(prev => ({
            ...prev,
            [type]: (prev[type] || []).filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!editedEmployee.name) newErrors.name = 'Name is required';
        if (!editedEmployee.epfNumber) newErrors.epfNumber = 'EPF Number is required';
        if (!editedEmployee.contactNumber) newErrors.contactNumber = 'Contact is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- API CALLS ---
    const handleSave = async () => {
        if (!validateForm()) {
            showNotice('error', 'Please fix validation errors');
            return;
        }

        setIsLoading(true);
        try {
            // Processing for specific fields like basicSalary (ensure number)
            const payload = { ...editedEmployee };
            if (payload.basicSalary) payload.basicSalary = parseFloat(payload.basicSalary);
            
            // If department is an object, send only the ID
            if (payload.department && typeof payload.department === 'object') {
                payload.department = payload.department._id;
            }

            // Extract any pending birth certificate files attached to children
            const pendingCertFiles = (payload.children || []).map(c => c?.pendingCertFile || null);
            if (payload.children) {
                payload.children = payload.children.map(c => {
                    if (!c) return c;
                    const { pendingCertFile, ...rest } = c;
                    return rest;
                });
            }

            const response = await updateEmployeeApi(employee._id, payload);
            
            if (response?.success || (response?.data && response?.data._id)) {
                let finalData = response.data || payload;

                // If any children had pending birth certificate files selected during edit mode, upload them now
                if (pendingCertFiles.some(f => f !== null) && finalData._id) {
                    const uploadPromises = pendingCertFiles.map((file, idx) => {
                        if (file) {
                            return uploadBirthCertificateApi(finalData._id, idx, file)
                                .then(res => {
                                    if (res?.success && res?.data?.filename) {
                                        if (finalData.children && finalData.children[idx]) {
                                            finalData.children[idx].birthCertificateFile = res.data.filename;
                                        }
                                    }
                                })
                                .catch(err => console.error(`Error uploading birth cert for child ${idx}:`, err));
                        }
                        return Promise.resolve();
                    });
                    await Promise.all(uploadPromises);
                }
                
                // Re-hydrate department name if we only have ID
                if (typeof finalData.department === 'string') {
                    const deptObj = departments.find(d => d._id === finalData.department);
                    if (deptObj) finalData.department = deptObj;
                }

                setEmployee(finalData);
                setIsEditing(false);
                setEditedEmployee(null);
                showNotice('success', 'Employee updated successfully');
            } else {
                showNotice('error', response?.message || 'Failed to update employee');
            }
        } catch (error) {
            console.error('Update Error:', error);
            showNotice('error', error.message || 'An error occurred during update');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            const res = await toggleEmployeeStatusApi(employee._id);
            if (res?.success) {
                const updatedEmployee = { ...employee, isActive: res.data.isActive };
                setEmployee(updatedEmployee);
                setShowStatusModal(false);
                showNotice('success', `Employee ${updatedEmployee.isActive !== false ? 'enabled' : 'disabled'} successfully`);
            }
        } catch (error) {
            showNotice('error', error.message || 'Error toggling employee status');
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER HELPERS ---
    const getTabContent = () => {
        const data = isEditing ? editedEmployee : employee;
        if (!data) return null;

        switch (activeTab) {
            case 'general':
                return <GeneralTab data={data} isEditing={isEditing} onUpdate={handleUpdateField} errors={errors} />;
            case 'employment':
                return (
                    <EmploymentTab 
                        data={data} 
                        isEditing={isEditing} 
                        onUpdate={handleUpdateField} 
                        departments={departments} 
                        errors={errors} 
                        allowanceData={allowanceData}
                    />
                );
            case 'family':
                return (
                    <FamilyTab 
                        data={data} 
                        isEditing={isEditing} 
                        onUpdate={handleUpdateField} 
                        errors={errors}
                        onAddFamilyItem={handleAddFamilyItem}
                        onRemoveFamilyItem={handleRemoveFamilyItem}
                        onUpdateFamilyItem={handleUpdateFamilyItem}
                        employeeId={employee._id}
                        onBirthCertificateChange={(childIndex, filename) => {
                            setEmployee(prev => {
                                if (!prev) return prev;
                                const updatedChildren = [...(prev.children || [])];
                                if (updatedChildren[childIndex]) {
                                    updatedChildren[childIndex] = { ...updatedChildren[childIndex], birthCertificateFile: filename };
                                }
                                return { ...prev, children: updatedChildren };
                            });
                            setEditedEmployee(prev => {
                                if (!prev) return prev;
                                const updatedChildren = [...(prev.children || [])];
                                if (updatedChildren[childIndex]) {
                                    updatedChildren[childIndex] = { ...updatedChildren[childIndex], birthCertificateFile: filename };
                                }
                                return { ...prev, children: updatedChildren };
                            });
                        }}
                    />
                );
            default:
                return null;
        }
    };



    return (
        <>
            {/* Notifications */}
            {notification && createPortal(
                <div className={`fixed top-6 right-6 z-[10000] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in ${
                    notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-semibold text-sm">{notification.message}</span>
                </div>,
                document.body
            )}

            {/* List Summary Card */}
            <div
                className="premium-card premium-glass rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group"
                onClick={() => setShowDetailModal(true)}
            >
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 overflow-hidden group-hover:scale-105 transition-transform">
                                {employee.profilePicture && !employee.profilePicture.endsWith('/null') ? (
                                    <img src={employee.profilePicture} alt={employee.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-7 h-7 text-white" />
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full ${employee.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {employee.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                    <CreditCard className="w-3 h-3" /> {employee.epfNumber}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                    <Building2 className="w-3 h-3" /> {employee.department?.name || 'No Dept'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <div className="text-sm font-bold text-green-600">Rs. {employee.basicSalary?.toLocaleString()}</div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-gray-300 mt-0.5">{employee.employmentType}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay overflow-y-auto custom-scrollbar">
                    <div 
                        className="fixed inset-0" 
                        onClick={() => !isEditing && setShowDetailModal(false)}
                    />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in">
                        
                        {/* Modal Top Bar */}
                        <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-end">
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-end gap-6 translate-y-8">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-3xl bg-white p-1 shadow-xl">
                                        <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {employee.profilePicture && !employee.profilePicture.endsWith('/null') ? (
                                                <img src={employee.profilePicture} alt={employee.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mb-2">
                                    <h2 className="text-3xl font-black text-white drop-shadow-sm">{employee.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold backdrop-blur-md border border-white/10">
                                            {employee.epfNumber}
                                        </span>
                                        {employee.isActive !== false ? (
                                            <span className="px-3 py-1 bg-green-400 text-white text-xs font-bold rounded-full shadow-lg shadow-green-900/20">
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-400 text-white text-xs font-bold rounded-full shadow-lg shadow-gray-900/20">
                                                DISABLED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col mt-10 p-8 pt-6 overflow-hidden">
                            {/* Tabs Navigation */}
                            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-2xl mb-8 self-start">
                                {[
                                    { id: 'general', label: 'General', icon: Info },
                                    { id: 'employment', label: 'Employment', icon: Briefcase },
                                    { id: 'family', label: 'Family & Guardians', icon: Users }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            activeTab === tab.id 
                                                ? 'bg-white text-blue-600 shadow-sm' 
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {getTabContent()}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <button
                                onClick={() => setShowStatusModal(true)}
                                className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-2xl transition-all ${
                                    employee.isActive !== false 
                                        ? 'text-amber-600 hover:bg-amber-50' 
                                        : 'text-green-600 hover:bg-green-50'
                                }`}
                            >
                                {employee.isActive !== false ? (
                                    <>
                                        <UserX className="w-4 h-4" /> Disable Employee
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4" /> Enable Employee
                                    </>
                                )}
                            </button>
                            
                            <div className="flex items-center gap-3">
                                {!isEditing ? (
                                    <button
                                        onClick={handleToggleEdit}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleToggleEdit}
                                            className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-2xl transition-all"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Status Confirmation Modal */}
            {showStatusModal && createPortal(
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                            employee.isActive !== false ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                        }`}>
                            {employee.isActive !== false ? <UserX className="w-10 h-10" /> : <UserCheck className="w-10 h-10" />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            {employee.isActive !== false ? 'Disable Employee?' : 'Enable Employee?'}
                        </h3>
                        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                            {employee.isActive !== false
                                ? `Are you sure you want to disable ${employee.name}? They will no longer be active in the system and their matching admin account will be deactivated.`
                                : `Are you sure you want to enable ${employee.name}? Their status will be set to active.`
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                className={`flex-1 px-6 py-3 text-white font-bold rounded-2xl shadow-lg transition-all ${
                                    employee.isActive !== false
                                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                                        : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                }`}
                            >
                                {employee.isActive !== false ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default EmployeeWFullCard;