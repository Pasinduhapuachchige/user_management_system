import React from 'react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import AddAdminForm from '../../../components/AddAdmin';

const AddAdmin = ({ currentPath }) => (
    <Tab>
        <TabHeader
            title="Provision HR Officer"
            subtitle="Elevate an employee to HR Officer role"
            currentPath={currentPath}

        />
        <div className="">
            <AddAdminForm />
        </div>
    </Tab>
);

export default AddAdmin;