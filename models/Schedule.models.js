import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema({
    time: { type: String, required: true }, // Example: "09:00-10:00"
    isAvailable: { type: Boolean, default: true }, // Availability tracking
});

const ScheduleSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        dayOfWeek: {
            type: String,
            enum: [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday',
            ],
            required: true,
        },
        timeSlots: [TimeSlotSchema], // Stores all time slots for that day with availability
    },
    { timestamps: true }
);

const Schedule = mongoose.model('Schedule', ScheduleSchema);
export default Schedule;
