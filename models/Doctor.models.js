import mongoose from "mongoose";
const DoctorSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
      description: { type: String },
      experience: { type: Number, required: true },
      qualification: [{ type: String }],
      isVerified: { type: Boolean, default: false },
      perHourCharge: { type: Number, required: true },
      license: { type: String, unique: true, required: true },
      licenseImageUrl: { type: String },
      weeklySchedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schedule" }],
      reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    },
    { timestamps: true }
  );
  
  const Doctor = mongoose.model("Doctor", DoctorSchema);
  export default Doctor