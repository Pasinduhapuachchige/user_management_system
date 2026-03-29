import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Edit3,
    Trash2,
    X,
    Save,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Building2,
    CreditCard,
    Users,
    Heart,
    Baby,
    CheckCircle,
    UserCheck,
    Briefcase,
    Plus,
    ArrowLeft
} from 'lucide-react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import { getEmployeeByIdApi, updateEmployeeApi, deleteEmployeeApi } from '../../../apis/employee.api';
import { fetchDepartmentsApi } from '../../../apis/department.api';

const ViewEditEmployee = ({ currentPath }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [editData, setEditData] = useState({});
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setIsLoading(true);
                const [empRes, deptRes] = await Promise.all([
                    getEmployeeByIdApi(id),
                    fetchDepartmentsApi()
                ]);

                if (empRes.success && empRes.data.length > 0) {
                    setEmployee(empRes.data[0]);
                } else {
                    setError('Employee not found');
                }

                if (deptRes.success) {
                    setDepartments(deptRes.data);
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load employee details');
            } finally {
                setIsLoading(false);
            }
        };

        loadPageData();
    }, [id]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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

    const startEditing = (section) => {
        setEditingSection(section);

        switch (section) {
            case 'personal':
                setEditData({
                    name: employee.name,
                    email: employee.email,
                    contactNumber: employee.contactNumber,
                    address: employee.address,
                    dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
                    nicNumber: employee.nicNumber,
                    gender: employee.gender
                });
                break;
            case 'employment':
                setEditData({
                    epfNumber: employee.epfNumber,
                    department: employee.department?._id || '',
                    mainLocation: employee.mainLocation || '',
                    joinedDate: employee.joinedDate ? employee.joinedDate.split('T')[0] : '',
                    basicSalary: employee.basicSalary,
                    employmentType: employee.employmentType
                });
                break;
            case 'family':
                setEditData({
                    maritalStatus: employee.maritalStatus,
                    spouseName: employee.spouseName || '',
                    children: employee.children ? [...employee.children] : [],
                    parents: employee.parents ? [...employee.parents] : []
                });
                break;
            default:
                break;
        }
    };

    const handleSave = async (section) => {
        try {
            setIsLoading(true);
            let payload = { ...editData };

            // Special handling for numerical fields
            if (section === 'employment' && payload.basicSalary) {
                const cleaned = typeof payload.basicSalary === 'string'
                    ? payload.basicSalary.replace(/,/g, '').trim()
                    : payload.basicSalary;
                payload.basicSalary = parseFloat(cleaned);
            }

            const res = await updateEmployeeApi(employee._id, payload);

            if (res.success) {
                // Refresh employee data
                const updatedRes = await getEmployeeByIdApi(id);
                if (updatedRes.success && updatedRes.data.length > 0) {
                    setEmployee(updatedRes.data[0]);
                }
                setEditingSection(null);
                showSuccess('Information updated successfully');
            }
        } catch (err) {
            console.error('Update Error:', err);
            setError('Failed to update information');
        } finally {
            setIsLoading(false);
        }
    };

    // Family nested state helpers
    const addChild = () => {
        setEditData({
            ...editData,
            children: [...(editData.children || []), { name: '', dateOfBirth: '', gender: '', school: '', grade: '' }]
        });
    };

    const removeChild = (index) => {
        setEditData({
            ...editData,
            children: editData.children.filter((_, i) => i !== index)
        });
    };

    const updateChild = (index, field, value) => {
        const updated = [...editData.children];
        updated[index] = { ...updated[index], [field]: value };
        setEditData({ ...editData, children: updated });
    };

    const addParent = () => {
        setEditData({
            ...editData,
            parents: [...(editData.parents || []), { name: '', relationship: '', contactNumber: '' }]
        });
    };

    const removeParent = (index) => {
        setEditData({
            ...editData,
            parents: editData.parents.filter((_, i) => i !== index)
        });
    };

    const updateParent = (index, field, value) => {
        const updated = [...editData.parents];
        updated[index] = { ...updated[index], [field]: value };
        setEditData({ ...editData, parents: updated });
    };

    if (isLoading && !employee) {
        return (
            <Tab>
                <TabHeader title="Employee Details" currentPath={currentPath} />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Tab>
        );
    }

    if (error && !employee) {
        return (
            <Tab>
                <TabHeader title="Error" currentPath={currentPath} />
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-700 font-medium mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/employees')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Back to Employees
                    </button>
                </div>
            </Tab>
        );
    }

    return (
        <Tab>
            <TabHeader
                title={employee.name}
                subtitle={`Employee Record: ${employee.epfNumber}`}
                currentPath={currentPath}
            />

            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fadeIn">
                    <CheckCircle className="w-5 h-5" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate('/employees')}
                    className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Back to List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="px-6 pb-6 relative">
                            <div className="w-24 h-24 bg-white rounded-full p-1 absolute -top-12 left-6 shadow-md">
                                {employee.profilePicture && !employee.profilePicture.endsWith('/null') ? (
                                    <img
                                        src={employee.profilePicture}
                                        alt={employee.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="pt-14">
                                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                                <p className="text-gray-500 mb-4">{employee.department?.name || 'No Department'}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {employee.email || 'N/A'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {employee.contactNumber || 'N/A'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                        {employee.address || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Information Tabs/Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Section
                        title="Personal Information"
                        id="personal"
                        icon={UserCheck}
                        isEditing={editingSection === 'personal'}
                        onEdit={() => startEditing('personal')}
                        onCancel={() => setEditingSection(null)}
                        onSave={() => handleSave('personal')}
                        isLoading={isLoading}
                    >
                        {!editingSection === 'personal' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <InfoItem label="Full Name" value={employee.name} />
                                <InfoItem label="Email" value={employee.email} />
                                <InfoItem label="Contact Number" value={employee.contactNumber} />
                                <InfoItem label="NIC Number" value={employee.nicNumber} />
                                <InfoItem label="Date of Birth" value={`${formatDate(employee.dateOfBirth)} (${calculateAge(employee.dateOfBirth)} years)`} />
                                <InfoItem label="Gender" value={employee.gender} />
                                <InfoItem label="Address" value={employee.address} fullWidth />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name" value={editData.name} onChange={(val) => setEditData({ ...editData, name: val })} />
                                <Input label="Email" type="email" value={editData.email} onChange={(val) => setEditData({ ...editData, email: val })} />
                                <Input label="Contact Number" value={editData.contactNumber} onChange={(val) => setEditData({ ...editData, contactNumber: val })} />
                                <Input label="NIC Number" value={editData.nicNumber} onChange={(val) => setEditData({ ...editData, nicNumber: val })} />
                                <Input label="Date of Birth" type="date" value={editData.dateOfBirth} onChange={(val) => setEditData({ ...editData, dateOfBirth: val })} />
                                <Select
                                    label="Gender"
                                    value={editData.gender}
                                    onChange={(val) => setEditData({ ...editData, gender: val })}
                                    options={[
                                        { label: 'Male', value: 'Male' },
                                        { label: 'Female', value: 'Female' },
                                        { label: 'Other', value: 'Other' }
                                    ]}
                                />
                                <TextArea label="Address" value={editData.address} onChange={(val) => setEditData({ ...editData, address: val })} fullWidth />
                            </div>
                        )}
                    </Section>

                    {/* Employment Information */}
                    <Section
                        title="Employment Information"
                        id="employment"
                        icon={Briefcase}
                        isEditing={editingSection === 'employment'}
                        onEdit={() => startEditing('employment')}
                        onCancel={() => setEditingSection(null)}
                        onSave={() => handleSave('employment')}
                        isLoading={isLoading}
                    >
                        {editingSection !== 'employment' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <InfoItem label="EPF Number" value={employee.epfNumber} />
                                <InfoItem label="Department" value={employee.department?.name} />
                                <InfoItem label="Main Location" value={employee.mainLocation} />
                                <InfoItem label="Joined Date" value={formatDate(employee.joinedDate)} />
                                <InfoItem label="Employment Type" value={employee.employmentType} />
                                <InfoItem label="Basic Salary" value={`Rs. ${employee.basicSalary?.toLocaleString()}`} isBold />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="EPF Number" value={editData.epfNumber} onChange={(val) => setEditData({ ...editData, epfNumber: val })} />
                                <Select
                                    label="Department"
                                    value={editData.department}
                                    onChange={(val) => setEditData({ ...editData, department: val })}
                                    options={departments.map(d => ({ label: d.name, value: d._id }))}
                                />
                                <Select
                                    label="Main Location"
                                    value={editData.mainLocation}
                                    onChange={(val) => setEditData({ ...editData, mainLocation: val })}
                                    options={[
                                        { label: 'Head Office', value: 'Head Office' },
                                        { label: 'Rathmalana', value: 'Rathmalana' },
                                        { label: 'Osusala', value: 'Osusala' }
                                    ]}
                                />
                                <Input label="Joined Date" type="date" value={editData.joinedDate} onChange={(val) => setEditData({ ...editData, joinedDate: val })} />
                                <Select
                                    label="Employment Type"
                                    value={editData.employmentType}
                                    onChange={(val) => setEditData({ ...editData, employmentType: val })}
                                    options={[
                                        { label: 'Permanent', value: 'Permanent' },
                                        { label: 'Contract', value: 'Contract' },
                                        { label: 'Intern', value: 'Intern' }
                                    ]}
                                />
                                <Input label="Basic Salary" value={editData.basicSalary} onChange={(val) => setEditData({ ...editData, basicSalary: val })} />
                            </div>
                        )}
                    </Section>

                    {/* Family Information */}
                    <Section
                        title="Family Information"
                        id="family"
                        icon={Heart}
                        isEditing={editingSection === 'family'}
                        onEdit={() => startEditing('family')}
                        onCancel={() => setEditingSection(null)}
                        onSave={() => handleSave('family')}
                        isLoading={isLoading}
                    >
                        {editingSection !== 'family' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <InfoItem label="Marital Status" value={employee.maritalStatus} />
                                    {employee.maritalStatus === 'Married' && <InfoItem label="Spouse Name" value={employee.spouseName} />}
                                </div>

                                {employee.children?.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <Baby className="w-4 h-4 mr-2" /> Children
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {employee.children.map((child, idx) => (
                                                <div key={idx} className="bg-gray-50 px-4 py-2 rounded border border-gray-100 flex justify-between">
                                                    <div>
                                                        <span className="font-medium">{child.name}</span>
                                                        <span className="text-xs text-gray-500 ml-2">({child.gender}, {calculateAge(child.dateOfBirth)} yrs)</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{child.school} - Grade {child.grade}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Marital Status"
                                        value={editData.maritalStatus}
                                        onChange={(val) => setEditData({ ...editData, maritalStatus: val })}
                                        options={[
                                            { label: 'Unmarried', value: 'Unmarried' },
                                            { label: 'Married', value: 'Married' }
                                        ]}
                                    />
                                    {editData.maritalStatus === 'Married' && (
                                        <Input label="Spouse Name" value={editData.spouseName} onChange={(val) => setEditData({ ...editData, spouseName: val })} />
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Baby className="w-4 h-4 mr-2" /> Children
                                        </h4>
                                        <button type="button" onClick={addChild} className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                                            <Plus className="w-3 h-3 mr-1" /> Add Child
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {editData.children?.map((child, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg bg-white relative">
                                                <button onClick={() => removeChild(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <Input label="Name" value={child.name} onChange={(v) => updateChild(idx, 'name', v)} dense />
                                                    <Input label="Date of Birth" type="date" value={child.dateOfBirth?.split('T')[0]} onChange={(v) => updateChild(idx, 'dateOfBirth', v)} dense />
                                                    <Select
                                                        label="Gender" value={child.gender} onChange={(v) => updateChild(idx, 'gender', v)} dense
                                                        options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                                                    />
                                                    <Input label="School" value={child.school} onChange={(v) => updateChild(idx, 'school', v)} dense />
                                                    <Input label="Grade" value={child.grade} onChange={(v) => updateChild(idx, 'grade', v)} dense />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </Tab>
    );
};

// UI Components
const Section = ({ title, icon: Icon, children, isEditing, onEdit, onCancel, onSave, isLoading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
            {!isEditing ? (
                <button
                    onClick={onEdit}
                    className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                </button>
            ) : (
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200"
                    >
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-medium">{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                </div>
            )}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const InfoItem = ({ label, value, fullWidth, isBold }) => (
    <div className={fullWidth ? 'col-span-1 md:col-span-2' : ''}>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <p className={`text-gray-900 mt-1 ${isBold ? 'text-lg font-bold' : 'font-medium'}`}>{value || 'N/A'}</p>
    </div>
);

const Input = ({ label, value, onChange, type = 'text', dense, fullWidth }) => (
    <div className={fullWidth ? 'col-span-1 md:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${dense ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
        />
    </div>
);

const Select = ({ label, value, onChange, options = [], dense }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow ${dense ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
        >
            <option value="">Select...</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const TextArea = ({ label, value, onChange, fullWidth }) => (
    <div className={fullWidth ? 'col-span-1 md:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
        />
    </div>
);

export default ViewEditEmployee;
export default ViewEditEmployee;