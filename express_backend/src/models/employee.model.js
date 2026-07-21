import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    epfNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String
    },
    dateOfBirth: {
        type: Date,
    },
    nicNumber: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    mainLocation: {
        type: String,
        enum: ['Head Office', 'Rathmalana', 'Osusala'],
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    joinedDate: {
        type: Date,
    },
    basicSalary: {
        type: Number,
    },
    employmentType: {
        type: String,
        enum: ['Permanent', 'Contract', 'Intern'],
    },
    profilePicture: {
        type: String,
    },
    maritalStatus: {
        type: String,
        enum: ['Unmarried', 'Married', 'Divorced'],
        default: 'Unmarried',
    },
    spouseName: {
        type: String,
        required: function () {
            return this.maritalStatus === 'Married';
        },
    },
    spouseStatus: {
        type: String,
        enum: ['Alive', 'Deceased'],
        default: 'Alive',
    },
    spouseParents: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                },
                relationship: {
                    type: String,
                    enum: ['Father', 'Mother', 'Father-in-law', 'Mother-in-law', 'Guardian'],
                    required: true
                },
                contactNumber: {
                    type: String,
                },
                status: {
                    type: String,
                    enum: ['Alive', 'Deceased'],
                    default: 'Alive'
                }
            }
        ],
        required: function () {
            return this.maritalStatus === 'Married';
        }
    },
    parents: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                },
                relationship: {
                    type: String,
                    enum: ['Father', 'Mother', 'Guardian'],
                    required: true
                },
                contactNumber: {
                    type: String,
                },
                status: {
                    type: String,
                    enum: ['Alive', 'Deceased'],
                    default: 'Alive'
                }
            }
        ]
    },
    children: [
        {
            name: String,
            dateOfBirth: Date,
            gender: {
                type: String,
                enum: ['Male', 'Female', 'Other']
            },
            school: String,
            grade: String,
            status: {
                type: String,
                enum: ['Alive', 'Deceased'],
                default: 'Alive'
            }
        }
    ],
    contactNumber: {
        type: String,
        required: true,
    },
    medicalRecords: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
