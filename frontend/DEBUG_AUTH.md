# Debug Authentication Issues

## Step 1: Check if you're logged in

Open browser console (F12) and run:

```javascript
// Check if token exists
const token = localStorage.getItem('access_token');
console.log('Token exists:', !!token);
console.log('Token:', token);

// Check if user exists
const userStr = localStorage.getItem('user');
console.log('User exists:', !!userStr);
if (userStr) {
  console.log('User:', JSON.parse(userStr));
}
```

## Step 2: Test the token

Run this in browser console:

```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:8000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Auth test result:', data);
})
.catch(err => {
  console.error('Auth test error:', err);
});
```

## Step 3: Solutions

### If token is missing or null:
**You need to log in again!**
1. Go to `/auth` page
2. Login with your credentials
3. Then try chatting

### If token exists but /me returns 401:
**Token is expired or invalid**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Login again

### If /me works but chat doesn't:
**Backend might not be running or there's a CORS issue**
1. Check backend is running: `http://localhost:8000/docs`
2. Check backend terminal for errors
3. Try restarting backend

## Quick Fix Commands

### Clear everything and start fresh:
```javascript
localStorage.clear();
window.location.href = '/auth';
```

### Just check current status:
```javascript
console.log({
  token: !!localStorage.getItem('access_token'),
  user: !!localStorage.getItem('user'),
  userEmail: JSON.parse(localStorage.getItem('user') || '{}').email
});
```
