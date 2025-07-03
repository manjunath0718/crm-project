# Deployment Guide - Backend Sleep Issue Fix

## Problem
Your frontend loads correctly, but data from the backend only loads if the backend server is manually opened first. This happens because free-tier deployments (like Render, Vercel, Railway) put your backend to sleep when there's no activity.

## Solution Implemented

### 1. Environment Variables
- Updated `client/src/services/api.js` to use environment variables
- Created `.env.example` with configuration examples

### 2. Backend Wake-up Service
- Created `client/src/services/backendWakeUp.js` that periodically pings the backend
- Integrated into `App.jsx` to start automatically when the app loads
- Wakes up backend every 5 minutes to prevent sleep

### 3. Retry Logic
- Added retry functions (`getEmployeesWithRetry`, `getLeadsWithRetry`) with automatic backend wake-up
- Updated components to use these retry functions
- Added loading and error states for better user experience

### 4. Better Error Handling
- Added timeout to API requests (10 seconds)
- Added response interceptors to handle connection errors
- Added user-friendly error messages

## Deployment Steps

### For Frontend (Vercel/Render):

1. **Set Environment Variables:**
   - Go to your deployment platform dashboard
   - Add environment variable: `VITE_API_URL`
   - Set value to your deployed backend URL (e.g., `https://your-backend.onrender.com/api`)

2. **Deploy:**
   - Push your updated code
   - The frontend will now automatically wake up the backend

### For Backend (Render/Railway):

1. **No changes needed** - the backend will automatically wake up when pinged

## Testing

1. **Deploy both frontend and backend**
2. **Wait 5-10 minutes** for backend to go to sleep
3. **Open your frontend** - it should automatically wake up the backend and load data
4. **Check browser console** for wake-up service logs

## Alternative Solutions

### 1. Upgrade to Paid Tier
- Most platforms offer paid tiers that don't sleep
- Render: $7/month for always-on service
- Railway: $5/month for always-on service

### 2. External Monitoring Service
- Use services like UptimeRobot to ping your backend every 5 minutes
- Free tier available with 50 monitors

### 3. Self-Hosted Solution
- Deploy on a VPS (DigitalOcean, AWS EC2, etc.)
- Backend will never sleep

## Troubleshooting

### If data still doesn't load:
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Test backend URL directly in browser
4. Check if backend is actually deployed and running

### If wake-up service isn't working:
1. Check browser console for "Backend wake-up service started" message
2. Verify network requests in browser dev tools
3. Check if backend URL is accessible

## Files Modified

- `client/src/services/api.js` - Added environment variables and retry logic
- `client/src/services/backendWakeUp.js` - New wake-up service
- `client/src/App.jsx` - Integrated wake-up service
- `client/src/pages/DashboardPage.jsx` - Added retry logic
- `client/src/pages/LeadsPage.jsx` - Added retry logic
- `client/src/components/employees/EmployeesPage.jsx` - Added retry logic
- `.env.example` - Environment variable examples 