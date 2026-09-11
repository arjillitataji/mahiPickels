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
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(serialize(order));
}));

app.post('/api/orders', asyncRoute(async(req, res) => {
    if (!req.body.userId) return res.status(400).json({ error: 'userId is required' });
    const order = await Order.create({...req.body, id: req.body.id || 'ORD' + Date.now().toString().slice(-8), date: new Date().toISOString() });
    res.status(201).json(serialize(order));
}));

app.put('/api/orders/:id', asyncRoute(async(req, res) => {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.body.status === 'cancelled' && ['shipped', 'delivered', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Order cannot be cancelled' });
    Object.assign(order, req.body);
    await order.save();
    res.json(serialize(order));
}));

app.delete('/api/orders/:id', asyncRoute(async(req, res) => {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Order cannot be cancelled' });
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully' });
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
    res.json(await razorpay.orders.create({ amount: amount * 100, currency, receipt: receipt || 'receipt_' + Date.now() }));
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
    await mongoose.connect(MONGODB_URI);
    await seedDatabase();
    app.listen(PORT, () => console.log(`Mahi Home Pickles backend running on port ${PORT} with MongoDB`));
}

start().catch(error => {
    console.error('Could not start backend:', error.message);
    process.exit(1);
});