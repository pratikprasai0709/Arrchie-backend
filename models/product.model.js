import { Schema, model } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Glass', 'Steel', 'Plastic', 'Other']
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    productImage: {
        type: String,
        required: true
    },
    productImages: {
        type: [String],
        default: []
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: true,
        enum: ['Glass', 'Steel', 'Plastic']
    },
    availabilityStatus: {
        type: String,
        required: true,
        enum: ['In Stock', 'Out of Stock'],
        default: 'In Stock'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-update availability status based on stockQuantity before saving
productSchema.pre('save', function (next) {
    if (this.stockQuantity <= 0) {
        this.availabilityStatus = 'Out of Stock';
    } else {
        this.availabilityStatus = 'In Stock';
    }
    next();
});

const Product = model('Product', productSchema);
export default Product;
