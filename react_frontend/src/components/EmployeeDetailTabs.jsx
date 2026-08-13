import React, { useState } from 'react';
import { 
    User, Mail, Phone, MapPin, CreditCard, Building2, 
    Calendar, Heart, Briefcase, UserCheck, Plus, Trash2,
    Baby, Users, AlertCircle, Info, DollarSign, Activity,
    FileText, Upload, ExternalLink, Loader2
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { uploadBirthCertificateApi, deleteBirthCertificateApi } from '../apis/employee.api';

// Reusable Input Component for consistency
const FormField = ({ label, icon: Icon, error, children, required }) => (
    <div className="space-y-1.5 animate-in">
        {label && (
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                {Icon && <Icon className="w-4 h-4 text-blue-500" />}
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <div className="relative">
            {children}
        </div>
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {error}
            </p>
        )}
    </div>
);

// --- TAB: GENERAL ---
export const GeneralTab = ({ data, isEditing, onUpdate, errors }) => {
    if (!isEditing) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <InfoCard label="Full Name" value={data.name} icon={User} />
                <InfoCard label="Email Address" value={data.email || 'N/A'} icon={Mail} />
                <InfoCard label="Contact Number" value={data.contactNumber} icon={Phone} />
                <InfoCard label="NIC Number" value={data.nicNumber || 'N/A'} icon={CreditCard} />
                <InfoCard label="Date of Birth" value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A'} icon={Calendar} />
                <InfoCard label="Gender" value={data.gender || 'N/A'} icon={UserCheck} />
                <InfoCard label="Marital Status" value={data.maritalStatus || 'N/A'} icon={Heart} />
                <div className="md:col-span-2">
                    <InfoCard label="Address" value={data.address || 'N/A'} icon={MapPin} />
                </div>
                <div className="md:col-span-2">
                    <InfoCard label="Medical History" value={data.medicalRecords || 'No records found'} icon={Activity} />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <FormField label="Full Name" icon={User} error={errors.name} required>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => onUpdate('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
            <FormField label="Email Address" icon={Mail} error={errors.email}>
                <input
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => onUpdate('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
            <FormField label="Contact Number" icon={Phone} error={errors.contactNumber} required>
                <PhoneInput
                    country={'lk'}
                    value={data.contactNumber}
                    onChange={(val) => onUpdate('contactNumber', val)}
                    containerClass="premium-phone-input"
                    inputClass="!w-full !px-12 !py-2.5 !h-auto !rounded-xl !border-gray-200 !text-sm"
                    buttonClass="!border-gray-200 !rounded-l-xl"
                />
            </FormField>
            <FormField label="NIC Number" icon={CreditCard} error={errors.nicNumber}>
                <input
                    type="text"
                    value={data.nicNumber || ''}
                    onChange={(e) => onUpdate('nicNumber', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
            <FormField label="Date of Birth" icon={Calendar} error={errors.dateOfBirth} required>
                <input
                    type="date"
                    value={data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''}
                    onChange={(e) => onUpdate('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
            <FormField label="Gender" icon={UserCheck} required>
                <select
                    value={data.gender}
                    onChange={(e) => onUpdate('gender', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </FormField>
            <div className="md:col-span-2">
                <FormField label="Address" icon={MapPin}>
                    <textarea
                        value={data.address || ''}
                        onChange={(e) => onUpdate('address', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input resize-none"
                    />
                </FormField>
            </div>
            <div className="md:col-span-2">
                <FormField label="Medical History" icon={Activity}>
                    <textarea
                        value={data.medicalRecords || ''}
                        onChange={(e) => onUpdate('medicalRecords', e.target.value)}
                        rows={3}
                        placeholder="Enter any medical conditions, allergies, or emergency medical info..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input resize-none"
                    />
                </FormField>
            </div>
        </div>
    );
};

// --- TAB: EMPLOYMENT ---
export const EmploymentTab = ({ data, isEditing, onUpdate, departments, errors, allowanceData }) => {
    if (!isEditing) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <InfoCard label="EPF Number" value={data.epfNumber} icon={CreditCard} />
                <InfoCard label="Department" value={data.department?.name || 'N/A'} icon={Building2} />
                <InfoCard label="Main Location" value={data.mainLocation || 'N/A'} icon={MapPin} />
                <InfoCard label="Joined Date" value={new Date(data.joinedDate).toLocaleDateString()} icon={Calendar} />
                <InfoCard label="Employment Type" value={data.employmentType} icon={Briefcase} />
                <InfoCard 
                    label="Basic Salary" 
                    value={`Rs. ${data.basicSalary?.toLocaleString()}`} 
                    icon={DollarSign}
                    valueColor="text-green-600 font-bold"
                />
                
                {/* Medical Allowance Summary */}
                <div className="md:col-span-2 mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Heart className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Medical Allowance</p>
                            <p className="text-sm font-bold text-gray-900">
                                {allowanceData?.spent ? `Rs. ${allowanceData.spent.toLocaleString()}` : 'Rs. 0'} 
                                <span className="text-gray-400 font-medium"> / Rs. {allowanceData?.total?.toLocaleString() || '15,000'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Balance</p>
                        <p className={`text-sm font-black ${ (allowanceData?.total - allowanceData?.spent) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Rs. {(allowanceData?.total - allowanceData?.spent)?.toLocaleString() || '0'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <FormField label="EPF Number" icon={CreditCard} error={errors.epfNumber} required>
                <input
                    type="text"
                    value={data.epfNumber}
                    onChange={(e) => onUpdate('epfNumber', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
            <FormField label="Department" icon={Building2} error={errors.department} required>
                <select
                    value={data.department?._id || data.department || ''}
                    onChange={(e) => onUpdate('department', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                </select>
            </FormField>
            <FormField label="Main Location" icon={MapPin}>
                <select
                    value={data.mainLocation || ''}
                    onChange={(e) => onUpdate('mainLocation', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                >
                    <option value="">Select Location</option>
                    <option value="Head Office">Head Office</option>
                    <option value="Regional Sales">Regional Sales</option>
                    <option value="Regional Stores">Regional Stores</option>
                    <option value="ROS">ROS</option>
                </select>
            </FormField>
            <FormField label="Joined Date" icon={Calendar} required>
                <input
                    type="date"
                    value={data.joinedDate ? data.joinedDate.split('T')[0] : ''}
                    onChange={(e) => onUpdate('joinedDate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
            <FormField label="Employment Type" icon={Briefcase}>
                <select
                    value={data.employmentType}
                    onChange={(e) => onUpdate('employmentType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                </select>
            </FormField>
            <FormField label="Basic Salary (LKR)" icon={DollarSign}>
                <input
                    type="number"
                    value={data.basicSalary || 0}
                    onChange={(e) => onUpdate('basicSalary', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all premium-input"
                />
            </FormField>
        </div>
    );
};

// --- TAB: FAMILY ---
export const FamilyTab = ({ data, isEditing, onUpdate, errors, onAddFamilyItem, onRemoveFamilyItem, onUpdateFamilyItem, employeeId, onBirthCertificateChange }) => {
    const [certUploading, setCertUploading] = useState({});
    const [certError, setCertError] = useState({});

    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const handleCertUpload = async (childIndex, file) => {
        if (!file) return;
        setCertError(prev => ({ ...prev, [childIndex]: null }));

        // Store file locally as pending cert file for this child
        if (onUpdateFamilyItem) {
            onUpdateFamilyItem('children', childIndex, 'pendingCertFile', file);
        }

        // If employee exists and child is already in DB, try uploading immediately
        if (employeeId) {
            setCertUploading(prev => ({ ...prev, [childIndex]: true }));
            try {
                const res = await uploadBirthCertificateApi(employeeId, childIndex, file);
                if (res?.success && onBirthCertificateChange) {
                    onBirthCertificateChange(childIndex, res.data.filename);
                    if (onUpdateFamilyItem) {
                        onUpdateFamilyItem('children', childIndex, 'pendingCertFile', null);
                    }
                }
            } catch (err) {
                // If immediate upload fails (e.g. new child not in DB yet), keep file in pendingCertFile for upload on Save
                console.log('Immediate upload pending save:', err?.message);
            } finally {
                setCertUploading(prev => ({ ...prev, [childIndex]: false }));
            }
        }
    };

    const handleCertDelete = async (childIndex) => {
        setCertError(prev => ({ ...prev, [childIndex]: null }));

        // Clear any pending cert file
        if (onUpdateFamilyItem) {
            onUpdateFamilyItem('children', childIndex, 'pendingCertFile', null);
        }

        if (!employeeId) {
            if (onBirthCertificateChange) onBirthCertificateChange(childIndex, '');
            return;
        }

        setCertUploading(prev => ({ ...prev, [childIndex]: true }));
        try {
            const res = await deleteBirthCertificateApi(employeeId, childIndex);
            if (res?.success && onBirthCertificateChange) {
                onBirthCertificateChange(childIndex, '');
            }
        } catch (err) {
            setCertError(prev => ({ ...prev, [childIndex]: err?.message || 'Delete failed' }));
        } finally {
            setCertUploading(prev => ({ ...prev, [childIndex]: false }));
        }
    };

    // ── Read-only view ────────────────────────────────────────────────────────
    if (!isEditing) {
        return (
            <div className="space-y-8 animate-in">

                {/* Marital Status Card */}
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Heart className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-900">Marital Information</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                data.maritalStatus === 'Married' ? 'bg-pink-100 text-pink-700'
                                : data.maritalStatus === 'Divorced' ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>{data.maritalStatus || 'N/A'}</span>
                        </div>
                        {data.spouseName && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Spouse</span>
                                <span className="text-sm font-semibold text-gray-800">{data.spouseName}</span>
                                {data.spouseStatus && (
                                    <Chip color={data.spouseStatus === 'Deceased' ? 'red' : 'green'}>
                                        {data.spouseStatus}
                                    </Chip>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Parents Section */}
                <FamilyReadOnlySection
                    title="Parents & Guardians"
                    icon={Users}
                    items={data.parents || []}
                    renderItem={(item) => (
                        <>
                            <p className="font-bold text-gray-900 text-sm">{item.name || 'N/A'}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {item.relationship && <Chip color="blue">{item.relationship}</Chip>}
                                {item.status && <Chip color={item.status === 'Deceased' ? 'red' : 'green'}>{item.status}</Chip>}
                                {item.contactNumber && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />{item.contactNumber}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                />

                {/* Spouse's Parents Section */}
                {(data.spouseParents?.length > 0) && (
                    <FamilyReadOnlySection
                        title="Spouse's Parents & Guardians"
                        icon={Users}
                        items={data.spouseParents || []}
                        renderItem={(item) => (
                            <>
                                <p className="font-bold text-gray-900 text-sm">{item.name || 'N/A'}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {item.relationship && <Chip color="violet">{item.relationship}</Chip>}
                                    {item.status && <Chip color={item.status === 'Deceased' ? 'red' : 'green'}>{item.status}</Chip>}
                                    {item.contactNumber && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Phone className="w-3 h-3" />{item.contactNumber}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    />
                )}

                {/* Children Section */}
                <FamilyReadOnlySection
                    title="Children"
                    icon={Baby}
                    items={data.children || []}
                    renderItem={(item, index) => (
                        <>
                            <p className="font-bold text-gray-900 text-sm">{item.name || 'N/A'}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {item.gender && <Chip color="blue">{item.gender}</Chip>}
                                {item.status && <Chip color={item.status === 'Deceased' ? 'red' : 'green'}>{item.status}</Chip>}
                                {item.dateOfBirth && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />{new Date(item.dateOfBirth).toLocaleDateString()}
                                    </span>
                                )}
                                {item.school && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Building2 className="w-3 h-3" />{item.school}{item.grade ? ` (Grade ${item.grade})` : ''}
                                    </span>
                                )}
                            </div>
                            {/* Birth Certificate link */}
                            {item.birthCertificateFile ? (
                                <a
                                    href={`${baseUrl}/prop/${item.birthCertificateFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                                >
                                    <FileText className="w-3 h-3" />
                                    View Birth Certificate
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400 italic">
                                    <FileText className="w-3 h-3" /> No birth certificate uploaded
                                </span>
                            )}
                        </>
                    )}
                />
            </div>
        );
    }

    // ── Edit mode ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in">
            {/* Marital Status Wrapper */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-gray-800">Marital Status</span>
                    </div>
                    <select
                        value={data.maritalStatus || 'Unmarried'}
                        onChange={(e) => onUpdate('maritalStatus', e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    >
                        <option value="Unmarried">Unmarried</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                    </select>
                </div>
                {data.maritalStatus === 'Married' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60 animate-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Spouse Name" icon={User} error={errors.spouseName} required>
                                <input
                                    type="text"
                                    value={data.spouseName || ''}
                                    onChange={(e) => onUpdate('spouseName', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                    placeholder="Enter spouse full name"
                                />
                            </FormField>
                            <FormField label="Spouse Status" icon={Activity}>
                                <select
                                    value={data.spouseStatus || 'Alive'}
                                    onChange={(e) => onUpdate('spouseStatus', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                >
                                    <option value="Alive">Alive</option>
                                    <option value="Deceased">Deceased</option>
                                </select>
                            </FormField>
                        </div>
                    </div>
                )}
            </div>

            {/* Parents Section */}
            <FamilyCollection 
                title="Parents & Guardians" 
                icon={Users}
                items={data.parents || []}
                itemLabel="Parent/Guardian"
                isEditing={isEditing}
                onAdd={() => onAddFamilyItem('parents', { name: '', relationship: 'Father', contactNumber: '', status: 'Alive' })}
                onRemove={(index) => onRemoveFamilyItem('parents', index)}
                onUpdate={(index, field, value) => onUpdateFamilyItem('parents', index, field, value)}
                fields={[
                    { name: 'name', placeholder: 'Full Name', type: 'text', icon: User },
                    { 
                        name: 'relationship', 
                        type: 'select', 
                        options: ['Father', 'Mother', 'Guardian'], 
                        icon: UserCheck 
                    },
                    { name: 'contactNumber', placeholder: 'Phone', type: 'phone', icon: Phone },
                    {
                        name: 'status',
                        placeholder: 'Status',
                        type: 'select',
                        options: ['Alive', 'Deceased'],
                        icon: Activity
                    }
                ]}
            />

            {/* Spouse Parents Section */}
            <FamilyCollection 
                title="Spouse's Parents & Guardians" 
                icon={Users}
                items={data.spouseParents || []}
                itemLabel="Spouse Parent/Guardian"
                isEditing={isEditing}
                onAdd={() => onAddFamilyItem('spouseParents', { name: '', relationship: 'Father', contactNumber: '', status: 'Alive' })}
                onRemove={(index) => onRemoveFamilyItem('spouseParents', index)}
                onUpdate={(index, field, value) => onUpdateFamilyItem('spouseParents', index, field, value)}
                fields={[
                    { name: 'name', placeholder: 'Full Name', type: 'text', icon: User },
                    { 
                        name: 'relationship', 
                        type: 'select', 
                        options: ['Father', 'Mother', 'Father-in-law', 'Mother-in-law', 'Guardian'], 
                        icon: UserCheck 
                    },
                    { name: 'contactNumber', placeholder: 'Phone', type: 'phone', icon: Phone },
                    {
                        name: 'status',
                        placeholder: 'Status',
                        type: 'select',
                        options: ['Alive', 'Deceased'],
                        icon: Activity
                    }
                ]}
            />

            {/* Children Section */}
            <FamilyCollection 
                title="Children" 
                icon={Baby}
                items={data.children || []}
                itemLabel="Child"
                isEditing={isEditing}
                onAdd={() => onAddFamilyItem('children', { name: '', dateOfBirth: '', gender: '', school: '', grade: '', status: 'Alive', birthCertificateFile: '' })}
                onRemove={(index) => onRemoveFamilyItem('children', index)}
                onUpdate={(index, field, value) => onUpdateFamilyItem('children', index, field, value)}
                fields={[
                    { name: 'name', placeholder: 'Name', type: 'text', icon: User },
                    { name: 'dateOfBirth', placeholder: 'DOB', type: 'date', icon: Calendar },
                    { 
                        name: 'gender', 
                        type: 'select', 
                        options: ['Male', 'Female', 'Other'], 
                        icon: UserCheck 
                    },
                    { name: 'school', placeholder: 'School', type: 'text', icon: Building2 },
                    { name: 'grade', placeholder: 'Grade', type: 'text', icon: Info },
                    {
                        name: 'status',
                        placeholder: 'Status',
                        type: 'select',
                        options: ['Alive', 'Deceased'],
                        icon: Activity
                    }
                ]}
                renderExtraPerItem={(item, index) => (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-2">
                            <FileText className="w-3.5 h-3.5" />
                            Birth Certificate (PDF)
                        </div>
                        {item.birthCertificateFile ? (
                            <div className="flex items-center gap-2 flex-wrap">
                                <a
                                    href={`${baseUrl}/prop/${item.birthCertificateFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                                >
                                    <FileText className="w-3 h-3" /> View Certificate
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                {isEditing && (
                                    <button
                                        onClick={() => handleCertDelete(index)}
                                        disabled={certUploading[index]}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        {certUploading[index] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        Delete
                                    </button>
                                )}
                            </div>
                        ) : isEditing ? (
                            <div>
                                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-dashed border-gray-300 text-gray-500 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors">
                                    {certUploading[index] ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload className="w-3.5 h-3.5" /> Upload PDF</>
                                    )}
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        disabled={certUploading[index] || !employeeId}
                                        onChange={(e) => handleCertUpload(index, e.target.files[0])}
                                    />
                                </label>
                                {!employeeId && (
                                    <p className="text-xs text-amber-600 mt-1">Save the employee first to upload certificates.</p>
                                )}
                                {certError[index] && (
                                    <p className="text-xs text-red-500 mt-1">{certError[index]}</p>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 italic">No certificate uploaded</span>
                        )}
                    </div>
                )}
            />
        </div>
    );
};


// --- HELPER COMPONENTS ---

const InfoCard = ({ label, value, icon: Icon, valueColor = "text-gray-900" }) => (
    <div className="group p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-md hover:shadow-gray-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-white shadow-sm group-hover:bg-blue-50 transition-colors">
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <div className={`text-sm font-semibold pl-11 ${valueColor}`}>
            {value || 'N/A'}
        </div>
    </div>
);

const FamilyCollection = ({ title, icon: Icon, items, itemLabel, isEditing, onAdd, onRemove, onUpdate, fields, renderExtraPerItem }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">{title}</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {items.length}
                </span>
            </div>
            {isEditing && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                >
                    <Plus className="w-4 h-4" /> Add
                </button>
            )}
        </div>

        <div className="space-y-3">
            {items.length === 0 ? (
                <div className="text-center py-6 px-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm italic">
                    No {title.toLowerCase()} added yet.
                </div>
            ) : (
                items.map((item, index) => (
                    <div key={index} className="relative group/item p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all animate-in">
                        {isEditing && (
                            <button
                                onClick={() => onRemove(index)}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover/item:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {fields.map(field => (
                                <div key={field.name} className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                        {field.icon && <field.icon className="w-3 h-3" />}
                                        {field.placeholder || field.name}
                                    </div>
                                    {!isEditing ? (
                                        <div className="text-sm font-semibold text-gray-800">
                                            {field.type === 'date' ? (item[field.name] ? new Date(item[field.name]).toLocaleDateString() : 'N/A') : (item[field.name] || 'N/A')}
                                        </div>
                                    ) : (
                                        field.type === 'select' ? (
                                            <select
                                                value={item[field.name] || ''}
                                                onChange={(e) => onUpdate(index, field.name, e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="">Select...</option>
                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : field.type === 'phone' ? (
                                            <PhoneInput
                                                country={'lk'}
                                                value={item[field.name] || ''}
                                                onChange={(val) => onUpdate(index, field.name, val)}
                                                inputClass="!w-full !px-10 !py-1.5 !h-auto !rounded-lg !border-gray-100 !bg-gray-50 !text-sm"
                                                containerClass="!w-full"
                                                buttonClass="!border-gray-100 !rounded-l-lg !bg-gray-50"
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={field.type === 'date' && item[field.name] ? item[field.name].split('T')[0] : (item[field.name] || '')}
                                                onChange={(e) => onUpdate(index, field.name, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Render extra per-item content (e.g. birth certificate upload) */}
                        {renderExtraPerItem && renderExtraPerItem(item, index)}
                    </div>
                ))
            )}
        </div>
    </div>
);

const CHIP_COLORS = {
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-600',
    violet: 'bg-violet-100 text-violet-700',
    gray:   'bg-gray-100 text-gray-600',
};

const Chip = ({ color = 'gray', children }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${CHIP_COLORS[color] || CHIP_COLORS.gray}`}>
        {children}
    </span>
);

const FamilyReadOnlySection = ({ title, icon: Icon, items, renderItem }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-1">
            <Icon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">{title}</h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {items.length}
            </span>
        </div>
        {items.length === 0 ? (
            <div className="text-center py-6 px-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm italic">
                No {title.toLowerCase()} recorded.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        )}
    </div>
);

// --- TAB: DEATH BENEFIT ---
export const DeathBenefitTab = ({ deathBenefits = [], loading = false }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount).replace('LKR', 'Rs.');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalAmount = deathBenefits.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
        <div className="space-y-6 animate-in">
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                        <Heart className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-amber-700 tracking-wider">Total Death Donations Issued</p>
                        <p className="text-xl font-black text-gray-900">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Total Claims</p>
                    <p className="text-sm font-black text-gray-900">{deathBenefits.length} {deathBenefits.length === 1 ? 'Record' : 'Records'}</p>
                </div>
            </div>

            {loading ? (
                <div className="py-8 text-center text-sm font-semibold text-gray-500">
                    Loading death benefit history...
                </div>
            ) : deathBenefits.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <h4 className="font-bold text-gray-700 text-base mb-1">No Death Benefit Records Found</h4>
                    <p className="text-xs text-gray-400">No death donation grants have been registered for this employee yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" /> Death Benefit History
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-wider bg-gray-50/50">
                                    <th className="py-3 px-4">Who Did You Get It For</th>
                                    <th className="py-3 px-4">Relationship</th>
                                    <th className="py-3 px-4">Date Issued</th>
                                    <th className="py-3 px-4 text-right">Amount Received</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {deathBenefits.map((item, index) => (
                                    <tr key={item._id || index} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-gray-900">
                                            {item.deceasedName || 'N/A'}
                                            {item.voucherNumber && (
                                                <span className="block text-xs font-normal text-gray-400">
                                                    Voucher: {item.voucherNumber}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {item.relationship || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                                            {formatDate(item.issuedDate)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-bold text-green-700">
                                            {formatCurrency(item.amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                item.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status || 'Paid'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
