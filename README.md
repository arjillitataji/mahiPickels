# Mahi Home Pickles - Homemade Pickles E-Commerce Platform

A professional homemade pickle e-commerce platform with separate user and admin portals.

## Project Structure

```
selling demo/
├── index.html          # User portal (deploy on Netlify)
├── style.css           # Shared styles
├── app.js              # User portal logic
├── admin/
│   ├── admin.html      # Admin portal (served by backend on Render)
│   └── admin.js        # Admin portal logic
├── backend/
│   ├── package.json    # Backend dependencies
│   ├── server.js       # Express API server
│   ├── models/         # MongoDB/Mongoose models
│   └── data/           # One-time seed data imported into MongoDB
└── README.md
```

## Deployment

### 1. Deploy Backend on Render

1. Push this repository to GitHub
2. Go to [Render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or paid as needed
5. Click **Create Web Service**
6. Once deployed, note your Render URL (e.g., `https://your-app.onrender.com`)

The backend will:

- Serve the admin panel at `/`
- Provide REST API at `/api/*`
- Persist products, orders, payments, users, settings, and tracking counters in MongoDB
- Auto-generate tracking numbers starting from `100001`

Before starting the backend, create `backend/.env` from `backend/.env.example` and set `MONGODB_URI` to your MongoDB Atlas connection string. If your network blocks Node.js SRV DNS lookups, copy Atlas's standard `mongodb://` connection string into `MONGODB_URI_DIRECT`; it takes precedence over the SRV URI. On the first startup, existing JSON data is imported only for collections that are empty. Keep `backend/.env` private.

### 2. Deploy User Portal on Netlify

1. Go to [Netlify.com](https://netlify.com) and create a new site
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: (leave empty or `/`)
   - **Publish Directory**: (root of repo)
   - **Build Command**: (leave empty - static site)
4. In **Site Settings > Environment Variables**, add:
   - `APP_API_BASE` = `https://your-app.onrender.com` (your Render URL)
5. Deploy the site

### 3. Configure Admin Portal

The admin portal is served directly by the Render backend. Just visit:

```
https://your-app.onrender.com
```

Admin login:

- Name: `admin`
- Password: `admin@12`
- Token: `Ad123TFI05`

These are demo defaults. Set `ADMIN_NAME`, `ADMIN_PASSWORD`, and `ADMIN_TOKEN` in `backend/.env` before production deployment.

If you want to deploy the admin panel separately on Netlify:

1. Deploy the `admin/` folder as a separate Netlify site
2. In `admin/admin.js`, set `ADMIN_API_BASE` to your Render URL:
   ```javascript
   const API_BASE = "https://your-app.onrender.com";
   ```

## Features

### User Portal

- Browse pickles by category (Veg Pickles, Non Veg Pickles)
- Search pickles
- Filter by weight and price
- View product details with multiple images
- Add to cart / wishlist
- Checkout with address and payment
- Order tracking
- Profile management

### Admin Portal

- Dashboard with stats (users, orders, products, revenue)
- Product management (add, edit, delete with desktop image upload)
- Order management (update status, auto-generate tracking numbers)
- Payment approval
- User management
- Store settings

## API Endpoints

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/products`      | Get all products         |
| GET    | `/api/products/:id`  | Get single product       |
| POST   | `/api/products`      | Create product           |
| PUT    | `/api/products/:id`  | Update product           |
| DELETE | `/api/products/:id`  | Delete product           |
| GET    | `/api/orders`        | Get all orders           |
| POST   | `/api/orders`        | Create order             |
| PUT    | `/api/orders/:id`    | Update order             |
| GET    | `/api/users`         | Get all users            |
| POST   | `/api/users`         | Create user              |
| PUT    | `/api/users/:id`     | Update user              |
| DELETE | `/api/users/:id`     | Delete user              |
| GET    | `/api/payments`      | Get all payments         |
| PUT    | `/api/payments/:id`  | Update payment           |
| GET    | `/api/settings`      | Get settings             |
| PUT    | `/api/settings`      | Update settings          |
| GET    | `/api/tracking/next` | Get next tracking number |
| GET    | `/api/health`        | Health check             |

## Local Development

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:10000`

### Frontend

Open `index.html` directly in browser or serve with any static server:

```bash
npx serve .
```

For local development with backend:

```javascript
// In browser console before loading app:
window.APP_API_BASE = "http://localhost:10000";
window.ADMIN_API_BASE = "http://localhost:10000";
```

## Data Storage

- MongoDB is the source of truth for catalog data and transactions
- Files in `backend/data/` are used only as first-run seed data
- Admin panel image uploads are converted to base64 and stored in product data
- Tracking numbers are auto-incremented starting from `100001`

## Notes

- For production, consider replacing JSON file storage with a proper database (PostgreSQL, MongoDB)
- Image uploads via base64 work for demo; for production use cloud storage (S3, Cloudinary)
- The free Render tier may sleep after inactivity; first request may be slow