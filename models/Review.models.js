import mongoose from "mongoose";
const ReviewSchema = new mongoose.Schema(
    {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      review: { type: String, required: true },
      rating: { type: Number, required: true, min: 0, max: 5 },
    },
    { timestamps: true }
  );
  
  const Review = mongoose.model("Review", ReviewSchema);
  export default Review;    