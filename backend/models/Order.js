const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    items: [{ type: mongoose.Schema.Types.Mixed }],
    address: mongoose.Schema.Types.Mixed,
    payment: { type: String, default: 'cod' },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 50 },
    total: { type: Number },
    status: { type: String, default: 'pending' },
    date: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    deliveryDate: { type: String, default: '' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paymentStatus: { type: String, default: 'pending' },
    refundStatus: { type: String, default: '' },
<<<<<<< HEAD
    refundId: { type: String },
    refundAmount: { type: Number },
    refundRequestId: { type: String },
    refundAttempts: { type: Number, default: 0 }
=======
    refundId: { type: String, default: '' }
>>>>>>> 4af44fb724a86e1b816e7ca0872b6a74cd3f0190
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
