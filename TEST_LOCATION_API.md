# Testing Location & Nearby Places API

## How to Test and Debug the Map Feature

### 1. Check Console Logs

When you open the MonitoringDashboard screen, look for these console messages:

```
🔍 Fetching nearby places for coordinates: [latitude], [longitude]
📡 Fetching hospitals from Overpass API...
✅ Received X hospital elements from API
✅ Found X hospitals within 5km
Hospital names: Hospital 1, Hospital 2, etc.
📡 Fetching police stations from Overpass API...
✅ Received X police station elements from API
✅ Found X police stations within 5km
Police station names: Station 1, Station 2, etc.
```

### 2. Common Issues and Solutions

#### Issue: "No hospitals or police stations found"
**Possible causes:**
- You're in a rural/remote area with limited OpenStreetMap data
- Internet connection issues
- The 5km radius doesn't include any facilities

**Solutions:**
- Try the refresh button (circular arrow icon)
- Move to a more populated area
- Check your internet connection
- Wait for GPS to get accurate coordinates

#### Issue: "Unable to Load Nearby Facilities"
**Possible causes:**
- No internet connection
- Overpass API is down or rate-limited
- Request timeout (15 seconds)

**Solutions:**
- Check internet connectivity
- Click "Retry" in the alert dialog
- Use the refresh button after a few moments
- Try again later if API is rate-limited

#### Issue: Markers not visible on map
**Possible causes:**
- Filter buttons are turned off (gray instead of blue/red)
- Zoom level is too far out
- No data available for the area

**Solutions:**
- Click the hospital (red +) and police (blue shield) filter buttons to toggle them on
- Zoom in on the map
- Check the counter on the filter buttons (should show a number > 0)

### 3. Manual Testing Steps

1. **Open the app and navigate to MonitoringDashboard**
2. **Wait for GPS to acquire location** (look for "Acquiring GPS Signal...")
3. **Check the filter button counters:**
   - Hospital button (red +): Should show count like "5"
   - Police button (blue shield): Should show count like "3"
4. **If showing "...":** Wait, it's still loading
5. **If showing "0":** Click the refresh button (circular arrow) at the bottom
6. **Zoom and pan the map** to see if markers appear

### 4. Test with Different Locations

If no places are found at your current location, try these test coordinates:

**Major Indian Cities with good OSM data:**
- Delhi: 28.6139, 77.2090
- Mumbai: 19.0760, 72.8777
- Bangalore: 12.9716, 77.5946
- Kolkata: 22.5726, 88.3639

**Arunachal Pradesh Cities:**
- Itanagar: 27.0844, 93.6053
- Tawang: 27.5860, 91.8590
- Bomdila: 27.2615, 92.4148

### 5. API Rate Limits

The Overpass API has rate limits:
- Maximum 2 requests per second
- If you get rate-limited, wait 1-2 minutes before retrying

### 6. Checking the Raw API Response

You can manually test the API by:

1. Get your current coordinates from the app
2. Open this URL in a browser (replace LAT and LON):

```
https://overpass-api.de/api/interpreter?data=[out:json][timeout:15];(node["amenity"="hospital"](around:5000,LAT,LON);way["amenity"="hospital"](around:5000,LAT,LON););out%20center;
```

Example for Delhi:
```
https://overpass-api.de/api/interpreter?data=[out:json][timeout:15];(node["amenity"="hospital"](around:5000,28.6139,77.2090);way["amenity"="hospital"](around:5000,28.6139,77.2090););out%20center;
```

### 7. What to Report if Issues Persist

If the problem continues, share:
1. Your approximate location (city/state)
2. Console log messages (copy them)
3. Filter button counter values
4. Any error messages displayed
5. Screenshot of the map view

### 8. Quick Fixes

**Quick Fix #1: Force Reload**
- Press the circular refresh button at the bottom of the screen

**Quick Fix #2: Toggle Tracking**
- Pause tracking, then resume it
- This will reset the location and refetch nearby places

**Quick Fix #3: Restart App**
- Close and reopen the app completely
- This resets all location services

### 9. Understanding the Filter Buttons

- **Hospital Button (Red +):**
  - Active (red background): Hospitals are shown on map
  - Inactive (white background): Hospitals are hidden
  - Number shows count of found hospitals

- **Police Button (Blue Shield):**
  - Active (blue background): Police stations are shown on map
  - Inactive (white background): Police stations are hidden
  - Number shows count of found police stations

### 10. Map Markers Legend

🔴 **Red Circle with +** = Hospital
🔵 **Blue Circle with Shield** = Police Station
📍 **Blue Arrow** = Your Current Location (rotates based on heading)
