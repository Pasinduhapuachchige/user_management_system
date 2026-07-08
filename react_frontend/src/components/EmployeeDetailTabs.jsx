import React from 'react';
import { 
    User, Mail, Phone, MapPin, CreditCard, Building2, 
    Calendar, Heart, Briefcase, UserCheck, Plus, Trash2,
    Baby, Users, AlertCircle, Info, DollarSign, Activity
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
                <InfoCard label="Date of Birth" value={new Date(data.dateOfBirth).toLocaleDateString()} icon={Calendar} />
                <InfoCard label="Gender" value={data.gender} icon={UserCheck} />
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
                    <option value="Rathmalana">Rathmalana</option>
                    <option value="Osusala">Osusala</option>
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
export const FamilyTab = ({ data, isEditing, onUpdate, errors, onAddFamilyItem, onRemoveFamilyItem, onUpdateFamilyItem }) => {
    return (
        <div className="space-y-8 animate-in">
            {/* Marital Status Wrapper */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-gray-800">Marital Status</span>
                    </div>
                    {isEditing ? (
                        <select
                            value={data.maritalStatus || 'Unmarried'}
                            onChange={(e) => onUpdate('maritalStatus', e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                        >
                            <option value="Unmarried">Unmarried</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                        </select>
                    ) : (
                        <span className="px-4 py-1.5 bg-white rounded-lg border border-gray-200 text-sm font-medium text-blue-600">
                            {data.maritalStatus}
                        </span>
                    )}
                </div>
                {isEditing && data.maritalStatus === 'Married' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60 animate-in">
                        <FormField label="Spouse Name" icon={User} error={errors.spouseName} required>
                            <input
                                type="text"
                                value={data.spouseName || ''}
                                onChange={(e) => onUpdate('spouseName', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                placeholder="Enter spouse full name"
                            />
                        </FormField>
                    </div>
                )}
                {!isEditing && data.spouseName && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-2.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 font-medium">Spouse Name</span>
                        <span className="ml-auto px-4 py-1.5 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-800">
                            {data.spouseName}
                        </span>
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
                        options: ['Father', 'Mother'], 
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
                onAdd={() => onAddFamilyItem('children', { name: '', dateOfBirth: '', gender: '', school: '', grade: '', status: 'Alive' })}
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

const FamilyCollection = ({ title, icon: Icon, items, itemLabel, isEditing, onAdd, onRemove, onUpdate, fields }) => (
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
                    </div>
                ))
            )}
        </div>
    </div>
);
