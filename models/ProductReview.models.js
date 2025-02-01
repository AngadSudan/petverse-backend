import mongoose from "mongoose";
const ProductReviewSchema = new mongoose.Schema(
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      review: { type: String, required: true },
      rating: { type: Number, required: true, min: 0, max: 5 },
    },
    { timestamps: true }
  );
  
  const ProductReview = mongoose.model("ProductReview", ProductReviewSchema);
    export default ProductReview;  