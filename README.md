# Sara7a Backend - Vercel Deployment Guide

This is the backend API for the Sara7a application, deployed on Vercel.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account ([sign up here](https://vercel.com/signup))
- Vercel CLI installed: `npm install -g vercel`
- MongoDB Atlas database (connection string provided)

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**:
   
   After deployment, go to your Vercel dashboard:
   - Navigate to: **Project → Settings → Environment Variables**
   - Add the following variables:

   ```env
   DB_URI=mongodb+srv://engmahd00_db_user:Bqf8pd4C0t930LJU@cluster0.vsmwaxc.mongodb.net/
   FE_URL=https://sara7a-bay.vercel.app
   TOKEN_SECRET=your_token_secret_key
   CRYPTO_SECRET=your_crypto_secret_key
   HASHED_PASSWORD=your_hashed_password
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   ```

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

## 📝 Environment Variables

See `.env.example` for a complete list of required environment variables.

### Required Variables:
- `DB_URI` - MongoDB connection string
- `FE_URL` - Frontend URL for CORS configuration
- `TOKEN_SECRET` - JWT token secret
- `CRYPTO_SECRET` - Encryption secret
- `HASHED_PASSWORD` - Password hash secret
- `CLOUDINARY_*` - Cloudinary credentials for file uploads
- `EMAIL_*` - Email service configuration

## ⚠️ Important Notes

### Socket.IO Limitations on Vercel
This backend uses Socket.IO for real-time messaging. **Vercel's serverless functions have limitations with WebSocket connections**:
- Serverless functions are stateless and short-lived
- WebSocket connections require persistent connections
- 10-second execution timeout for serverless functions

**If real-time messaging doesn't work properly**, consider:
1. Deploying Socket.IO to a separate platform (Railway, Render, Heroku)
2. Using Vercel for REST API only
3. Upgrading to Vercel Pro for better WebSocket support

### CORS Configuration
The backend is configured to accept requests from:
- `https://sara7a-bay.vercel.app` (your frontend)

If you change the frontend URL, update the `FE_URL` environment variable.

## 🧪 Testing the Deployment

After deployment, test these endpoints:

1. **Root endpoint**:
   ```bash
   curl https://your-backend.vercel.app/
   # Should return: "Hello World!"
   ```

2. **Health check** (test MongoDB connection):
   - Try registering a new user via `/auth/register`
   - Try logging in via `/auth/login`

3. **CORS test**:
   - Open your frontend at `https://sara7a-bay.vercel.app`
   - Attempt login/registration
   - Check browser console for CORS errors

## 📂 Project Structure

```
backend/
├── src/
│   ├── DB/              # Database models and connection
│   ├── middleware/      # Express middleware
│   ├── modules/         # API routes (auth, user, message)
│   ├── socket/          # Socket.IO configuration
│   ├── utils/           # Utility functions
│   ├── app.controller.js
│   └── index.js         # Main entry point
├── config/
│   └── dev.config.js    # Configuration loader
├── vercel.json          # Vercel deployment config
├── package.json
└── .env.example         # Environment variables template
```

## 🔧 Local Development

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. **Update `.env`** with your credentials

5. **Run development server**:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`

## 📚 API Endpoints

- `GET /` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /user/profile` - Get user profile
- `POST /message/send` - Send message
- `GET /message/inbox` - Get messages

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **File Upload**: Cloudinary + Multer
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Email**: Nodemailer

## 📄 License

ISC
