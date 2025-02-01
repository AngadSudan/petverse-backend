import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema(
    {
      buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1 },
      totalPrice: { type: Number, required: true },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      orderStatus: {
        type: String,
        enum: ["placed", "shipped", "delivered", "cancelled", "returned"],
        default: "placed",
      },
    },
    { timestamps: true }
  );
  
 const Order = mongoose.model("Order", OrderSchema);
  export default Order