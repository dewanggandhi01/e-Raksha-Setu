# Quick Test Guide: Verify Expo App Connection to Server

## ✅ Server is Running
Your server is now running with:
- **URL**: `http://10.7.19.29:4001`
- **MongoDB**: Connected ✓
- **Test Endpoint**: `http://10.7.19.29:4001/api/test`

## 🧪 3 Ways to Test Connection

### Method 1: Use the Test Screen (Recommended)
I've created a dedicated test screen for you:

1. **Add to your navigation** (in `AppNavigator.js` or wherever you define routes):
```javascript
import ServerTestScreen from '../screens/ServerTestScreen';

// Add this route:
<Stack.Screen name="ServerTest" component={ServerTestScreen} />
```

2. **Navigate to it from any screen**:
```javascript
navigation.navigate('ServerTest');
```

3. The screen will:
   - Auto-test connection on load
   - Show success/failure with details
   - Display troubleshooting tips
   - Allow retry

### Method 2: Test in Console (Quick Check)
Add this to any screen's `useEffect`:

```javascript
import { testConnection } from '../config/api';

useEffect(() => {
  const checkServer = async () => {
    const result = await testConnection();
    console.log('Server test:', result);
  };
  checkServer();
}, []);
```

### Method 3: Manual Browser Test
On your phone's browser, visit:
```
http://10.7.19.29:4001/api/test
```

You should see JSON response:
```json
{
  "ok": true,
  "message": "Connection successful!",
  "server": "e-Raksha-Setu",
  "mongodb": "connected",
  "clientIp": "...",
  "timestamp": "..."
}
```

## 🔍 Check Server Logs
When your app makes a request, you'll see in server console:
```
✓ Test connection received from: ::ffff:10.7.19.29
```

## 📱 What to See in Expo App

### Success Output:
```
Testing connection to: http://10.7.19.29:4001/api/test
✓ Server connection successful: {
  ok: true,
  message: "Connection successful!",
  ...
}
```

### Failure Output:
```
Testing connection to: http://10.7.19.29:4001/api/test
✗ Server connection failed: Network request failed
```

## 🚨 Troubleshooting

### If Connection Fails:

1. **Verify Server is Running**
   ```bash
   # In server directory
   node index.js
   ```
   Should show: `✓ Server listening on port 4001`

2. **Check Your IP Address**
   ```bash
   ipconfig
   ```
   Find IPv4 Address, update in `src/config/api.js` if different

3. **Test from PC Browser**
   Open: `http://localhost:4001/api/test`
   Should show JSON response

4. **Test from Phone Browser**
   Open: `http://10.7.19.29:4001/api/test`
   Should show same JSON response

5. **Same WiFi Network**
   - PC and phone MUST be on same WiFi
   - Not on mobile data

6. **Windows Firewall**
   - Allow Node.js through firewall
   - Allow port 4001

## 📊 Connection Flow Diagram

```
Expo App (Phone)
    ↓
http://10.7.19.29:4001/api/test
    ↓
Your PC Server (Port 4001)
    ↓
MongoDB (Cloud)
    ↓
Response back to App
```

## ✨ Quick Start Commands

```bash
# Terminal 1: Start Server
cd server
node index.js

# Terminal 2: Start Expo App
cd ..
npm start
```

## 🎯 Next Steps After Connection Works

1. ✓ Test connection works
2. ✓ Try user registration
3. ✓ Check MongoDB Atlas for data
4. ✓ Test login functionality

## 📝 Important Files Updated

1. **`src/config/api.js`**
   - Fixed port from 8081 → 4001
   - Added `testConnection()` function

2. **`server/index.js`**
   - Added `/api/test` endpoint
   - Fixed graceful shutdown error

3. **`src/screens/ServerTestScreen.js`** (NEW)
   - Complete test interface
   - Auto-test on load
   - Troubleshooting tips

---

**Your Server**: http://10.7.19.29:4001 ✓  
**Status**: Running and waiting for connections!
