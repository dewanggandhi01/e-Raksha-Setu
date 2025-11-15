# e-Raksha Setu Server Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Your computer's local IP address

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
The `.env` file is already configured with MongoDB connection:
```env
MONGO_URI=mongodb+srv://user1:test123@cluster0.zahjt9b.mongodb.net/eRakshaSetu?retryWrites=true&w=majority
PORT=4001
```

### 3. Find Your Local IP Address
**On Windows (PowerShell):**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**On macOS/Linux:**
```bash
ifconfig
```
Look for "inet" address (not 127.0.0.1)

### 4. Start the Server
```bash
npm start
```

You should see:
```
✓ Connected to MongoDB successfully
✓ Database: eRakshaSetu
✓ Server listening on port 4001
```

### 5. Test the Server
Open your browser or use curl:
```bash
curl http://localhost:4001
```

You should get a JSON response with server status.

## 📱 Connect React Native App

### Update API Configuration
1. Open `src/config/api.js` in your React Native project
2. Replace `10.7.19.29` with your computer's IP address:
```javascript
return 'http://YOUR_IP_ADDRESS:4001';
```

### Test Connection from Expo App
The app will automatically connect when you:
1. Register a new user
2. Login with existing credentials

Check the Expo console and server console for connection logs.

## 🔌 API Endpoints

### Health Check
```http
GET /
```
Returns server status and available endpoints

### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "address": "ERSTU-XXXX-XXXX-XXXX",
  "name": "User Name",
  "encryptedPrivateKey": "optional_encrypted_data"
}
```

### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "address": "ERSTU-XXXX-XXXX-XXXX"
}
```

### Get User by Address
```http
GET /api/users/:address
```

### List All Users
```http
GET /api/users
```

## 🔍 Troubleshooting

### MongoDB Connection Failed
- Check if MONGO_URI is correct in `.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Ensure internet connection is stable

### Cannot Connect from Expo App
1. **Verify Server is Running**
   ```bash
   curl http://localhost:4001
   ```

2. **Check Your IP Address**
   - Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update `src/config/api.js` with correct IP

3. **Firewall Issues**
   - Allow port 4001 through Windows Firewall
   - Disable antivirus temporarily to test

4. **Network Issues**
   - Ensure phone and computer are on same WiFi network
   - Try disabling VPN if active

### CORS Errors
The server is configured to accept requests from:
- localhost (127.0.0.1)
- Local network IPs (10.x.x.x, 192.168.x.x)
- Expo development URLs (exp://)

## 📊 MongoDB Data Structure

### User Schema
```javascript
{
  address: String,           // Blockchain ID (unique)
  name: String,              // User's full name
  encryptedPrivateKey: String, // Optional encrypted user data
  registered: Boolean,       // Registration status
  lastSeen: Date,           // Last activity timestamp
  createdAt: Date,          // Account creation
  updatedAt: Date           // Last update
}
```

## 🔐 Security Notes

1. **Environment Variables**: Never commit `.env` with real credentials to Git
2. **CORS Configuration**: Currently allows all local IPs for development
3. **Production**: Update CORS and use HTTPS in production
4. **MongoDB**: Use strong passwords and enable IP whitelisting

## 📝 Development Tips

### View Server Logs
Watch for these indicators:
- `✓` Success messages in green
- `✗` Error messages in red
- MongoDB connection status
- User registration/login attempts

### Test with curl
```bash
# Test registration
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"address":"TEST-1234-5678-ABCD","name":"Test User"}'

# Test login
curl -X POST http://localhost:4001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"address":"TEST-1234-5678-ABCD"}'
```

### MongoDB Atlas Dashboard
View your data at: https://cloud.mongodb.com
- Navigate to Collections → eRakshaSetu → users

## 🎯 Next Steps

1. ✅ Server running on port 4001
2. ✅ MongoDB connected
3. ✅ CORS configured for Expo
4. ✅ API endpoints ready
5. 📱 Update React Native app with your IP
6. 🧪 Test registration from Expo app
7. 🎉 Start building features!

## 📞 Support

If you encounter issues:
1. Check server console for error messages
2. Verify MongoDB connection in `.env`
3. Ensure phone and PC are on same network
4. Check firewall settings
5. Review API configuration in React Native app

---

**Server Version**: 1.0.0  
**Last Updated**: November 16, 2025
