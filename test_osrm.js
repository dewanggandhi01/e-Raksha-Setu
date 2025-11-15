// Test OSRM API directly
// Run with: node test_osrm.js

async function testOSRM() {
  try {
    // Test coordinates (Guwahati to Shillong)
    const startLng = 91.7362;
    const startLat = 26.1445;
    const destLng = 91.8933;
    const destLat = 25.5788;

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?alternatives=true&overview=full&geometries=geojson&steps=true&continue_straight=false`;

    console.log('🔍 Testing OSRM API...');
    console.log('URL:', osrmUrl);
    console.log('');

    const response = await fetch(osrmUrl);
    const data = await response.json();

    console.log('📊 OSRM Response Status:', data.code);
    console.log('🛣️  Number of routes:', data.routes ? data.routes.length : 0);
    console.log('');

    if (data.routes && data.routes.length > 0) {
      data.routes.forEach((route, index) => {
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.round(route.duration / 60);
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        console.log(`Route ${index + 1}:`);
        console.log(`  Distance: ${distanceKm} km`);
        console.log(`  Duration: ${durationStr}`);
        console.log(`  Waypoints: ${route.geometry.coordinates.length}`);
        console.log('');
      });

      console.log('✅ OSRM API is working correctly!');
    } else {
      console.log('❌ No routes found');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing OSRM:', error.message);
  }
}

testOSRM();
