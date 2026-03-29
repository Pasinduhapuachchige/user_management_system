import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../tools/user.zustand';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import { getEmployeeByIdApi } from '../../../apis/employee.api';
import { getEmpEpf } from '../../../apis/epf.api';
import EmployeeWFullCard from '../../../components/EmployeeWFullCard';
import EpfWFullCard from '../../../components/EpfWFullCard';
import { User, Heart } from 'lucide-react';

const EmployeeDashboard = ({ currentPath }) => {
    const { user } = useUserStore();
    const [employee, setEmployee] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const loadEmployeeData = async () => {
            if (!user || !user._id) return;

            try {
                setIsLoading(true);
                // Fetch basic details
                const empRes = await getEmployeeByIdApi(user._id);
                if (empRes.success && empRes.data.length > 0) {
                    setEmployee(empRes.data[0]);
                } else {
                    setError('Employee record not found');
                }

                // Fetch medical/EPF records
                try {
                    const epfRes = await getEmpEpf({ user: user._id });
                    if (epfRes.success) {
                        setMedicalRecords(epfRes.data);
                    }
                } catch (epfErr) {
                    console.log('No medical records found or error:', epfErr);
                }

            } catch (err) {
                console.error('Error loading employee data:', err);
                setError('Failed to load your details');
            } finally {
                setIsLoading(false);
            }
        };

        loadEmployeeData();
    }, [user]);

    if (isLoading) {
        return (
            <Tab>
                <TabHeader title="My Dashboard" currentPath={currentPath} />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Tab>
        );
    }

    if (error || !employee) {
        return (
            <Tab>
                <TabHeader title="Error" currentPath={currentPath} />
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-700 font-medium">{error || 'Unable to load profile'}</p>
                </div>
            </Tab>
        );
    }

    return (
        <Tab>
            <TabHeader
                title={`Welcome, ${employee.name}`}
                subtitle={`Employee Dashboard (Read-Only) • EPF No: ${employee.epfNumber}`}
                currentPath={currentPath}
            />

            {/* Custom Dashboard Navigation */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                </button>
                <button
                    onClick={() => setActiveTab('medical')}
                    className={`flex items-center px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === 'medical'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Heart className="w-4 h-4 mr-2" />
                    Medical Records
                </button>
            </div>

            <div className="mt-6">
                {activeTab === 'profile' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EmployeeWFullCard initialEmployee={employee} readOnly={true} />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {medicalRecords.length > 0 ? (
                            <EpfWFullCard epfRecords={medicalRecords} readOnly={true} />
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Records</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    You don't have any medical or EPF records associated with your account for the current period.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Tab>
    );
};

export default EmployeeDashboard;
    </div >
);

export default EmployeeDashboard;
