import React, { useState, useEffect, useRef } from 'react';
import { Shield, Save, ArrowLeft, AlertCircle, CheckCircle, X, Mail, Badge, Search, User, Calendar } from 'lucide-react';
import { addAdmin } from '../apis/admin.api';
import { getEmployeesApi } from '../apis/employee.api';

const AddAdminForm = ({ onBack }) => {
    const [formData, setFormData] = useState({
        email: '',
        epfNo: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Employee search states
    const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchingEmployees, setSearchingEmployees] = useState(false);
    const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);

    // Refs
    const epfInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                epfInputRef.current && !epfInputRef.current.contains(event.target)) {
                setShowEmployeeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search employees by EPF number
    const searchEmployees = async (epfQuery) => {
        if (epfQuery.length < 1) {
            setEmployeeSearchResults([]);
            setShowEmployeeDropdown(false);
            return;
        }

        setSearchingEmployees(true);
        try {
            const response = await getEmployeesApi({ epfNumber: epfQuery });


            setEmployeeSearchResults(response.data || []);
            setShowEmployeeDropdown(true);
        } catch (error) {
            console.error('Error searching employees:', error);
            setEmployeeSearchResults([]);
            setShowEmployeeDropdown(false);
        } finally {
            setSearchingEmployees(false);
        }
    };

    // Debounced search function
    const debouncedSearch = (epfQuery) => {
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        const timer = setTimeout(() => {
            searchEmployees(epfQuery);
        }, 300);

        setSearchDebounceTimer(timer);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'epfNo') {
            // Clear selected employee when typing
            if (selectedEmployee && value !== selectedEmployee.epfNumber) {
                setSelectedEmployee(null);
                setFormData(prev => ({ ...prev, email: '' }));
            }

            // Real-time validation for EPF number
            // Only allow digits, no letters, special characters, or decimals
            const numericValue = value.replace(/[^0-9]/g, '');

            // Limit to 4 digits
            const limitedValue = numericValue.slice(0, 4);

            setFormData(prev => ({
                ...prev,
                [name]: limitedValue
            }));

            // Real-time error checking for EPF
            let epfError = '';
            if (limitedValue.length === 0) {
                epfError = 'EPF number is required';
            } else if (limitedValue.length < 4) {
                epfError = `EPF number must be exactly 4 digits (${limitedValue.length}/4)`;
            }

            setErrors(prev => ({
                ...prev,
                epfNo: epfError
            }));

            // Search for employees
            if (limitedValue.length > 0) {
                debouncedSearch(limitedValue);
            } else {
                setEmployeeSearchResults([]);
                setShowEmployeeDropdown(false);
            }
        } else if (name === 'email') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            // Real-time email validation
            let emailError = '';
            if (value.trim().length === 0) {
                emailError = 'Email address is required';
            } else if (!validateEmail(value.trim())) {
                emailError = 'Please enter a valid email address';
            }

            setErrors(prev => ({
                ...prev,
                email: emailError
            }));
        } else if (name === 'password') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            let passwordError = '';
            if (value.trim().length === 0) {
                passwordError = 'Password is required';
            } else if (value.length < 8) {
                passwordError = 'Password must be at least 8 characters long';
            }

            setErrors(prev => ({
                ...prev,
                password: passwordError
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle employee selection from dropdown
    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            epfNo: employee.epfNumber,
            email: employee.email || '',
            password: formData.password
        });
        setShowEmployeeDropdown(false);

        // Clear errors since we have valid data
        setErrors({});

        // Validate email if it exists
        if (employee.email) {
            if (!validateEmail(employee.email)) {
                setErrors(prev => ({
                    ...prev,
                    email: 'Employee email is not valid. Please enter a valid email address.'
                }));
            }
        } else {
            setErrors(prev => ({
                ...prev,
                email: 'Employee has no email address. Please enter a valid email address.'
            }));
        }
    };

    const handleEPFKeyDown = (e) => {
        // Handle arrow keys for dropdown navigation
        if (showEmployeeDropdown && employeeSearchResults.length > 0) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (employeeSearchResults.length > 0) {
                    handleEmployeeSelect(employeeSearchResults[0]);
                }
                return;
            }
            if (e.key === 'Escape') {
                setShowEmployeeDropdown(false);
                return;
            }
        }

        // Prevent typing non-numeric characters
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];

        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        if (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
            return;
        }

        // Allow numbers (0-9)
        if (e.key >= '0' && e.key <= '9') {
            // Check if adding this digit would exceed 4 digits
            if (formData.epfNo.length >= 4) {
                e.preventDefault();
            }
            return;
        }

        // Block everything else except allowed keys
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleEPFPaste = (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');

        // Extract only digits from pasted text
        const numericValue = pastedText.replace(/[^0-9]/g, '');

        // Limit to 4 digits
        const limitedValue = numericValue.slice(0, 4);

        setFormData(prev => ({
            ...prev,
            epfNo: limitedValue
        }));

        // Update error state
        let epfError = '';
        if (limitedValue.length === 0) {
            epfError = 'EPF number is required';
        } else if (limitedValue.length < 4) {
            epfError = `EPF number must be exactly 4 digits (${limitedValue.length}/4)`;
        }

        setErrors(prev => ({
            ...prev,
            epfNo: epfError
        }));

        // Search for employees
        if (limitedValue.length > 0) {
            debouncedSearch(limitedValue);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!validateEmail(formData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.epfNo.trim()) {
            newErrors.epfNo = 'EPF number is required';
        } else if (formData.epfNo.length !== 4) {
            newErrors.epfNo = 'EPF number must be exactly 4 digits';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 8000);
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        // Check if form is valid before showing modal
        if (!isFormValid) {
            console.log('Form is not valid, validating...');
            validateForm();
            return;
        }

        console.log('Showing confirmation modal');
        // Show confirmation modal instead of directly submitting
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        try {
            console.log({
                email: formData.email.trim().toLowerCase(),
                epfNo: parseInt(formData.epfNo)
            });

            const dataToSub = {
                email: formData.email.trim().toLowerCase(),
                epfNo: parseInt(formData.epfNo),
                password: formData.password
            }

            const result = await addAdmin(dataToSub);

            // Success case
            showNotification('success', `HR Officer account created successfully for ${formData.email.trim()}.`);

            // Reset form
            setFormData({ email: '', epfNo: '', password: '' });
            setSelectedEmployee(null);
            setErrors({});
        } catch (error) {
            console.error('Error creating admin account:', error);
            console.error('Error type:', typeof error);
            console.error('Error keys:', error ? Object.keys(error) : 'null');
            
            // Extract meaningful error message from various error formats
            let errorMessage = 'Failed to create admin account. Please try again.';
            
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error) {
                errorMessage = error.error;
            }
            
            if (error?.errors) {
                setErrors(error.errors);
            }
            
            showNotification('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({ email: '', epfNo: '', password: '' });
        setSelectedEmployee(null);
        setEmployeeSearchResults([]);
        setShowEmployeeDropdown(false);
        setErrors({});
        setNotification(null);
        setShowConfirmModal(false);
    };

    // Check if form is valid for submit button
    const isFormValid = formData.email.trim() &&
        formData.epfNo.length === 4 &&
        formData.password &&
        formData.password.length >= 8 &&
        validateEmail(formData.email.trim()) &&
        !errors.email &&
        !errors.epfNo &&
        !errors.password;

    // Modal backdrop component
    const ModalBackdrop = ({ children, show, onClose }) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div
                    className="absolute inset-0"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto z-10">
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className="w-full mx-auto px-4">
                {/* Notification - Fixed position toast */}
                {notification && (
                    <div className={`fixed top-6 right-6 z-[100] max-w-md p-4 rounded-lg border shadow-lg flex items-start space-x-3 animate-fadeIn ${notification.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1">{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Selected Employee Info */}
                {selectedEmployee && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 mb-2">Employee Found</p>
                                <div className="text-sm text-green-700 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4" />
                                        <span><strong>Name:</strong> {selectedEmployee.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge className="w-4 h-4" />
                                        <span><strong>EPF:</strong> {selectedEmployee.epfNumber}</span>
                                    </div>
                                    {selectedEmployee.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span><strong>Email:</strong> {selectedEmployee.email}</span>
                                        </div>
                                    )}
                                    {selectedEmployee.department && (
                                        <div className="flex items-center space-x-2">
                                            <Shield className="w-4 h-4" />
                                            <span><strong>Department:</strong> {selectedEmployee.department.name || 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-gray-100 rounded-t-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Provision HR Officer</h2>
                                <p className="text-sm text-gray-600">Elevate an employee to HR Officer role</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* EPF Number with Search */}
                        <div className="relative">
                            <label htmlFor="epfNo" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center space-x-2">
                                    <Badge className="w-4 h-4 text-gray-500" />
                                    <span>EPF Number <span className="text-red-500">*</span></span>
                                    <span className="text-xs text-gray-500">(Search for existing employee)</span>
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    ref={epfInputRef}
                                    type="text"
                                    id="epfNo"
                                    name="epfNo"
                                    value={formData.epfNo}
                                    onChange={handleInputChange}
                                    onKeyDown={handleEPFKeyDown}
                                    onPaste={handleEPFPaste}
                                    onFocus={() => {
                                        if (employeeSearchResults.length > 0) {
                                            setShowEmployeeDropdown(true);
                                        }
                                    }}
                                    className={`w-full px-4 py-3 pr-20 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${errors.epfNo
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : formData.epfNo.length === 4
                                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                                        }`}
                                    placeholder="Enter 4-digit EPF number (e.g., 1234)"
                                    maxLength="4"
                                    disabled={loading}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                                    {searchingEmployees && (
                                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${formData.epfNo.length === 4
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {formData.epfNo.length}/4
                                    </span>
                                </div>
                            </div>

                            {/* Employee Search Dropdown */}
                            {showEmployeeDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {employeeSearchResults.length > 0 ? (
                                        employeeSearchResults.map((employee) => (
                                            <div
                                                key={employee._id}
                                                onClick={() => handleEmployeeSelect(employee)}
                                                className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <User className="w-4 h-4 text-gray-500" />
                                                            <span className="font-medium text-gray-900">{employee.name}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div className="flex items-center space-x-2">
                                                                <Badge className="w-3 h-3 text-gray-400" />
                                                                <span>EPF: {employee.epfNumber}</span>
                                                            </div>
                                                            {employee.email && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                                    <span>{employee.email}</span>
                                                                </div>
                                                            )}
                                                            {employee.department && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Shield className="w-3 h-3 text-gray-400" />
                                                                    <span>{employee.department.name || 'N/A'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            {searchingEmployees ? 'Searching...' : 'No employees found with this EPF number'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {errors.epfNo && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.epfNo}</span>
                                </p>
                            )}
                            {!errors.epfNo && formData.epfNo.length === 4 && (
                                <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>EPF number format is valid</span>
                                </p>
                            )}
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span>Email Address <span className="text-red-500">*</span></span>
                                    {selectedEmployee && selectedEmployee.email && (
                                        <span className="text-xs text-green-600">(Auto-filled from employee record)</span>
                                    )}
                                </div>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${errors.email
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                                    }`}
                                placeholder="Enter admin email address (e.g., admin@company.com)"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    <span>Password <span className="text-red-500">*</span></span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${errors.password
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                                    }`}
                                placeholder="Enter admin password (min 8 characters)"
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Password Info */}
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-teal-800">
                                    <p className="font-medium mb-1">Password Policy:</p>
                                    <p className="text-teal-700">
                                        Please create a secure password (at least 8 characters) for the new HR Officer. Share this password with them securely. No automated email will be sent.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                                disabled={loading}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !isFormValid}
                                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Provisioning...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Provision HR Officer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                <ModalBackdrop show={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Confirm HR Officer Provisioning</h2>
                                    <p className="text-sm text-gray-500 mt-1">Review details before confirming</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-600 mb-6">
                                Please verify the admin account details before creating:
                            </p>

                            {/* Selected Employee Info in Modal */}
                            {selectedEmployee && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start space-x-3">
                                        <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-800 mb-2">Employee Details</p>
                                            <div className="text-sm text-blue-700 space-y-1">
                                                <p><strong>Name:</strong> {selectedEmployee.name}</p>
                                                {selectedEmployee.department && (
                                                    <p><strong>Department:</strong> {selectedEmployee.department.name || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                                <div className="flex items-start space-x-4">
                                    <Badge className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">EPF Number</p>
                                        <p className="text-purple-900 font-semibold text-base">{formData.epfNo}</p>
                                    </div>
                                </div>

                                <div className="border-t border-purple-200 pt-4">
                                    <div className="flex items-start space-x-4">
                                        <Mail className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">Email Address</p>
                                            <p className="text-purple-900 font-semibold text-base break-all">{formData.email.trim()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-purple-200 pt-4">
                                    <div className="flex items-start space-x-4">
                                        <Shield className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">Password</p>
                                            <p className="text-purple-900 font-semibold text-base break-all">{formData.password}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-teal-800 leading-relaxed">
                                            Please share the configured password securely with <strong>{formData.email.trim()}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 order-2 sm:order-1"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 order-1 sm:order-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Provisioning...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        <span>Confirm & Provision</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalBackdrop>

                {/* Help Text */}
                <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-teal-800">
                            <p className="font-medium mb-2">Guidelines for provisioning HR Officer accounts:</p>
                            <ul className="list-disc list-inside space-y-1 text-teal-700">
                                <li>Search for an existing employee by entering their EPF number</li>
                                <li>Email addresses must be unique and valid business email addresses</li>
                                <li>EPF numbers must be exactly 4 digits (0000-9999)</li>
                                <li>Configure a secure password (at least 8 characters) during registration</li>
                                <li>HR Officers will receive full dashboard access immediately</li>
                                <li>You can reset their password anytime from the System Access panel</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Employee Search Info */}
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <Search className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                            <p className="font-medium mb-1">Employee Search:</p>
                            <p className="text-green-700">
                                When you enter an EPF number, the system will automatically search for existing employees.
                                If found, their information will be used to pre-fill the admin account details.
                                This ensures consistency and reduces data entry errors.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Notification Info */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Password Handling:</p>
                            <p className="text-amber-700">
                                No email is sent automatically with the password. Please copy the password you set and securely deliver it to the HR Officer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAdminForm;