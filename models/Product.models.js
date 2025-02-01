import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: [{ type: String }],
        description: { type: String, required: true },
        brandName: { type: String },
        stockAvailability: { type: Number, default: 1, min: 0 },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: ['medicine', 'petAccessories', 'animal'],
            required: true,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
export default Product;
