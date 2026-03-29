import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Edit3,
    Trash2,
    X,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Building2,
    CreditCard,
    Heart,
    Baby,
    CheckCircle,
    UserCheck,
    Briefcase,
    AlertTriangle
} from 'lucide-react';
import { deleteEmployeeApi } from '../apis/employee.api';
import { createPortal } from 'react-dom';

/**
 * EmployeeWFullCard - A summary card and detailed modal for employee records.
 * Now navigation-based: "Edit" actions navigate to the dedicated edit page.
 */
const EmployeeWFullCard = ({ initialEmployee, readOnly }) => {
    const navigate = useNavigate();
    const [employee] = useState(initialEmployee);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    const handleEditClick = (e) => {
        if (e) e.stopPropagation();
        // Close modal if open before navigating
        setShowDetailModal(false);
        navigate(`/employees/${employee._id}`);
    };

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            const res = await deleteEmployeeApi(employee._id);
            setIsDeleted(true);
            setShowDeleteModal(false);
            if (res?.success === true) {
                showSuccess('Employee deleted successfully');
                // Reload list to reflect changes
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Modal backdrop component using Portal for layout stability
    const ModalBackdrop = ({ children, show, onClose }) => {
        if (!show) return null;

        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
                <div
                    className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
                    {children}
                </div>
            </div>,
            document.body
        );
    };

    // Notification toast
    const SuccessNotification = () => {
        if (!showSuccessMessage) return null;

        return (
            <div className="fixed top-4 right-4 z-[10000] bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fadeIn">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{successMessage}</span>
            </div>
        );
    };

    if (isDeleted) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center animate-fadeIn">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Employee Deleted</h3>
                <p className="text-red-700">The record has been removed.</p>
            </div>
        );
    }

    return (
        <>
            {/* Main Employee Card (Summary View) */}
            <div
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
                onClick={() => setShowDetailModal(true)}
            >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                            {employee.profilePicture && !employee.profilePicture.endsWith('/null') ? (
                                <img
                                    src={employee.profilePicture}
                                    alt={employee.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-7 h-7 text-gray-300" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {employee.name}
                            </h3>
                            <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
                                <span className="flex items-center space-x-1">
                                    <Building2 className="w-3 h-3" />
                                    <span>{employee.department?.name || 'No Dept'}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <CreditCard className="w-3 h-3" />
                                    <span>EPF: {employee.epfNumber}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 grid grid-cols-2 gap-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[120px]">{employee.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{employee.contactNumber}</span>
                    </div>
                </div>

                {!readOnly && (
                    <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-all duration-200"
                            title="Edit Record"
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all duration-200"
                            title="Delete Record"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Detailed View Modal */}
            <ModalBackdrop show={showDetailModal} onClose={() => setShowDetailModal(false)}>
                <div className="p-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative">
                        <button 
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
                            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl">
                                {employee.profilePicture && !employee.profilePicture.endsWith('/null') ? (
                                    <img src={employee.profilePicture} alt={employee.name} className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-extrabold">{employee.name}</h2>
                                <p className="text-blue-100 flex items-center justify-center md:justify-start mt-1">
                                    <Building2 className="w-4 h-4 mr-1" />
                                    {employee.department?.name || 'Department Not Set'}
                                </p>
                            </div>
                            <div className="md:flex-grow"></div>
                            {!readOnly && (
                                <button 
                                    onClick={handleEditClick}
                                    className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center"
                                >
                                    <Edit3 className="w-5 h-5 mr-2" />
                                    Edit Employee
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Section: Personal */}
                        <div>
                            <SectionHeader icon={UserCheck} title="Personal Details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                <LabelValue label="Full Name" value={employee.name} />
                                <LabelValue label="Email Address" value={employee.email} />
                                <LabelValue label="Contact Number" value={employee.contactNumber} />
                                <LabelValue label="NIC Number" value={employee.nicNumber} />
                                <LabelValue label="Gender" value={employee.gender} />
                                <LabelValue label="Date of Birth" value={`${formatDate(employee.dateOfBirth)} (${calculateAge(employee.dateOfBirth)} yrs)`} />
                                <LabelValue label="Home Address" value={employee.address} fullWidth />
                            </div>
                        </div>

                        {/* Section: Employment */}
                        <div className="pt-6 border-t border-gray-100">
                            <SectionHeader icon={Briefcase} title="Employment Information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                <LabelValue label="EPF Number" value={employee.epfNumber} isBold />
                                <LabelValue label="Employment Type" value={employee.employmentType} />
                                <LabelValue label="Joined Date" value={formatDate(employee.joinedDate)} />
                                <LabelValue label="Main Location" value={employee.mainLocation} />
                                <LabelValue label="Basic Salary" value={`Rs. ${employee.basicSalary?.toLocaleString()}`} isSuccess />
                            </div>
                        </div>

                        {/* Section: Family */}
                        <div className="pt-6 border-t border-gray-100">
                            <SectionHeader icon={Heart} title="Family Details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <LabelValue label="Marital Status" value={employee.maritalStatus} />
                                {employee.maritalStatus === 'Married' && <LabelValue label="Spouse Name" value={employee.spouseName} />}
                            </div>
                            
                            {employee.children?.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Children</h4>
                                    <div className="space-y-2">
                                        {employee.children.map((child, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                <span className="font-semibold text-gray-700">{child.name}</span>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {child.gender} • {calculateAge(child.dateOfBirth)} yrs
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ModalBackdrop>

            {/* Delete Confirmation Modal */}
            <ModalBackdrop show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
                    <p className="text-gray-600 mb-8 font-medium">
                        Are you sure you want to delete <span className="font-extrabold text-red-600">{employee.name}</span>?<br />
                        This will permanently remove the record from the system.
                    </p>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                        >
                            No, Keep it
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Yes, Delete Information'}
                        </button>
                    </div>
                </div>
            </ModalBackdrop>

            <SuccessNotification />
        </>
    );
};

// UI Components for Modal details
const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 text-blue-600">
        <Icon className="w-5 h-5" />
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
    </div>
);

const LabelValue = ({ label, value, fullWidth, isBold, isSuccess }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">{label}</span>
        <p className={`
            ${isBold ? 'text-lg font-bold text-gray-900' : 'text-gray-700 font-medium'}
            ${isSuccess ? 'text-green-600 font-bold' : ''}
        `}>
            {value || 'Not Disclosed'}
        </p>
    </div>
);

export default EmployeeWFullCard;