// --- DATA STORE ---
const API_BASE = (typeof window !== 'undefined' && window.APP_API_BASE) ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') ?
        'http://localhost:10000' :
        'https://mahipickels.onrender.com');
const defaultProducts = [{
        id: 1,
        name: "Mahi Home Mango Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.5,
        discount: 20,
        description: "Traditional mango pickle made with fresh raw mangoes, sun-dried spices, and premium quality oil. A timeless homemade taste perfect with roti, paratha, and rice.",
        sizes: ["250g", "500g", "1kg"],
        weightPrices: [
            { size: "250g", price: 250, mrp: 350 },
            { size: "500g", price: 450, mrp: 600 },
            { size: "1kg", price: 850, mrp: 1200 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 2,
        name: "Mahi Home Garlic Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.4,
        discount: 20,
        description: "Aromatic garlic pickle crafted with whole garlic cloves, fenugreek, and traditional spices. Adds a bold punch to every meal.",
        sizes: ["250g", "500g", "1kg"],
        weightPrices: [
            { size: "250g", price: 200, mrp: 280 },
            { size: "500g", price: 380, mrp: 520 },
            { size: "1kg", price: 720, mrp: 1000 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 3,
        name: "Mahi Home Lemon Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.3,
        discount: 20,
        description: "Zesty lemon pickle made with fresh lemons, sun-dried and tempered with mustard seeds and curry leaves. A tangy delight for pickle lovers.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 220, mrp: 300 },
            { size: "500g", price: 400, mrp: 550 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 4,
        name: "Mahi Home Mixed Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.6,
        discount: 20,
        description: "A vibrant mixed pickle with carrots, cauliflower, and green chilies. A colorful homemade blend that brings variety to your table.",
        sizes: ["500g", "1kg"],
        weightPrices: [
            { size: "500g", price: 450, mrp: 600 },
            { size: "1kg", price: 850, mrp: 1150 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 5,
        name: "Mahi Home Chicken Pickle",
        category: "Non Veg",
        brand: "Mahi Home",
        rating: 4.7,
        discount: 20,
        description: "Spicy non-veg chicken pickle made with tender chicken pieces, traditional Indian spices, and oil. A rich homemade treat for meat lovers.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 350, mrp: 480 },
            { size: "500g", price: 650, mrp: 900 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 6,
        name: "Mahi Home Fish Pickle",
        category: "Non Veg",
        brand: "Mahi Home",
        rating: 4.5,
        discount: 20,
        description: "Tangy fish pickle made with fresh fish pieces, vinegar, and a blend of spices. A coastal homemade recipe that melts in your mouth.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 380, mrp: 520 },
            { size: "500g", price: 720, mrp: 1000 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 7,
        name: "Mahi Home Spicy Chilli Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.2,
        discount: 20,
        description: "Hot and spicy chilli pickle made with fresh red chillies, garlic, and aromatic spices. Adds a fiery kick to any meal.",
        sizes: ["250g", "500g", "1kg"],
        weightPrices: [
            { size: "250g", price: 180, mrp: 250 },
            { size: "500g", price: 340, mrp: 480 },
            { size: "1kg", price: 650, mrp: 900 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 8,
        name: "Mahi Home Mutton Pickle",
        category: "Non Veg",
        brand: "Mahi Home",
        rating: 4.6,
        discount: 20,
        description: "Tender mutton pickle slow-cooked with yogurt, ginger, and traditional spices. A rich homemade delicacy for non-veg foodies.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 420, mrp: 580 },
            { size: "500g", price: 800, mrp: 1100 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 9,
        name: "Mahi Home Sweet Mango Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.4,
        discount: 20,
        description: "A milder, slightly sweet mango pickle made with jaggery and warm spices. Great for kids and those who prefer less heat.",
        sizes: ["500g", "1kg"],
        weightPrices: [
            { size: "500g", price: 420, mrp: 580 },
            { size: "1kg", price: 800, mrp: 1100 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 10,
        name: "Mahi Home Ginger Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.3,
        discount: 20,
        description: "Fresh ginger pickle with a zesty kick. Made with young ginger, lemon juice, and a hint of fenugreek. Perfect for digestion and taste.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 200, mrp: 280 },
            { size: "500g", price: 380, mrp: 520 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 11,
        name: "Mahi Home Paneer Pickle",
        category: "Veg",
        brand: "Mahi Home",
        rating: 4.5,
        discount: 20,
        description: "Delicious paneer pickle made with soft cottage cheese, yogurt, and traditional spices. A protein-rich homemade treat.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 280, mrp: 380 },
            { size: "500g", price: 520, mrp: 720 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    },
    {
        id: 12,
        name: "Mahi Home Chicken Liver Pickle",
        category: "Non Veg",
        brand: "Mahi Home",
        rating: 4.4,
        discount: 20,
        description: "Spicy chicken liver pickle cooked with onions, tomatoes, and aromatic spices. A flavorful homemade delicacy for non-veg lovers.",
        sizes: ["250g", "500g"],
        weightPrices: [
            { size: "250g", price: 380, mrp: 520 },
            { size: "500g", price: 720, mrp: 1000 }
        ],
        images: [
            "https://images.unsplash.com/photo-1565299556905-4d5b6c7a1b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299623325-4c0e7b0a4b9c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299712131-c9b8c0a4b9c0?w=500&q=80"
        ]
    }
];

const DELIVERY_CHARGE = 50;

// User-specific storage helpers
function getUserStorageKey(baseKey, user) {
    if (!user || !user.email) return baseKey;
    return `${baseKey}_${user.email}`;
}

function loadUserData(baseKey, user) {
    const key = getUserStorageKey(baseKey, user);
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveUserData(baseKey, data, user) {
    const key = getUserStorageKey(baseKey, user);
    localStorage.setItem(key, JSON.stringify(data));
}

// API helper
async function apiCall(url, options = {}) {
    try {
        const { headers: optionsHeaders, ...restOptions } = options;
        const response = await fetch(`${API_BASE}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...optionsHeaders
            },
            ...restOptions
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// --- APP OBJECT ---
const app = {
        currentPage: 'home',
        cart: [],
        wishlist: [],
        orders: [],
        addresses: [],
        user: null,
        currentFilter: 'all',
        currentCategory: null,
        viewMode: 'grid',
        orderFilter: 'all',
        currentSlide: 0,
        slideInterval: null,
        productsCache: null,
        pageHistory: [],

        async init() {
            await this.loadProducts();

            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.user = JSON.parse(savedUser);
                this.loadData();
            }

            this.updateAuthUI();

            if (!this.user) {
                this.navigate('landing');
            } else {
                this.navigate('home');
                this.renderProducts();
                this.updateBadges();
                this.startHeroSlider();
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        },

        async loadProducts() {
            this.productsCache = await apiCall('/api/products');
        },

        loadData() {
            this.cart = loadUserData('cart', this.user);
            this.wishlist = loadUserData('wishlist', this.user);
            this.addresses = loadUserData('addresses', this.user);

            if (API_BASE) {
                const userParam = this.user && this.user.email ? `?userId=${encodeURIComponent(this.user.email)}` : '';
                apiCall(`/api/orders${userParam}`).then(orders => {
                    this.orders = orders;
                    if (this.currentPage === 'orders') {
                        this.renderOrders();
                    }
                }).catch(() => {
                    this.orders = [];
                });
            } else {
                this.orders = [];
            }
        },

        saveData() {
            saveUserData('cart', this.cart, this.user);
            saveUserData('wishlist', this.wishlist, this.user);
            saveUserData('addresses', this.addresses, this.user);
        },

        saveOrders() {},

        navigate(page, options = {}) {
            const previousPage = this.currentPage;
            if (!this.user && page !== 'landing' && page !== 'login') {
                page = 'landing';
            }
            if (!options.skipHistory && previousPage !== page && document.getElementById(`page-${previousPage}`)) {
                this.pageHistory.push(previousPage);
            }
            this.currentPage = page;

            const panel = document.getElementById('mobile-categories-panel');
            if (panel) panel.style.display = 'none';
            const toggleBtn = document.querySelector('.mobile-category-toggle');
            if (toggleBtn) toggleBtn.classList.remove('open');

            const protectedPages = ['cart', 'wishlist', 'orders', 'checkout', 'profile', 'tracking'];
            if (protectedPages.includes(page) && !this.user) {
                this.showToast('Please login first', 'error');
                page = 'login';
            }

            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`page-${page}`);
            if (target) {
                target.classList.add('active');
                this.addPageBackButton(target, page);
            }

            document.body.classList.toggle('landing-mode', page === 'landing');
            document.body.classList.toggle('login-mode', page === 'login');

            this.closeModal();

            switch (page) {
                case 'home':
                    this.renderProducts();
                    break;
                case 'cart':
                    this.renderCart();
                    break;
                case 'wishlist':
                    this.renderWishlist();
                    break;
                case 'orders':
                    this.renderOrders();
                    break;
                case 'checkout':
                    this.renderCheckout();
                    break;
                case 'profile':
                    this.renderProfile();
                    break;
            }

            window.scrollTo(0, 0);
        },

        addPageBackButton(pageElement, page) {
            let backButton = pageElement.querySelector('.page-back-button');
            if (!backButton) {
                backButton = document.createElement('button');
                backButton.className = 'page-back-button';
                backButton.type = 'button';
                backButton.setAttribute('aria-label', 'Go back');
                backButton.title = 'Go back';
                pageElement.prepend(backButton);
            }
            backButton.hidden = page === 'login' || page === 'home';
            backButton.onclick = () => this.goBack();
        },

        goBack() {
            const previousPage = this.pageHistory.pop();
            this.navigate(previousPage || 'home', { skipHistory: true });
        },

        getProducts() {
            let products = this.productsCache || [];
            // Fallback: ensure weightPrices exist for old products loaded from MongoDB
            products = products.map(p => {
                if (!p.weightPrices || p.weightPrices.length === 0) {
                    const sizes = p.sizes || ['250g', '500g', '1kg'];
                    p.weightPrices = sizes.map(size => ({
                        size: size,
                        price: p.price || 200,
                        mrp: p.mrp || 400
                    }));
                }
                p.discount = 0;
                return p;
            });
            return products;
        },

        renderProducts() {
            const grid = document.getElementById('product-grid');
            if (!grid) return;

            let products = this.getProducts();

            // Apply search
            const searchInput = document.getElementById('search-input');
            const searchQuery = searchInput && searchInput.value.toLowerCase();
            if (searchQuery) {
                products = products.filter(p =>
                    p.name.toLowerCase().includes(searchQuery) ||
                    p.category.toLowerCase().includes(searchQuery) ||
                    p.brand.toLowerCase().includes(searchQuery)
                );
            }

            // Apply category filter from nav/dropdown (single source of truth)
            if (this.currentCategory) {
                products = products.filter(p => p.category === this.currentCategory);
            }

            // Apply other filters
            const weightInput = document.getElementById('filter-weight');
            const priceInput = document.getElementById('filter-price');
            const sortInput = document.getElementById('filter-sort');
            const weightFilter = weightInput && weightInput.value;
            const priceFilter = priceInput && priceInput.value;
            const sortFilter = sortInput && sortInput.value;

            if (weightFilter && weightFilter !== 'all') {
                products = products.filter(p => p.sizes && p.sizes.includes(weightFilter));
            }

            if (priceFilter && priceFilter !== 'all') {
                products = products.filter(p => {
                    if (priceFilter === '600+') return p.price >= 600;
                    const [min, max] = priceFilter.split('-').map(Number);
                    return p.price >= min && p.price <= max;
                });
            }

            // Sort
            switch (sortFilter) {
                case 'price-low':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    products.sort((a, b) => b.id - a.id);
                    break;
            }

            grid.innerHTML = '';

            if (products.length === 0) {
                grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🫙</div><h3>No products found</h3><p>Try adjusting your filters</p></div>';
                return;
            }

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.onclick = (e) => {
                    if (!e.target.closest('.wishlist-icon') && !e.target.closest('.add-cart-btn')) {
                        this.showProductModal(product.id);
                    }
                };

                const inWishlist = this.wishlist.includes(product.id);
                const minPrice = product.weightPrices && product.weightPrices.length > 0
                    ? Math.min(...product.weightPrices.map(w => w.price))
                    : (product.price || 0);
                const maxMrp = product.weightPrices && product.weightPrices.length > 0
                    ? Math.max(...product.weightPrices.map(w => w.mrp))
                    : (product.mrp || 0);

                card.innerHTML = `
        <div class="wishlist-icon ${inWishlist ? 'in-wishlist' : ''}" onclick="app.toggleWishlist('${product.id}')">
          ${inWishlist ? '❤️' : '🤍'}
        </div>
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <div class="product-title">${product.name}</div>
          <div class="product-price-row">
            <span class="product-price">From ₹${minPrice}</span>
            <span class="product-mrp">₹${maxMrp}</span>
          </div>
          <div class="product-weights">
            ${(product.weightPrices || []).map(w => `<span class="weight-tag">${w.size}: ₹${w.price}</span>`).join('')}
          </div>
          <div class="product-rating">
            <span class="rating-badge">${product.rating}</span>
            <span>★</span>
          </div>
          <button class="add-cart-btn" onclick="event.stopPropagation(); app.showProductModal('${product.id}')">ADD TO CART</button>
        </div>
      `;
                grid.appendChild(card);
            });
        },

        loadMore() {
            this.renderProducts();
        },

showProductModal(productId) {
            const products = this.getProducts();
            const product = products.find(p => p.id == productId);
            if (!product) return;

            // Fallback: generate weightPrices from old price/mrp/sizes if not present
            if (!product.weightPrices || product.weightPrices.length === 0) {
                const sizes = product.sizes || ['250g', '500g', '1kg'];
                product.weightPrices = sizes.map(size => ({
                    size: size,
                    price: product.price || 200,
                    mrp: product.mrp || 400
                }));
            }
            product.discount = 0;

            const modalBody = document.getElementById('product-modal-body');
            const inWishlist = this.wishlist.includes(product.id);

            modalBody.innerHTML = `
      <div class="product-gallery">
        <img src="${product.images[0]}" alt="${product.name}" class="product-main-image" id="modal-main-image">
        <div class="product-thumbnails">
          ${product.images.map((img, idx) => `
            <img src="${img}" alt="View ${idx + 1}" class="product-thumbnail ${idx === 0 ? 'active' : ''}" onclick="app.setMainImage(this, '${img}')">
          `).join('')}
        </div>
      </div>
      <div class="product-details-info">
        <h2>${product.name}</h2>
        <div class="product-brand">Brand: ${product.brand || 'Mahi Home'}</div>
        <div class="product-desc">${product.description}</div>
        <div class="rating-detail">
          <span class="stars">★★★★★</span>
          <span class="rating-text">${product.rating} | 1,234 ratings</span>
        </div>
        <div class="option-group">
          <label>Select Weight:</label>
          <div class="weight-options">
            ${(product.weightPrices || []).map(w => `
              <button class="size-btn" data-size="${w.size}" data-price="${w.price}" data-mrp="${w.mrp}" onclick="app.selectWeight(this)">${w.size} - ₹${w.price}</button>
            `).join('')}
          </div>
        </div>
        <div class="selected-price-detail" id="selected-price-detail" style="display:none; margin: 16px 0; padding: 12px; background: #f8f0e7; border-radius: 4px;">
          <span class="current-price" id="modal-current-price" style="font-size:1.5rem; font-weight:700; color:var(--rust);">₹0</span>
          <span class="original-price" id="modal-original-price" style="margin-left:12px; font-size:1.1rem; color:#8a7d6e; text-decoration:line-through;">₹0</span>
        </div>
        <div class="detail-actions">
          <button class="btn-primary" onclick="if (app.addToCart('${product.id}')) app.closeModal();">ADD TO CART</button>
          <button class="btn-secondary" onclick="app.toggleWishlist('${product.id}')">
            ${inWishlist ? '❤️ WISHLISTED' : '🤍 ADD TO WISHLIST'}
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('product-modal').classList.add('active');
  },

  setMainImage(thumbnail, src) {
    document.getElementById('modal-main-image').src = src;
    document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
  },

  selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  },

  selectWeight(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const price = btn.dataset.price;
    const mrp = btn.dataset.mrp;

    const priceDetail = document.getElementById('selected-price-detail');
    if (priceDetail) {
      priceDetail.style.display = 'block';
      const currentPriceEl = document.getElementById('modal-current-price');
      const originalPriceEl = document.getElementById('modal-original-price');
      if (currentPriceEl) currentPriceEl.textContent = '₹' + price;
      if (originalPriceEl) originalPriceEl.textContent = '₹' + mrp;
      const discountEl = document.getElementById('modal-discount');
      if (discountEl) discountEl.textContent = '';
    }
  },

  closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  },

  // --- CART ---
  addToCart(productId) {
    const products = this.getProducts();
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    const selectedBtn = document.querySelector('.size-btn.selected');
    const selectedSize = selectedBtn?.dataset.size;
    const selectedPrice = selectedBtn?.dataset.price;
    const selectedMrp = selectedBtn?.dataset.mrp;
    if (!selectedSize) {
      this.showToast('Please select a weight before adding to cart', 'error');
      return false;
    }

    const variantKey = `${productId}-${selectedSize}`;
    const existingItem = this.cart.find(item => item.cartKey === variantKey);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        size: selectedSize,
        price: Number(selectedPrice) || product.price || 0,
        mrp: Number(selectedMrp) || product.mrp || 0,
        cartKey: variantKey,
        quantity: 1
      });
    }
    
    this.saveData();
    this.updateBadges();
    this.showToast('Added to cart!', 'success');
    
    if (this.currentPage === 'cart') {
      this.renderCart();
    }
    return true;
  },

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => (item.cartKey || String(item.id)) !== String(productId));
    this.saveData();
    this.updateBadges();
    this.renderCart();
  },

  updateCartQuantity(productId, delta) {
    const item = this.cart.find(item => (item.cartKey || String(item.id)) === String(productId));
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
    }
    if (!item) return;
    this.saveData();
    this.updateBadges();
    this.renderCart();
  },

  renderCart() {
    const list = document.getElementById('cart-items-list');
    const summary = document.getElementById('cart-summary');
    if (!list) return;
    
    if (this.cart.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><p>Add items to get started</p></div>';
      summary.innerHTML = '';
      return;
    }
    
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = this.cart.reduce((sum, item) => sum + ((item.mrp - item.price) * item.quantity), 0);
    const delivery = DELIVERY_CHARGE;
    const total = subtotal + delivery;
    
    list.innerHTML = this.cart.map(item => `
      <div class="cart-item-row">
        <img src="${item.images[0]}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-variant">Weight: ${item.size || 'Not selected'}</div>
          <div class="cart-item-price">₹${item.price} <span class="cart-item-mrp" style="text-decoration:line-through; color:#8a7d6e; font-size:0.85rem; margin-left:6px;">₹${item.mrp}</span></div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="app.updateCartQuantity('${item.cartKey || item.id}', -1)">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="app.updateCartQuantity('${item.cartKey || item.id}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="app.removeFromCart('${item.cartKey || item.id}')">REMOVE</button>
        </div>
      </div>
    `).join('');
    
    summary.innerHTML = `
      <h3>PRICE DETAILS</h3>
      <div class="summary-row">
        <span>Price (${this.cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
        <span>₹${subtotal + discount}</span>
      </div>
      <div class="summary-row">
        <span>Discount</span>
        <span style="color:#388e3c">-₹${discount}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Charges</span>
        <span>${delivery === 0 ? 'FREE' : '₹' + delivery}</span>
      </div>
      <div class="summary-row total">
        <span>Total Amount</span>
        <span>₹${total}</span>
      </div>
      <button class="checkout-btn" onclick="app.navigate('checkout')">PROCEED TO CHECKOUT</button>
    `;
  },

  // --- WISHLIST ---
  toggleWishlist(productId) {
    const index = this.wishlist.findIndex(id => id == productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.showToast('Removed from wishlist', 'success');
    } else {
      this.wishlist.push(productId);
      this.showToast('Added to wishlist!', 'success');
    }
    saveUserData('wishlist', this.wishlist, this.user);
    this.updateBadges();
    
    if (this.currentPage === 'wishlist') {
      this.renderWishlist();
    }
    
    if (this.currentPage === 'home') {
      this.renderProducts();
    }
  },

  renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    if (!grid) return;
    
    const products = this.getProducts().filter(p => this.wishlist.some(id => id == p.id));
    
    if (products.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">❤️</div><h3>Your wishlist is empty</h3><p>Save items you like for later</p></div>';
      return;
    }
    
    grid.innerHTML = products.map(product => {
            const minPrice = product.weightPrices && product.weightPrices.length > 0
                ? Math.min(...product.weightPrices.map(w => w.price))
                : (product.price || 0);
            const maxMrp = product.weightPrices && product.weightPrices.length > 0
                ? Math.max(...product.weightPrices.map(w => w.mrp))
                : (product.mrp || 0);
            return `
      <div class="product-card" onclick="app.showProductModal('${product.id}')">
        <div class="wishlist-icon in-wishlist" onclick="event.stopPropagation(); app.toggleWishlist('${product.id}')">❤️</div>
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <div class="product-title">${product.name}</div>
          <div class="product-price-row">
            <span class="product-price">From ₹${minPrice}</span>
            <span class="product-mrp">₹${maxMrp}</span>
            <span class="product-discount">${product.discount}% OFF</span>
          </div>
          <div class="product-weights">
            ${(product.weightPrices || []).map(w => `<span class="weight-tag">${w.size}: ₹${w.price}</span>`).join('')}
          </div>
          <div class="product-rating">
            <span class="rating-badge">${product.rating}</span>
            <span>★</span>
          </div>
          <button class="add-cart-btn" onclick="event.stopPropagation(); app.showProductModal('${product.id}')">ADD TO CART</button>
        </div>
      </div>
    `;
        }).join('');
  },

  // --- ORDERS ---
  async placeOrder() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty!', 'error');
      return;
    }

if (this.cart.some(item => !item.size)) {
      this.showToast('Please select a weight for every item before proceeding', 'error');
      this.navigate('cart');
      return;
    }

    const selectedAddress = this.addresses.find(a => a.selected);
    if (!selectedAddress && this.addresses.length > 0) {
      this.addresses[0].selected = true;
    }

    if (this.addresses.length === 0) {
      this.showToast('Please add a delivery address', 'error');
      this.navigate('checkout');
      return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
    const tempOrderId = 'ORD' + Date.now().toString().slice(-8);

    const order = {
      items: [...this.cart],
      address: selectedAddress || this.addresses[0],
      payment: paymentMethod,
      subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      deliveryCharge: DELIVERY_CHARGE,
      total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + DELIVERY_CHARGE,
      status: 'pending',
      date: new Date().toISOString(),
      trackingNumber: '',
      deliveryDate: '',
      id: tempOrderId,
      userId: this.user?.email
    };

    try {
      if (API_BASE) {
        if (paymentMethod === 'razorpay') {
          await this.initiateRazorpayPayment(order);
          return;
        }

        const created = await apiCall('/api/orders', {
          method: 'POST',
          body: JSON.stringify(order)
        });
        order.id = created.id;
        this.orders.unshift(order);
      } else {
        order.id = 'ORD' + Date.now().toString().slice(-8);
        this.orders.unshift(order);
      }

      this.cart = [];
      this.saveData();
      this.saveOrders();
      this.updateBadges();
      this.showToast('Order placed successfully!', 'success');
      this.navigate('orders');
    } catch (err) {
      console.error('Place order error:', err);
      this.showToast('Failed to place order. Please try again.', 'error');
    }
  },

  async initiateRazorpayPayment(order) {
    try {
      const razorpayOrder = await apiCall('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: order.total,
          currency: 'INR',
          receipt: order.id
        })
      });

      const { key } = await apiCall('/api/payment/key');

      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Mahi Home Pickles',
        description: `Payment for Order ${order.id}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: order.address?.name || 'Customer',
          email: 'customer@mahipickles.com',
          contact: order.address?.phone || '9876543210'
        },
        theme: {
          color: '#2874f0'
        },
        modal: {
          onmodalhide: () => {
            this.showToast('Payment cancelled', 'info');
          },
          escape: true,
          animation: true
        },
        handler: async (response) => {
          try {
            await apiCall('/api/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const created = await apiCall('/api/orders', {
              method: 'POST',
              body: JSON.stringify({
                ...order,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                paymentStatus: 'paid',
                payment: 'razorpay',
                status: 'approved'
              })
            });

            await apiCall('/api/payments', {
              method: 'POST',
              body: JSON.stringify({
                id: 'TXN' + Date.now(),
                orderId: created.id,
                customer: order.address?.name || 'Guest',
                amount: order.total,
                method: 'RAZORPAY',
                status: 'approved',
                date: new Date().toISOString(),
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            this.orders.unshift(created);
            this.cart = [];
            this.saveData();
            this.saveOrders();
            this.updateBadges();
            this.showToast('Payment successful! Order confirmed.', 'success');
            this.navigate('orders');
          } catch (err) {
            console.error('Payment verification error:', err);
            this.showToast('Payment verification failed. Please contact support.', 'error');
          }
        },
        payment: {
          method: 'all'
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response);
        this.showToast('Payment failed: ' + (response.error?.description || 'Please try again'), 'error');
      });
      rzp.open();

    } catch (err) {
      console.error('Razorpay initiation error:', err);
      this.showToast('Failed to initiate payment. Please try again.', 'error');
    }
  },

  renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;

    let orders = [...this.orders];

    if (this.orderFilter !== 'all') {
      orders = orders.filter(o => o.status === this.orderFilter);
    }

    if (orders.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3><p>Start shopping to see your orders here</p></div>';
      return;
    }

    list.innerHTML = orders.map(order => {
      const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.status);
      const isRazorpayPaid = order.payment === 'razorpay' && order.paymentStatus === 'paid';
      const needsRefund = order.status === 'cancelled' && isRazorpayPaid && !order.refundStatus;
      return `
        <div class="order-card">
          <div class="order-header">
            <span class="order-id">${order.id}</span>
            <span class="order-status ${order.status}">${order.status}</span>
            ${order.refundStatus ? `<span class="order-status refund-${order.refundStatus}" style="margin-left:8px;">Refund: ${order.refundStatus}</span>` : ''}
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <img src="${item.images[0]}" alt="${item.name}" class="order-item-thumb" title="${item.name}">
            `).join('')}
          </div>
          <div class="order-footer">
            <span class="order-amount">₹${order.total || order.subtotal + DELIVERY_CHARGE}</span>
            <div>
              ${canCancel ? `<button class="order-cancel-btn" onclick="event.stopPropagation(); app.cancelOrder('${order.id}')">Cancel Order</button>` : ''}
              ${needsRefund ? `<button class="order-refund-btn" onclick="event.stopPropagation(); app.requestRefund('${order.id}')">Request Refund</button>` : ''}
              <button class="order-track-btn" onclick="app.showTracking('${order.id}')">Track Order</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    const order = this.orders.find(o => o.id == orderId);
    if (!order) return;

    const updateBody = { status: 'cancelled' };
    if (order.razorpayPaymentId) updateBody.razorpayPaymentId = order.razorpayPaymentId;
    if (order.razorpayOrderId) updateBody.razorpayOrderId = order.razorpayOrderId;

    apiCall(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateBody)
    }).then(async () => {
      order.status = 'cancelled';
      this.saveOrders();
      this.renderOrders();
      this.showToast('Order cancelled successfully', 'success');

      // Auto-trigger refund for Razorpay orders
      if (order.payment === 'razorpay' && order.paymentStatus === 'paid') {
        await this.requestRefund(orderId, true);
      }
    }).catch(err => {
      this.showToast(err.error || 'Failed to cancel order', 'error');
    });
  },

  async requestRefund(orderId, auto = false) {
    let order = this.orders.find(o => o.id == orderId);
    if (!order) {
      this.showToast('Order not found', 'error');
      return;
    }

    let paymentId = order.razorpayPaymentId;
    let razorpayOrderId = order.razorpayOrderId;

    // Try to fetch payment ID from backend if missing
    if (!paymentId && razorpayOrderId) {
      try {
        const info = await apiCall(`/api/orders/${orderId}/payment-id`);
        paymentId = info.razorpayPaymentId;
        razorpayOrderId = info.razorpayOrderId;
      } catch (err) {
        console.error('Failed to fetch payment ID:', err);
      }
    }

    if (!paymentId) {
      this.showToast('No Razorpay payment found for this order', 'error');
      return;
    }
    if (order.refundStatus) {
      this.showToast('Refund already ' + order.refundStatus, 'info');
      return;
    }

    if (!auto && !confirm('Request a refund for this cancelled order? Amount: ₹' + order.total)) return;

    try {
      const result = await apiCall('/api/payment/refund', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          razorpayPaymentId: paymentId,
          razorpayOrderId: razorpayOrderId,
          amount: order.total,
          notes: { order_id: order.id }
        })
      });

      order.refundStatus = 'initiated';
      order.refundId = result.refund_id;
      if (paymentId) order.razorpayPaymentId = paymentId;
      this.saveOrders();
      this.renderOrders();
      this.showToast('Refund initiated successfully! Amount will be credited back.', 'success');
    } catch (err) {
      console.error('Refund error:', err);
      this.showToast(err.error || 'Failed to initiate refund. Please contact support.', 'error');
    }
  },

  showTracking(orderId) {
    const order = this.orders.find(o => o.id == orderId);
    if (!order) return;
    
    const statuses = ['pending', 'approved', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    
    const trackingCard = document.getElementById('tracking-card');
    trackingCard.innerHTML = `
      <div class="order-header">
        <span class="order-id">Order ${order.id}</span>
        <span class="order-status ${order.status}">${order.status}</span>
      </div>
      <div class="tracking-timeline">
        ${statuses.map((status, idx) => `
          <div class="tracking-step ${idx < currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}">
            <div class="tracking-dot">${idx < currentIndex ? '✓' : idx + 1}</div>
            <div class="tracking-info">
              <h4>${status.charAt(0).toUpperCase() + status.slice(1)}</h4>
              <p>${this.getTrackingDate(status, order.date)}</p>
            </div>
          </div>
        `).join('')}
      </div>
      ${order.trackingNumber ? `<p style="margin-top:20px;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
      ${order.deliveryDate ? `<p><strong>Expected Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>` : ''}
    `;
    
    this.navigate('tracking');
  },

  getTrackingDate(status, orderDate) {
    const orderDateObj = new Date(orderDate);
    switch(status) {
      case 'pending':
        return 'Order placed - ' + orderDateObj.toLocaleDateString();
      case 'approved':
        return 'Order confirmed - ' + new Date(orderDateObj.getTime() + 86400000).toLocaleDateString();
      case 'shipped':
        return 'Shipped - ' + new Date(orderDateObj.getTime() + 172800000).toLocaleDateString();
      case 'delivered':
        return 'Delivered - ' + new Date(orderDateObj.getTime() + 432000000).toLocaleDateString();
      default:
        return '';
    }
  },

  setOrderTab(tab) {
    this.orderFilter = tab;
    document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    this.renderOrders();
  },

  // --- CHECKOUT ---
  renderCheckout() {
    this.renderAddressBook();
    this.renderCheckoutSummary();
  },

  renderAddressBook() {
    const book = document.getElementById('address-book');
    if (!book) return;
    
    if (this.addresses.length === 0) {
      book.innerHTML = '<p style="color:#878787; padding:10px 0;">No addresses saved. Add one below.</p>';
      return;
    }
    
    book.innerHTML = this.addresses.map((addr, idx) => `
      <div class="address-card ${addr.selected ? 'selected' : ''}" onclick="app.selectAddress(${idx})">
        <div class="addr-name">${addr.name} | ${addr.phone}</div>
        <div class="addr-details">${addr.details}, ${addr.city}, ${addr.state} - ${addr.pincode}</div>
      </div>
    `).join('');
  },

  showAddressForm() {
    document.getElementById('new-address-form').style.display = 'block';
  },

  saveAddress() {
    const name = document.getElementById('addr-name').value;
    const phone = document.getElementById('addr-phone').value;
    const pincode = document.getElementById('addr-pincode').value;
    const state = document.getElementById('addr-state').value;
    const city = document.getElementById('addr-city').value;
    const details = document.getElementById('addr-details').value;
    
    if (!name || !phone || !pincode || !city || !details) {
      this.showToast('Please fill all address fields', 'error');
      return;
    }
    
    // Deselect all others
    this.addresses.forEach(a => a.selected = false);
    
    this.addresses.push({
      name,
      phone,
      pincode,
      state,
      city,
      details,
      selected: true
    });
    
    this.saveData();
    this.renderAddressBook();
    this.showAddressForm();
    this.showToast('Address saved!', 'success');
    
    // Clear form
    document.getElementById('addr-name').value = '';
    document.getElementById('addr-phone').value = '';
    document.getElementById('addr-pincode').value = '';
    document.getElementById('addr-state').value = '';
    document.getElementById('addr-city').value = '';
    document.getElementById('addr-details').value = '';
    document.getElementById('new-address-form').style.display = 'none';
  },

  selectAddress(index) {
    this.addresses.forEach((a, idx) => a.selected = idx === index);
    this.saveData();
    this.renderAddressBook();
  },

  renderCheckoutSummary() {
    const summary = document.getElementById('checkout-summary');
    if (!summary) return;
    
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = this.cart.reduce((sum, item) => sum + ((item.mrp - item.price) * item.quantity), 0);
    const delivery = DELIVERY_CHARGE;
    const total = subtotal + delivery;
    
    summary.innerHTML = `
      <h3>PRICE DETAILS</h3>
      <div class="summary-row">
        <span>Price (${this.cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
        <span>₹${subtotal + discount}</span>
      </div>
      <div class="summary-row">
        <span>Discount</span>
        <span style="color:#388e3c">-₹${discount}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Charges</span>
        <span>${delivery === 0 ? 'FREE' : '₹' + delivery}</span>
      </div>
      <div class="summary-row total">
        <span>Total Amount</span>
        <span>₹${total}</span>
      </div>
      <button class="checkout-btn" onclick="app.placeOrder()">PLACE ORDER</button>
    `;
  },

  // --- PROFILE ---
  renderProfile() {
    this.updateProfileUI();
    this.renderProfileAddresses();
  },

  updateProfileUI() {
    if (!this.user) {
      document.getElementById('profile-name').textContent = 'Guest User';
      document.getElementById('profile-email').textContent = 'guest@example.com';
      return;
    }
    
    document.getElementById('profile-name').textContent = this.user.name || 'User';
    document.getElementById('profile-email').textContent = this.user.email || '';
    document.getElementById('profile-fullname').value = this.user.name || '';
    document.getElementById('profile-email-input').value = this.user.email || '';
    document.getElementById('profile-phone').value = this.user.phone || '';
  },

  renderProfileAddresses() {
    const list = document.getElementById('profile-addresses-list');
    if (!list) return;
    
    if (this.addresses.length === 0) {
      list.innerHTML = '<p style="color:#878787">No addresses saved</p>';
      return;
    }
    
    list.innerHTML = this.addresses.map((addr, idx) => `
      <div class="address-card ${addr.selected ? 'selected' : ''}" style="margin-bottom:10px;">
        <div class="addr-name">${addr.name} | ${addr.phone}</div>
        <div class="addr-details">${addr.details}, ${addr.city}, ${addr.state} - ${addr.pincode}</div>
      </div>
    `).join('');
  },

  setProfileTab(tab) {
    document.querySelectorAll('.profile-menu-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`profile-tab-${tab}`).classList.add('active');
  },

  updateProfile() {
    const name = document.getElementById('profile-fullname').value;
    const email = document.getElementById('profile-email-input').value;
    const phone = document.getElementById('profile-phone').value;
    
    this.user = { name, email, phone };
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    this.updateProfileUI();
    this.showToast('Profile updated!', 'success');
  },

  toggleMobileCategories() {
    const panel = document.getElementById('mobile-categories-panel');
    const toggleBtn = document.querySelector('.mobile-category-toggle');
    if (!panel) return;

    const isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (toggleBtn) {
      toggleBtn.classList.toggle('open', !isOpen);
    }
  },

  // --- SEARCH & FILTER ---
  search() {
    this.navigate('home');
    this.renderProducts();
  },

  filterCategory(category) {
    this.currentCategory = category;
    this.navigate('home');

    const select = document.getElementById('filter-category');
    if (select) {
      select.value = category === 'all' ? 'all' : category;
    }

    document.querySelectorAll('.mobile-categories-panel .cat-chip').forEach(chip => {
      const chipCategory = chip.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      chip.classList.toggle('active', chipCategory === category);
    });

    this.renderProducts();
  },

  applyFilters() {
    const select = document.getElementById('filter-category');
    if (select) {
      this.currentCategory = select.value === 'all' ? null : select.value;
    }
    this.renderProducts();
  },

  setView(mode) {
    this.viewMode = mode;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const grid = document.getElementById('product-grid');
    if (mode === 'list') {
      grid.classList.add('list-view');
    } else {
      grid.classList.remove('list-view');
    }
  },

  // --- HERO SLIDER ---
  startHeroSlider() {
    this.slideInterval = setInterval(() => {
      this.setSlide((this.currentSlide + 1) % 3);
    }, 4000);
  },

  setSlide(index) {
    this.currentSlide = index;
    document.querySelectorAll('.hero-slide').forEach((slide, idx) => {
      slide.classList.toggle('active', idx === index);
    });
    document.querySelectorAll('.hero-dots .dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  },

  // --- UTILITIES ---
  updateBadges() {
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = this.wishlist.length;
    
    const cartEl = document.getElementById('cart-count');
    const cartBottomEl = document.getElementById('cart-count-bottom');
    const wishlistEl = document.getElementById('wishlist-count');
    
    if (cartEl) cartEl.textContent = cartCount;
    if (cartBottomEl) cartBottomEl.textContent = cartCount;
    if (wishlistEl) wishlistEl.textContent = wishlistCount;
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  // --- AUTHENTICATION ---
  setLoginTab(btn, tab) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.login-tab-content').forEach(t => t.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`login-tab-${tab}`).classList.add('active');
  },

  async register(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    
    if (!name || !email || !phone || !password) {
      this.showToast('Please fill all fields', 'error');
      return;
    }
    
    const user = { name, email, phone, joined: new Date().toISOString().split('T')[0] };
    
    // Save to localStorage registered users (fallback in case API/DB is reset)
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const existing = registeredUsers.find(u => u.email === email);
    if (existing) {
      this.showToast('Email already registered', 'error');
      return;
    }
    registeredUsers.push({ ...user, password });
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    if (API_BASE) {
      try {
        await apiCall('/api/users', {
          method: 'POST',
          body: JSON.stringify({ ...user, password })
        });
      } catch (err) {
        console.warn('Failed to register on server:', err);
      }
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.user = user;
    this.loadData();
    this.updateAuthUI();
    this.updateBadges();
    this.showToast('Registration successful!', 'success');
    this.navigate('home');
  },

  async login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      this.showToast('Please enter email and password', 'error');
      return;
    }
    
    let user = null;
    let userSource = null;
    
    // First check localStorage registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const localUser = registeredUsers.find(u => u.email === email && u.password === password);
    if (localUser) {
      user = { name: localUser.name, email: localUser.email, phone: localUser.phone, joined: localUser.joined };
      userSource = 'local';
    }
    
    // If not found locally, try API
    if (!user && API_BASE) {
      try {
        const users = await apiCall('/api/users');
        user = users.find(u => u.email === email);
        if (user) {
          userSource = 'api';
        }
      } catch (err) {
        console.warn('Failed to fetch users from server:', err);
      }
    }
    
    if (!user) {
      this.showToast('Invalid email or password', 'error');
      return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.user = user;
    this.loadData();
    this.updateAuthUI();
    this.updateBadges();
    this.showToast('Login successful!', 'success');
    this.navigate('home');
  },

  logout() {
    localStorage.removeItem('currentUser');
    this.user = null;
    this.cart = [];
    this.wishlist = [];
    this.orders = [];
    this.addresses = [];
    this.updateAuthUI();
    this.updateBadges();
    this.showToast('Logged out successfully', 'success');
    this.navigate('landing');
  },

  handleProfileClick() {
    if (this.user) {
      this.navigate('profile');
    } else {
      this.navigate('landing');
    }
  },

  updateAuthUI() {
    const profileBtn = document.getElementById('header-profile-btn');
    
    if (profileBtn) {
      if (this.user) {
        profileBtn.querySelector('.icon').textContent = '👤';
        profileBtn.querySelector('.label').textContent = 'Profile';
        profileBtn.onclick = () => this.navigate('profile');
      } else {
        profileBtn.querySelector('.icon').textContent = '👤';
        profileBtn.querySelector('.label').textContent = 'Login';
        profileBtn.onclick = () => this.navigate('login');
      }
    }
  },

  isLoggedIn() {
    return !!this.user;
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await app.init();
});