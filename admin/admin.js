// --- ADMIN CONFIG ---
const API_BASE = (typeof window !== 'undefined' && window.ADMIN_API_BASE) ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') ?
        'http://localhost:10000' :
        'https://mahipickels.onrender.com');

// --- ADMIN DATA ---
const admin = {
        currentPage: 'dashboard',
        orderFilter: 'all',
        products: [],
        orders: [],
        users: [],
        payments: [],
        settings: {},
        token: localStorage.getItem('adminToken'),

        init() {
            if (!this.token) {
                this.showLogin();
                return;
            }
            const loginScreen = document.getElementById('admin-login-screen');
            const adminLayout = document.querySelector('.admin-layout');
            if (loginScreen) loginScreen.classList.remove('active');
            if (adminLayout) adminLayout.classList.remove('locked');
            this.loadAllData().then(() => {
                this.renderDashboard();
                this.renderProducts();
                this.renderOrders();
                this.renderPayments();
                this.renderUsers();
                this.loadSettings();
            });
        },

        async api(url, options = {}) {
            try {
                const { headers: optionsHeaders, ...restOptions } = options;
                const response = await fetch(`${API_BASE}${url}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
                        ...optionsHeaders
                    },
                    ...restOptions
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        this.token = null;
                        localStorage.removeItem('adminToken');
                        this.showLogin();
                    }
                    const error = await response.json().catch(() => ({ error: 'Request failed' }));
                    throw new Error(error.error || `HTTP ${response.status}`);
                }
                return await response.json();
            } catch (err) {
                console.error('API Error:', err);
                this.showToast(err.message || 'API request failed', 'error');
                throw err;
            }
        },

        showLogin() {
            const loginScreen = document.getElementById('admin-login-screen');
            const adminLayout = document.querySelector('.admin-layout');
            if (loginScreen) loginScreen.classList.add('active');
            if (adminLayout) adminLayout.classList.add('locked');
        },

        async login(event) {
            event.preventDefault();
            const errorElement = document.getElementById('admin-login-error');
            errorElement.textContent = '';
            try {
                const response = await fetch(`${API_BASE}/api/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: document.getElementById('admin-name').value,
                        password: document.getElementById('admin-password').value
                    })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Login failed');
                this.token = result.token;
                localStorage.setItem('adminToken', this.token);
                document.getElementById('admin-login-screen').classList.remove('active');
                document.querySelector('.admin-layout').classList.remove('locked');
                this.init();
            } catch (error) {
                errorElement.textContent = error.message;
            }
        },

        async loadAllData() {
            try {
                const [products, orders, users, payments] = await Promise.all([
                    this.api('/api/products'),
                    this.api('/api/orders'),
                    this.api('/api/users'),
                    this.api('/api/payments')
                ]);
                this.products = products;
                this.orders = orders;
                this.users = users;
                this.payments = payments;
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        },

        // --- NAVIGATION ---
        navigate(page) {
            this.currentPage = page;

            document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));

            const target = document.getElementById(`admin-${page}`);
            if (target) {
                target.classList.add('active');
            }

            const navItems = document.querySelectorAll('.admin-nav-item');
            const pageMap = {
                'dashboard': 0,
                'products': 1,
                'orders': 2,
                'payments': 3,
                'users': 4,
                'settings': 5
            };
            if (navItems[pageMap[page]]) {
                navItems[pageMap[page]].classList.add('active');
            }

            switch (page) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'products':
                    this.renderProducts();
                    break;
                case 'orders':
                    this.renderOrders();
                    break;
                case 'payments':
                    this.renderPayments();
                    break;
                case 'users':
                    this.renderUsers();
                    break;
            }
        },

        logout() {
            this.token = null;
            localStorage.removeItem('adminToken');
            this.showToast('Logged out from admin portal', 'success');
            document.querySelector('.admin-layout').classList.add('locked');
            this.showLogin();
        },

        // --- DASHBOARD ---
        renderDashboard() {
            const totalUsers = this.users.length;
            const totalOrders = this.orders.length;
            const totalProducts = this.products.length;
            const totalRevenue = this.orders
                .filter(o => (o.status === 'delivered' || o.status === 'approved') && o.paymentStatus === 'paid')
                .reduce((sum, o) => sum + (o.total || (o.subtotal || 0) + 50), 0);
            const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
            const deliveredOrders = this.orders.filter(o => o.status === 'delivered').length;

            document.getElementById('stat-users').textContent = totalUsers;
            document.getElementById('stat-orders').textContent = totalOrders;
            document.getElementById('stat-products').textContent = totalProducts;
            document.getElementById('stat-revenue').textContent = '₹' + totalRevenue.toLocaleString();
            document.getElementById('stat-pending').textContent = pendingOrders;
            document.getElementById('stat-delivered').textContent = deliveredOrders;

            this.renderRecentOrders();
            this.renderCharts();
        },

        renderRecentOrders() {
            const tbody = document.querySelector('#recent-orders-table tbody');
            if (!tbody) return;

            const recentOrders = this.orders.slice(0, 5);

            if (recentOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders yet</td></tr>';
                return;
            }

            tbody.innerHTML = recentOrders.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.address?.name || 'Guest'}</td>
        <td>${this.getOrderItemDetails(order)}</td>
        <td>₹${order.total || order.subtotal + 50}</td>
        <td><span class="order-status ${order.status}">${order.status}</span></td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td><button class="action-btn view" onclick="admin.showOrderModal('${order.id}')">View</button></td>
      </tr>
    `).join('');
        },

        getOrderItemDetails(order) {
            return (order.items || []).map(item =>
                `${item.name || 'Product'} (Weight: ${item.size || item.selectedSize || 'Not selected'})`
            ).join('<br>') || 'No items';
        },

        renderCharts() {
            this.drawBarChart('revenueChart', [12000, 19000, 3000, 5000, 2000, 3000], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
            this.drawPieChart('categoryChart', [60, 40], ['Veg Pickles', 'Non Veg Pickles']);
        },

        drawBarChart(canvasId, data, labels) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = Math.max(200, canvas.width = canvas.parentElement.clientWidth - 40);
            const height = canvas.height = 200;

            ctx.clearRect(0, 0, width, height);

            const max = Math.max(...data);
            const barWidth = (width - 60) / data.length;
            const chartHeight = height - 40;

            data.forEach((value, index) => {
                const barHeight = (value / max) * chartHeight;
                const x = 30 + index * barWidth;
                const y = chartHeight - barHeight + 10;

                ctx.fillStyle = '#2874f0';
                ctx.fillRect(x + 10, y, barWidth - 20, barHeight);

                ctx.fillStyle = '#878787';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(labels[index], x + barWidth / 2, height - 5);

                ctx.fillStyle = '#212121';
                ctx.font = 'bold 10px Inter';
                ctx.fillText('₹' + value, x + barWidth / 2, y - 5);
            });
        },

        drawPieChart(canvasId, data, labels) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = Math.max(200, canvas.width = canvas.parentElement.clientWidth - 40);
            const height = canvas.height = 200;

            ctx.clearRect(0, 0, width, height);

            const total = data.reduce((a, b) => a + b, 0);
            const centerX = width / 3;
            const centerY = height / 2;
            const radius = Math.max(1, Math.min(centerX, centerY) - 20);

            const colors = ['#2874f0', '#fb641b', '#388e3c', '#ff9800', '#9c27b0'];
            let startAngle = 0;

            data.forEach((value, index) => {
                const sliceAngle = (value / total) * 2 * Math.PI;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[index % colors.length];
                ctx.fill();

                startAngle += sliceAngle;
            });

            const legendX = width * 0.6;
            labels.forEach((label, index) => {
                const y = 30 + index * 25;
                ctx.fillStyle = colors[index % colors.length];
                ctx.fillRect(legendX, y, 12, 12);
                ctx.fillStyle = '#212121';
                ctx.font = '11px Inter';
                ctx.textAlign = 'left';
                ctx.fillText(`${label} (${data[index]}%)`, legendX + 18, y + 10);
            });
        },

        // --- PRODUCTS ---
        renderProducts() {
            const tbody = document.querySelector('#products-table tbody');
            if (!tbody) return;

            if (this.products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products yet. Add your first product!</td></tr>';
                return;
            }

            tbody.innerHTML = this.products.map(product => {
            const minPrice = product.weightPrices && product.weightPrices.length > 0
                ? Math.min(...product.weightPrices.map(w => w.price))
                : (product.price || 0);
            return `
      <tr>
        <td><img src="${product.images[0]}" alt="${product.name}" class="product-thumb"></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>From ₹${minPrice}</td>
        <td>${product.sizes?.join(', ') || '-'}</td>
        <td>★ ${product.rating}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="admin.editProduct('${product.id}')">Edit</button>
            <button class="action-btn delete" onclick="admin.deleteProduct('${product.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
        }).join('');
        },

        showAddProductModal() {
            document.getElementById('product-form').reset();
            document.getElementById('prod-id').value = '';
            document.getElementById('product-modal-title').textContent = 'Add Product';
            document.getElementById('product-modal-admin').classList.add('active');
        },

        editProduct(productId) {
            const product = this.products.find(p => p.id == productId);
            if (!product) return;

            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-category').value = product.category;
            document.getElementById('prod-sizes').value = (product.sizes && product.sizes.join(', ')) || '';
            const weightPrices = product.weightPrices || [];
            document.getElementById('prod-weight-prices').value = weightPrices.map(w => `${w.size}:${w.price}:${w.mrp}`).join('\n') || '';
            document.getElementById('prod-brand').value = product.brand || '';
            document.getElementById('prod-description').value = product.description || '';
            document.getElementById('prod-image').value = product.images[0] || '';
            document.getElementById('prod-images').value = product.images.slice(1).join(', ') || '';

            document.getElementById('product-modal-title').textContent = 'Edit Product';
            document.getElementById('product-modal-admin').classList.add('active');
        },

        handleImageUpload(input, targetInputId) {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById(targetInputId).value = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        handleMultipleImageUpload(input) {
            const files = Array.from(input.files);
            const preview = document.getElementById('uploaded-images-preview');
            preview.innerHTML = '';

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.cssText = 'width:60px; height:60px; object-fit:cover; border-radius:4px; border:1px solid #ddd;';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });

            const promises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(promises).then(base64Images => {
                const textarea = document.getElementById('prod-images');
                const existingUrls = textarea.value.split(',').map(s => s.trim()).filter(Boolean);
                textarea.value = [...existingUrls, ...base64Images].join(', ');
            });
        },

        async saveProduct(event) {
            event.preventDefault();

            const id = document.getElementById('prod-id').value;
            const name = document.getElementById('prod-name').value;
            const category = document.getElementById('prod-category').value;
            const sizes = document.getElementById('prod-sizes').value.split(',').map(s => s.trim()).filter(Boolean);
            const weightPricesText = document.getElementById('prod-weight-prices').value;
            const weightPrices = weightPricesText.split('\n').map(line => {
                const parts = line.split(':').map(s => s.trim());
                if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
                    return { size: parts[0], price: Number(parts[1]), mrp: Number(parts[2]) };
                }
                return null;
            }).filter(Boolean);
            const brand = document.getElementById('prod-brand').value;
            const description = document.getElementById('prod-description').value;
            const mainImage = document.getElementById('prod-image').value;
            const additionalImages = document.getElementById('prod-images').value.split(',').map(s => s.trim()).filter(Boolean);

            const images = [mainImage, ...additionalImages].filter(Boolean);
            if (images.length === 0) {
                this.showToast('Please provide at least one image', 'error');
                return;
            }

            const minPrice = weightPrices.length > 0 ? Math.min(...weightPrices.map(w => w.price)) : 0;
            const maxMrp = weightPrices.length > 0 ? Math.max(...weightPrices.map(w => w.mrp)) : 0;
            const rating = (4 + Math.random()).toFixed(1);

            const productData = {
                name,
                category,
                price: minPrice,
                mrp: maxMrp,
                discount: 0,
                rating,
                sizes,
                weightPrices,
                brand,
                description,
                images
            };

            try {
                if (id) {
                    await this.api(`/api/products/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(productData)
                    });
                    this.showToast('Product updated!', 'success');
                } else {
                    await this.api('/api/products', {
                        method: 'POST',
                        body: JSON.stringify(productData)
                    });
                    this.showToast('Product added!', 'success');
                }

                await this.loadAllData();
                this.closeProductModal();
                this.renderProducts();
                this.renderDashboard();
            } catch (err) {
                console.error('Save product error:', err);
            }
        },

        async deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product?')) return;
            try {
                await this.api(`/api/products/${productId}`, { method: 'DELETE' });
                await this.loadAllData();
                this.renderProducts();
                this.renderDashboard();
                this.showToast('Product deleted', 'success');
            } catch (err) {
                console.error('Delete product error:', err);
            }
        },

        closeProductModal() {
            document.getElementById('product-modal-admin').classList.remove('active');
        },

        // --- ORDERS ---
        filterOrders(filter) {
            this.orderFilter = filter;
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            this.renderOrders();
        },

        renderOrders() {
            const tbody = document.querySelector('#orders-table tbody');
            if (!tbody) return;

            let orders = [...this.orders];
            if (this.orderFilter !== 'all') {
                orders = orders.filter(o => o.status === this.orderFilter);
            }

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
                return;
            }

            tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.address?.name || 'Guest'}</td>
        <td>${this.getOrderItemDetails(order)}</td>
        <td>₹${order.total || order.subtotal + 50}</td>
        <td>${(order.payment || 'cod').toUpperCase()}</td>
        <td><span class="order-status ${order.status}">${order.status}</span></td>
        <td>${order.paymentStatus === 'paid' ? '✅ Paid' : (order.payment === 'razorpay' ? '⏳ Pending' : '💵 COD')}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" onclick="admin.showOrderModal('${order.id}')">Update</button>
            ${order.status === 'pending' && order.payment !== 'razorpay' ? `<button class="action-btn edit" onclick="admin.showRazorpayModal('${order.id}')">Pay Now</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  },

  async showOrderModal(orderId) {
    const order = this.orders.find(o => o.id == orderId);
    if (!order) return;
    
    document.getElementById('order-action-id').value = order.id;
    document.getElementById('order-action-status').value = order.status;
    
    if (!order.trackingNumber) {
      try {
        const result = await this.api('/api/tracking/next');
        order.trackingNumber = result.trackingNumber;
      } catch (err) {
        order.trackingNumber = '100001';
      }
    }
    document.getElementById('order-action-tracking').value = order.trackingNumber;
    document.getElementById('order-action-delivery').value = order.deliveryDate || '';
    document.getElementById('order-action-modal').classList.add('active');
  },

  async updateOrderStatus() {
    const orderId = document.getElementById('order-action-id').value;
    const status = document.getElementById('order-action-status').value;
    const trackingNumber = document.getElementById('order-action-tracking').value;
    const deliveryDate = document.getElementById('order-action-delivery').value;
    
    try {
      await this.api(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, trackingNumber, deliveryDate })
      });
      
      await this.loadAllData();
      this.renderOrders();
      this.renderDashboard();
      this.closeOrderModal();
      this.showToast('Order status updated!', 'success');
    } catch (err) {
      console.error('Update order error:', err);
    }
  },

  closeOrderModal() {
    document.getElementById('order-action-modal').classList.remove('active');
  },

  showRazorpayModal(orderId) {
    const order = this.orders.find(o => o.id == orderId);
    if (!order) return;
    
    document.getElementById('razorpay-order-id').value = order.id;
    document.getElementById('razorpay-amount').value = order.total || order.subtotal + 50;
    document.getElementById('razorpay-customer').value = order.address?.name || 'Guest';
    document.getElementById('razorpay-modal').classList.add('active');
  },

  closeRazorpayModal() {
    document.getElementById('razorpay-modal').classList.remove('active');
  },

  async initiateRazorpayPayment() {
    const orderId = document.getElementById('razorpay-order-id').value;
    const amount = parseFloat(document.getElementById('razorpay-amount').value);
    const customerName = document.getElementById('razorpay-customer').value;
    const method = document.getElementById('razorpay-method').value;
    
    try {
      const razorpayOrder = await this.api('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ 
          amount: amount, 
          currency: 'INR',
          receipt: orderId
        })
      });
      
      const options = {
        key: (await this.api('/api/payment/key')).key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Mahi Home Pickles',
        description: `Payment for Order ${orderId}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          await this.api('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            })
          });
          
          await this.api(`/api/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
              paymentStatus: 'paid',
              payment: 'razorpay',
              status: 'approved'
            })
          });
          
          await this.loadAllData();
          this.renderOrders();
          this.renderDashboard();
          this.closeRazorpayModal();
          this.showToast('Payment successful! Order confirmed.', 'success');
        },
        prefill: {
          name: customerName,
          email: 'customer@mahipickles.com',
          contact: '9876543210'
        },
        method: {
          upi: method === 'upi',
          card: method === 'card',
          wallet: method === 'wallet',
          netbanking: method === 'netbanking'
        },
        theme: {
          color: '#2874f0'
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.open();
      
    } catch (err) {
      console.error('Razorpay payment error:', err);
      this.showToast('Payment initiation failed. Please try again.', 'error');
    }
  },

  // --- PAYMENTS ---
  renderPayments() {
    const tbody = document.querySelector('#payments-table tbody');
    if (!tbody) return;
    
    if (this.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No payments yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = this.payments.map(payment => `
      <tr>
        <td>${payment.id}</td>
        <td>${payment.orderId}</td>
        <td>${payment.customer}</td>
        <td>₹${payment.amount}</td>
        <td>${payment.method}</td>
        <td><span class="order-status ${payment.status === 'approved' ? 'delivered' : 'pending'}">${payment.status}</span></td>
        <td>
          ${payment.status === 'pending' ? `<button class="action-btn view" onclick="admin.approvePayment('${payment.id}')">Approve</button>` : '-'}
        </td>
      </tr>
    `).join('');
  },

  async approvePayment(paymentId) {
    try {
      await this.api(`/api/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' })
      });
      
      const payment = this.payments.find(p => p.id == paymentId);
      if (payment) {
        const order = this.orders.find(o => o.id == payment.orderId);
        if (order && order.status === 'pending') {
          await this.api(`/api/orders/${order.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'approved' })
          });
        }
      }
      
      await this.loadAllData();
      this.renderPayments();
      this.renderDashboard();
      this.showToast('Payment approved!', 'success');
    } catch (err) {
      console.error('Approve payment error:', err);
    }
  },

  // --- USERS ---
  renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    
    if (this.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = this.users.map(user => {
      const userOrders = this.orders.filter(o => o.userId === user.email).length;
      return `
        <tr>
          <td><strong>${user.name}</strong></td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${new Date(user.joined).toLocaleDateString()}</td>
          <td>${userOrders}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn view" onclick="admin.viewUser('${user.id}')">View</button>
              <button class="action-btn delete" onclick="admin.deleteUser('${user.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  viewUser(userId) {
    const user = this.users.find(u => u.id == userId);
    if (!user) return;
    
    const userOrders = this.orders.filter(o => o.userId === user.email);
    alert(`User: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nJoined: ${new Date(user.joined).toLocaleDateString()}\nTotal Orders: ${userOrders.length}`);
  },

  async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await this.api(`/api/users/${userId}`, { method: 'DELETE' });
      await this.loadAllData();
      this.renderUsers();
      this.renderDashboard();
      this.showToast('User deleted', 'success');
    } catch (err) {
      console.error('Delete user error:', err);
    }
  },

  // --- SETTINGS ---
  async loadSettings() {
    try {
      this.settings = await this.api('/api/settings');
      document.getElementById('store-name').value = this.settings.storeName || 'Mahi Home Pickles';
      document.getElementById('store-email').value = this.settings.email || 'support@mahipickles.com';
      document.getElementById('store-currency').value = this.settings.currency || '₹';
    } catch (err) {
      console.error('Load settings error:', err);
    }
  },

  async saveSettings() {
    const settings = {
      storeName: document.getElementById('store-name').value,
      email: document.getElementById('store-email').value,
      currency: document.getElementById('store-currency').value
    };
    
    try {
      await this.api('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      this.settings = settings;
      this.showToast('Settings saved!', 'success');
    } catch (err) {
      console.error('Save settings error:', err);
    }
  },

  // --- UTILITIES ---
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    if (!document.getElementById('toast-container')) {
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  admin.init();
});