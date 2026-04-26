import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = ({ children, currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Mobile backdrop with better blur */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-[45] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Width: 72 -> 18rem) */}
            <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main content Area */}
            <div className="lg:pl-72 transition-all duration-300 ease-in-out">
                <Topbar
                    setSidebarOpen={setSidebarOpen}
                    currentPage={currentPage}
                />
                <main className="p-4 sm:p-8 max-w-[1600px] mx-auto animate-fadeIn">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;