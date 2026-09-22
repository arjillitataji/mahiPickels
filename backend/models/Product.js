const mongoose = require('mongoose');

const weightPriceSchema = new mongoose.Schema({
    size: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    description: { type: String },
    rating: { type: Number, default: 4.0 },
    discount: { type: Number, default: 0 },
    sizes: [{ type: String }],
    weightPrices: [weightPriceSchema],
    images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);