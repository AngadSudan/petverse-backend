import mongoose from 'mongoose';
const DoctorSchema = new mongoose.Schema(
    {
        description: { type: String },
        experience: { type: Number, required: true },
        qualification: [{ type: String }],
        isVerified: { type: Boolean, default: false },
        perHourCharge: { type: Number, required: true },
        license: { type: Number, unique: true, required: true },
        licenseImageUrl: { type: String },
        weeklySchedule: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
        ],
    },
    { timestamps: true }
);

const Doctor = mongoose.model('Doctor', DoctorSchema);
export default Doctor;
