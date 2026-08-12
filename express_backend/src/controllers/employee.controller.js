import fs from 'fs';
import path from 'path';
import {
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    getEmployeesByQuery
} from '../services/employee.service.js';
import Employee from '../models/employee.model.js';

const capitalizeWords = (str) => {
    return str
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
};

export const createEmployeeController = async (req, res) => {
    try {
        const employeeData = { ...req.body };

        // Capitalize name
        if (employeeData.name) {
            employeeData.name = capitalizeWords(employeeData.name);
        }

        // Parse stringified JSON fields
        if (employeeData.parents) {
            employeeData.parents = JSON.parse(employeeData.parents);
        }

        if (employeeData.children) {
            employeeData.children = JSON.parse(employeeData.children);
        }

        if (employeeData.spouseParents) {
            employeeData.spouseParents = JSON.parse(employeeData.spouseParents);
        }

        if (employeeData.spouseChildren) {
            employeeData.spouseChildren = JSON.parse(employeeData.spouseChildren);
        }

        if (req.file) {
            employeeData.profilePicture = req.file.filename;
        }

        const employee = await createEmployee(employeeData);
        res.status(201).json({ success: true, message: 'Employee created', data: employee });
    } catch (err) {
        console.error('Create Employee Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};



export const updateEmployeeController = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedData = { ...req.body };

        if (updatedData.parents) {
            updatedData.parents = JSON.parse(updatedData.parents);
        }

        if (updatedData.children) {
            updatedData.children = JSON.parse(updatedData.children);
        }

        if (updatedData.spouseParents) {
            updatedData.spouseParents = JSON.parse(updatedData.spouseParents);
        }

        if (req.file) {
            // Delete old picture
            const old = await getEmployeesByQuery({ _id: id });
            const oldFile = old[0]?.profilePicture;
            if (oldFile) {
                const filePath = path.join('src', 'uploads', oldFile);
                fs.existsSync(filePath) && fs.unlinkSync(filePath);
            }

            updatedData.profilePicture = req.file.filename;
        }

        const updated = await updateEmployee(id, updatedData);

        // Populate department so response shape matches GET /emp
        await updated.populate('department');

        // Build the full profile picture URL if present
        const baseUrl = process.env.EXPRESS_URL || 'http://localhost:5000';
        const updatedObj = updated.toObject();
        if (updatedObj.profilePicture) {
            updatedObj.profilePicture = `${baseUrl}/prop/${updatedObj.profilePicture}`;
        }

        res.status(200).json({ success: true, message: 'Employee updated', data: updatedObj });
    } catch (err) {
        console.error('Update Employee Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const toggleEmployeeStatusController = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await toggleEmployeeStatus(id);
        res.status(200).json({ success: true, message: 'Employee status updated', data: employee });
    } catch (err) {
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
        } else if (err.message.includes('Invalid employee ID')) {
            res.status(400).json({ success: false, message: err.message });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

export const getEmployeesController = async (req, res) => {
    try {
        const query = req.query;
        const employees = await getEmployeesByQuery(query);
        res.status(200).json({ success: true, data: employees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * POST /emp/:id/birth-certificate/:childIndex
 * Upload a birth certificate PDF for a specific child by index.
 */
export const uploadBirthCertificateController = async (req, res) => {
    const { id, childIndex } = req.params;
    const index = parseInt(childIndex, 10);

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
        }

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        if (index < 0 || index >= employee.children.length) {
            // Remove the uploaded file since index is invalid
            fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Invalid child index.' });
        }

        // Delete the old birth certificate file if one exists
        const oldFile = employee.children[index].birthCertificateFile;
        if (oldFile) {
            const oldPath = path.join('src', 'uploads', oldFile);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new filename to the child subdocument
        employee.children[index].birthCertificateFile = req.file.filename;
        await employee.save();

        const baseUrl = process.env.EXPRESS_URL || 'http://localhost:5000';
        res.status(200).json({
            success: true,
            message: 'Birth certificate uploaded.',
            data: {
                filename: req.file.filename,
                url: `${baseUrl}/prop/${req.file.filename}`
            }
        });
    } catch (err) {
        console.error('Upload Birth Certificate Error:', err);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * DELETE /emp/:id/birth-certificate/:childIndex
 * Remove the birth certificate PDF for a specific child by index.
 */
export const deleteBirthCertificateController = async (req, res) => {
    const { id, childIndex } = req.params;
    const index = parseInt(childIndex, 10);

    try {
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        if (index < 0 || index >= employee.children.length) {
            return res.status(400).json({ success: false, message: 'Invalid child index.' });
        }

        const oldFile = employee.children[index].birthCertificateFile;
        if (oldFile) {
            const oldPath = path.join('src', 'uploads', oldFile);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        employee.children[index].birthCertificateFile = '';
        await employee.save();

        res.status(200).json({ success: true, message: 'Birth certificate deleted.' });
    } catch (err) {
        console.error('Delete Birth Certificate Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
