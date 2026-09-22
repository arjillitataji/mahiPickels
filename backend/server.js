require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;
const DATA_DIR = path.join(__dirname, 'data');
const ADMIN_NAME = process.env.ADMIN_NAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@12';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'Ad123TFI05';

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ?
    new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) :
    null;

function readSeedFile(name, fallback) {
    try {
        const filePath = path.join(DATA_DIR, name + '.json');
        return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fallback;
    } catch (error) {
        console.error(`Could not read ${name} seed data:`, error.message);
        return fallback;
    }
}

function serialize(document) {
    if (!document) return document;
    const value = document.toObject ? document.toObject() : document;
    delete value._id;
    delete value.__v;
    return value;
}

function getRazorpayErrorMessage(error) {
    if (!error) return 'Refund failed';
    if (typeof error === 'string') return error;

    const razorpayError = error.error || (error.response && error.response.data && error.response.data.error);
    if (razorpayError) {
        if (typeof razorpayError === 'string') return razorpayError;
        return razorpayError.message || razorpayError.description || razorpayError.reason || razorpayError.code || 'Refund failed';
    }
    if (error.message) return error.message;
    return 'Refund failed';
}

function getRazorpayStatusCode(error, fallback = 400) {
    const statusCode = Number(error && error.statusCode);
    return Number.isInteger(statusCode) ? statusCode : fallback;
}

function createRefundRequestId(orderId) {
    return 'refund_' + crypto.createHash('sha256').update(String(orderId)).digest('hex').slice(0, 24);
}

async function seedCollection(model, name, documents) {
    if (await model.countDocuments() > 0 || documents.length === 0) return;
    await model.insertMany(documents, { ordered: false });
    console.log(`Imported ${documents.length} ${name} from backend/data into MongoDB`);
}

async function seedDatabase() {
    const products = readSeedFile('products', []).map((product, index) => ({
        ...product,
        id: Number(product.id) || index + 1,
        rating: Number(product.rating) || 4
    }));
    await seedCollection(Product, 'products', products);
    await seedCollection(Order, 'orders', readSeedFile('orders', []));
    await seedCollection(Payment, 'payments', readSeedFile('payments', []));
    await seedCollection(User, 'users', readSeedFile('users', []));
}

function asyncRoute(handler) {
    return (req, res) => Promise.resolve(handler(req, res)).catch(error => {
        console.error('API error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    });
}

function requireAdmin(req, res, next) {
    const authorization = req.get('Authorization') || '';
    if (authorization === `Bearer ${ADMIN_TOKEN}`) return next();
    res.status(401).json({ error: 'Admin authentication required' });
}

app.post('/api/admin/login', (req, res) => {
    const { name, password } = req.body;
    if (name !== ADMIN_NAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    res.json({ name: ADMIN_NAME, token: ADMIN_TOKEN });
});

// Products
app.get('/api/products', asyncRoute(async(req, res) => {
    res.json((await Product.find().sort({ createdAt: -1 })).map(serialize));
}));

app.get('/api/products/:id', asyncRoute(async(req, res) => {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(serialize(product));
}));

app.post('/api/products', requireAdmin, asyncRoute(async(req, res) => {
    const latest = await Product.findOne().sort({ id: -1 }).select('id');
    const product = await Product.create({...req.body, id: req.body.id || (((latest && latest.id) || 0) + 1) });
    res.status(201).json(serialize(product));
}));

app.put('/api/products/:id', requireAdmin, asyncRoute(async(req, res) => {
    const product = await Product.findOneAndUpdate({ id: Number(req.params.id) }, { $set: req.body }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(serialize(product));
}));

app.delete('/api/products/:id', requireAdmin, asyncRoute(async(req, res) => {
    const result = await Product.deleteOne({ id: Number(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
}));

// Orders and transactions
app.get('/api/orders', asyncRoute(async(req, res) => {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    res.json((await Order.find(filter).sort({ date: -1, createdAt: -1 })).map(serialize));
}));

app.get('/api/orders/:id', asyncRoute(async(req, res) => {
    const order = await Order.findOne({ id: { $regex: new RegExp(`^${req.params.id}$`, 'i') } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(serialize(order));
}));

app.post('/api/orders', asyncRoute(async(req, res) => {
    if (!req.body.userId) return res.status(400).json({ error: 'userId is required' });
    const orderData = {...req.body, id: req.body.id || 'ORD' + Date.now().toString().slice(-8), date: new Date().toISOString() };
    if (req.body.razorpayPaymentId) orderData.razorpayPaymentId = req.body.razorpayPaymentId;
    if (req.body.razorpayOrderId) orderData.razorpayOrderId = req.body.razorpayOrderId;
    const order = await Order.create(orderData);
    res.status(201).json(serialize(order));
}));

app.put('/api/orders/:id', asyncRoute(async(req, res) => {
    const order = await Order.findOne({ id: { $regex: new RegExp(`^${req.params.id}$`, 'i') } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.body.status === 'cancelled' && ['shipped', 'delivered', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Order cannot be cancelled' });
    if (req.body.razorpayPaymentId) order.razorpayPaymentId = req.body.razorpayPaymentId;
    if (req.body.razorpayOrderId) order.razorpayOrderId = req.body.razorpayOrderId;
    if (req.body.refundStatus) order.refundStatus = req.body.refundStatus;
    if (req.body.refundId) order.refundId = req.body.refundId;
    Object.assign(order, req.body);
    await order.save();
    res.json(serialize(order));
}));

app.delete('/api/orders/:id', asyncRoute(async(req, res) => {
    const order = await Order.findOne({ id: { $regex: new RegExp(`^${req.params.id}$`, 'i') } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Order cannot be cancelled' });
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully' });
}));

// Auto-refund — triggers Razorpay refund for cancelled Razorpay-paid orders, no admin needed
app.post('/api/orders/:id/refund', asyncRoute(async(req, res) => {
    if (!razorpay) return res.status(503).json({ error: 'Razorpay is not configured on this server' });

    const order = await Order.findOne({ id: { $regex: new RegExp(`^${req.params.id}$`, 'i') } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Guard: only cancelled Razorpay-paid orders qualify
    if (order.status !== 'cancelled') {
        return res.status(400).json({ error: 'Refund is only available for cancelled orders' });
    }
    if (order.payment !== 'razorpay') {
        return res.status(400).json({ error: 'Refund is only available for Razorpay payments (not COD)' });
    }
    if (order.paymentStatus !== 'paid') {
        return res.status(400).json({ error: 'Payment was not completed — no refund needed' });
    }
    if (order.refundStatus === 'refunded') {
        return res.status(400).json({ error: 'This order has already been refunded' });
    }
    if (order.refundStatus === 'processing') {
        return res.status(400).json({ error: 'Refund is already being processed' });
    }

    // Look up the Razorpay payment ID from the Payment collection
    const paymentRecord = await Payment.findOne({ orderId: order.id });
    if (!paymentRecord || !paymentRecord.razorpayPaymentId) {
        return res.status(400).json({ error: 'Razorpay payment record not found — cannot initiate refund' });
    }

    // Mark processing in DB before calling Razorpay
    order.refundStatus = 'processing';
    await order.save();

    try {
        const refundAmount = Math.round((order.total || order.subtotal || 0) * 100); // paise
        const refund = await razorpay.payments.refund(paymentRecord.razorpayPaymentId, {
            amount: refundAmount,
            speed: 'normal',
            notes: { reason: 'Customer requested cancellation refund', orderId: order.id }
        });

        // Refund success — update order and payment records
        order.refundStatus = 'refunded';
        order.refundId = refund.id;
        await order.save();

        await Payment.findOneAndUpdate(
            { orderId: order.id },
            { $set: { status: 'refunded', refundId: refund.id } }
        );

        return res.json({
            success: true,
            message: 'Refund processed successfully',
            refundId: refund.id,
            amount: order.total,
            refundStatus: 'refunded'
        });
    } catch (err) {
        // Razorpay call failed — mark as failed in DB
        order.refundStatus = 'failed';
        await order.save();
        console.error('Razorpay refund error:', err);
        return res.status(500).json({
            error: err.error && err.error.description ? err.error.description : 'Refund failed. Please try again or contact support.'
        });
    }
}));

// Dialogflow Webhook Fulfillment (Retrieves exact order status from DB and returns greeting with chips)
app.post('/api/dialogflow/webhook', asyncRoute(async(req, res) => {
    const queryResult = (req.body && req.body.queryResult) || {};
    const params = queryResult.parameters || {};
    const queryText = (queryResult.queryText || '').trim();

    let orderId = params.orderId || params.order_id || params['order-id'] || '';
    if (!orderId) {
        const match = queryText.match(/ORD[\w\d\-]+/i);
        if (match) orderId = match[0];
    }

    if (orderId) {
        const order = await Order.findOne({ id: { $regex: new RegExp(`^${orderId}$`, 'i') } });
        if (order) {
            const itemsList = (order.items || []).map(i => `${i.name || 'Pickle'} (x${i.quantity || 1})`).join(', ') || 'Pickle jars';
            const statusUpper = (order.status || 'PENDING').toUpperCase();
            const dateStr = order.date ? new Date(order.date).toLocaleDateString('en-IN') : 'Recent';

            return res.json({
                fulfillmentMessages: [
                    {
                        payload: {
                            richContent: [
                                [
                                    {
                                        type: "info",
                                        title: `Order #${order.id}`,
                                        subtitle: `Status: ${statusUpper} | Total: ₹${order.total || order.subtotal || 0}`,
                                        image: {
                                            src: {
                                                rawUrl: (order.items && order.items[0] && (order.items[0].image || (order.items[0].images && order.items[0].images[0]))) ||
                                                    'https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80'
                                            }
                                        }
                                    },
                                    {
                                        type: "description",
                                        title: "📦 Order Details (From Database)",
                                        text: [
                                            `Exact DB Status: ${statusUpper}`,
                                            `Placed Date: ${dateStr}`,
                                            `Items: ${itemsList}`,
                                            `Payment: ${(order.payment || 'COD').toUpperCase()} (${(order.paymentStatus || 'Pending').toUpperCase()})`,
                                            order.trackingNumber ? `Tracking No: ${order.trackingNumber}` : 'Tracking: Standard Processing'
                                        ]
                                    }
                                ],
                                [
                                    {
                                        type: "description",
                                        title: "👋 Hello! How else can I help you today?",
                                        text: ["Choose an option below:"]
                                    },
                                    {
                                        type: "chips",
                                        options: [
                                            { text: "Track another order" },
                                            { text: "My Orders" },
                                            { text: "Veg Pickles" },
                                            { text: "Non Veg Pickles" },
                                            { text: "Help & Support" }
                                        ]
                                    }
                                ]
                            ]
                        }
                    }
                ]
            });
        } else {
            return res.json({
                fulfillmentMessages: [
                    {
                        payload: {
                            richContent: [
                                [
                                    {
                                        type: "description",
                                        title: "Order Not Found",
                                        text: [`We could not find an order with ID "${orderId}" in our database.`]
                                    }
                                ],
                                [
                                    {
                                        type: "description",
                                        title: "👋 Hello! How can I help you?",
                                        text: ["Please verify your order ID or select an option below:"]
                                    },
                                    {
                                        type: "chips",
                                        options: [
                                            { text: "Track Order" },
                                            { text: "My Orders" },
                                            { text: "Browse Pickles" },
                                            { text: "Help & Support" }
                                        ]
                                    }
                                ]
                            ]
                        }
                    }
                ]
            });
        }
    }

    // Default response: Greeting with chips
    const recentOrders = await Order.find().sort({ createdAt: -1, date: -1 }).limit(3);
    const orderChips = recentOrders.map(o => ({ text: `Order #${o.id}` }));
    const defaultChips = [
        ...orderChips,
        { text: "Track Order" },
        { text: "Browse Pickles" },
        { text: "Help & Support" }
    ].slice(0, 5);

    res.json({
        fulfillmentMessages: [
            {
                payload: {
                    richContent: [
                        [
                            {
                                type: "description",
                                title: "👋 Welcome to Mahi Home Pickles!",
                                text: ["Click any chip below to check your live order status or explore our products:"]
                            },
                            {
                                type: "chips",
                                options: defaultChips
                            }
                        ]
                    ]
                }
            }
        ]
    });
}));

// Users
app.get('/api/users', asyncRoute(async(req, res) => res.json((await User.find().sort({ createdAt: -1 })).map(serialize))));
app.post('/api/users', asyncRoute(async(req, res) => {
    const latest = await User.findOne().sort({ id: -1 }).select('id');
    const user = await User.create({...req.body, id: req.body.id || (((latest && latest.id) || 0) + 1), joined: req.body.joined || new Date().toISOString().split('T')[0] });
    res.status(201).json(serialize(user));
}));
app.put('/api/users/:id', asyncRoute(async(req, res) => {
    const user = await User.findOneAndUpdate({ id: Number(req.params.id) }, { $set: req.body }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(serialize(user));
}));
app.delete('/api/users/:id', asyncRoute(async(req, res) => {
    const result = await User.findOneAndDelete({ id: Number(req.params.id) });
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
}));

// Payments
app.get('/api/payments', requireAdmin, asyncRoute(async(req, res) => res.json((await Payment.find().sort({ date: -1, createdAt: -1 })).map(serialize))));
app.post('/api/payments', asyncRoute(async(req, res) => {
    const payment = await Payment.create({...req.body, id: req.body.id || 'TXN' + Date.now(), date: req.body.date || new Date().toISOString() });
    res.status(201).json(serialize(payment));
}));
app.put('/api/payments/:id', requireAdmin, asyncRoute(async(req, res) => {
    const payment = await Payment.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(serialize(payment));
}));

// Razorpay
app.post('/api/payment/create-order', asyncRoute(async(req, res) => {
    if (!razorpay) return res.status(503).json({ error: 'Razorpay is not configured' });
    const { amount, currency = 'INR', receipt } = req.body;
    if (amount == null || isNaN(amount) || Number(amount) < 1) {
        return res.status(400).json({ error: 'Amount is required and must be at least 1 rupee (100 paise)' });
    }
    res.json(await razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt: receipt || 'receipt_' + Date.now() }));
}));
app.post('/api/payment/verify', asyncRoute(async(req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ status: 'FAILED', message: 'Invalid signature' });
    res.json({ status: 'OK', message: 'Payment verified successfully' });
}));
app.get('/api/payment/key', (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID) return res.status(503).json({ error: 'Razorpay is not configured' });
    res.json({ key: process.env.RAZORPAY_KEY_ID, currency: 'INR' });
});

app.get('/api/orders/:id/payment-id', asyncRoute(async(req, res) => {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ razorpayPaymentId: order.razorpayPaymentId || null, razorpayOrderId: order.razorpayOrderId || null });
}));

// Razorpay Refund
app.post('/api/payment/refund', asyncRoute(async(req, res) => {
    if (!razorpay) return res.status(503).json({ error: 'Razorpay is not configured' });

    const { orderId, razorpayPaymentId, razorpayOrderId, amount, notes } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    let order = await Order.findOne({ id: orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let paymentId = order.razorpayPaymentId || razorpayPaymentId;
    let linkedRazorpayOrderId = order.razorpayOrderId || razorpayOrderId;

    if (!paymentId && linkedRazorpayOrderId) {
        try {
            const orderInfo = await razorpay.orders.fetchPayments(linkedRazorpayOrderId);
            if (orderInfo.items && orderInfo.items.length > 0) {
                paymentId = orderInfo.items[0].id;
            }
        } catch (err) {
            console.error('Failed to fetch payment from order:', err);
        }
    }

    if (!paymentId) return res.status(400).json({ error: 'razorpayPaymentId is required' });
    if (order.razorpayPaymentId && paymentId !== order.razorpayPaymentId) {
        return res.status(400).json({ error: 'Payment ID does not match this order' });
    }

    if (order.status !== 'cancelled') {
        return res.status(400).json({ error: 'Order must be cancelled before requesting a refund' });
    }
    if (order.payment !== 'razorpay' || order.paymentStatus !== 'paid') {
        return res.status(400).json({ error: 'Refund is available only for paid Razorpay orders' });
    }

    if (order.refundStatus === 'pending') {
        return res.status(409).json({
            error: 'Refund request is already in progress',
            refund_status: 'pending',
            refund_id: order.refundId || null
        });
    }
    if ((order.refundId && order.refundStatus !== 'failed') || ['initiated', 'processed'].includes(order.refundStatus)) {
        return res.json({
            status: 'OK',
            refund_id: order.refundId || null,
            refund_status: order.refundStatus,
            amount: order.refundAmount || null,
            message: 'Refund already ' + order.refundStatus
        });
    }

    const orderAmount = Number(order.total ?? (Number(order.subtotal) + Number(order.deliveryCharge ?? 50)));
    const requestedAmount = amount == null ? orderAmount : Number(amount);
    if (!Number.isFinite(orderAmount) || orderAmount < 1) {
        return res.status(400).json({ error: 'Order amount is invalid' });
    }
    if (!Number.isFinite(requestedAmount) || requestedAmount < 1 || requestedAmount > orderAmount) {
        return res.status(400).json({ error: 'Refund amount must be between 1 and the order total' });
    }

    const claimFilter = {
        id: orderId,
        $or: [
            { refundStatus: { $exists: false }, refundId: { $exists: false } },
            { refundStatus: { $exists: false }, refundId: null },
            { refundStatus: '', refundId: { $exists: false } },
            { refundStatus: '', refundId: null },
            { refundStatus: 'failed' }
        ]
    };
    const nextRefundAttempts = (order.refundAttempts || 0) + 1;
    const nextRefundRequestId = createRefundRequestId(order.id + ':' + nextRefundAttempts);
    const claimedOrder = await Order.findOneAndUpdate(
        claimFilter,
        {
            $set: {
                refundStatus: 'pending',
                refundRequestId: nextRefundRequestId,
                refundAttempts: nextRefundAttempts
            }
        },
        { new: true }
    );

    if (!claimedOrder) {
        const currentOrder = await Order.findOne({ id: orderId });
        if (!currentOrder) return res.status(404).json({ error: 'Order not found' });
        if (currentOrder.refundStatus === 'pending') {
            return res.status(409).json({
                error: 'Refund request is already in progress',
                refund_status: 'pending',
                refund_id: currentOrder.refundId || null
            });
        }
        if ((currentOrder.refundId && currentOrder.refundStatus !== 'failed') || ['initiated', 'processed'].includes(currentOrder.refundStatus)) {
            return res.json({
                status: 'OK',
                refund_id: currentOrder.refundId || null,
                refund_status: currentOrder.refundStatus,
                amount: currentOrder.refundAmount || null,
                message: 'Refund already ' + currentOrder.refundStatus
            });
        }
        return res.status(409).json({ error: 'Refund request could not be claimed' });
    }
    order = claimedOrder;

    const refundData = {
        amount: Math.round(requestedAmount * 100),
        receipt: order.refundRequestId,
        notes: notes || { order_id: order.id }
    };

    let refund;
    try {
        refund = await razorpay.payments.refund(paymentId, refundData);
    } catch (err) {
        const statusCode = getRazorpayStatusCode(err, 400);
        const isUncertainError = !err.statusCode || statusCode === 409 || statusCode >= 500;
        if (!isUncertainError) {
            order.refundStatus = '';
            await order.save().catch(saveError => console.error('Failed to reset refund status:', saveError.message));
        }

        const message = getRazorpayErrorMessage(err);
        console.error('Refund error:', err);
        res.status(statusCode >= 500 ? 500 : statusCode).json({
            error: message,
            refund_status: order.refundStatus,
            razorpayStatus: statusCode
        });
        return;
    }

    const refundStatus = refund.status || 'initiated';

    order.razorpayPaymentId = paymentId;
    if (linkedRazorpayOrderId) order.razorpayOrderId = linkedRazorpayOrderId;
    order.refundId = refund.id;
    order.refundStatus = refundStatus;
    order.refundAmount = requestedAmount;
    await order.save().catch(saveError => console.error('Failed to save refund status:', saveError.message));

    res.json({
        status: 'OK',
        refund_id: refund.id,
        refund_status: refundStatus,
        amount: refund.amount,
        message: refundStatus === 'processed' ? 'Refund processed successfully' : 'Refund initiated successfully'
    });
}));

const settingsSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed });
const counterSchema = new mongoose.Schema({ key: { type: String, unique: true }, lastNumber: { type: Number, default: 100000 } });
const Settings = mongoose.model('Settings', settingsSchema);
const Counter = mongoose.model('Counter', counterSchema);

app.get('/api/settings', requireAdmin, asyncRoute(async(req, res) => {
    const setting = await Settings.findOne({ key: 'store' });
    res.json((setting && setting.value) || { storeName: 'Mahi Home Pickles', email: 'support@mahipickles.com', currency: '₹' });
}));
app.put('/api/settings', requireAdmin, asyncRoute(async(req, res) => {
    await Settings.findOneAndUpdate({ key: 'store' }, { key: 'store', value: req.body }, { upsert: true, new: true });
    res.json(req.body);
}));
app.get('/api/tracking/next', requireAdmin, asyncRoute(async(req, res) => {
    const counter = await Counter.findOneAndUpdate({ key: 'tracking' }, { $inc: { lastNumber: 1 }, $setOnInsert: { key: 'tracking' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ trackingNumber: String(counter.lastNumber).padStart(6, '0') });
}));
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'admin', 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'admin', 'admin.html')));
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API endpoint not found' });
    if (req.path.startsWith('/admin')) return res.sendFile(path.join(__dirname, '..', 'admin', 'admin.html'));
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

async function start() {
    if (!MONGODB_URI) throw new Error('MONGODB_URI or MONGODB_URI_DIRECT is required');
    await mongoose.connect(MONGODB_URI, { dbName: process.env.DB_NAME || 'mahipickels' });
    await seedDatabase();
    app.listen(PORT, () => console.log(`Mahi Home Pickles backend running on port ${PORT} with MongoDB`));
}

start().catch(error => {
    console.error('Could not start backend:', error.message);
    process.exit(1);
});