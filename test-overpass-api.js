// Test script to verify Overpass API is working
// Run this in Node.js to test the API without the app

const testCoordinates = {
  delhi: { lat: 28.6139, lon: 77.2090, name: "Delhi" },
  mumbai: { lat: 19.0760, lon: 72.8777, name: "Mumbai" },
  bangalore: { lat: 12.9716, lon: 77.5946, name: "Bangalore" },
  itanagar: { lat: 27.0844, lon: 93.6053, name: "Itanagar, Arunachal Pradesh" },
  tawang: { lat: 27.5860, lon: 91.8590, name: "Tawang, Arunachal Pradesh" },
};

async function testOverpassAPI(lat, lon, locationName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing location: ${locationName}`);
  console.log(`Coordinates: ${lat}, ${lon}`);
  console.log('='.repeat(60));

  const radius = 5000; // 5km

  // Hospital Query
  const hospitalQuery = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      relation["amenity"="hospital"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
      way["healthcare"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"]["emergency"="yes"](around:${radius},${lat},${lon});
      way["amenity"="clinic"]["emergency"="yes"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  // Police Query
  const policeQuery = `
    [out:json][timeout:15];
    (
      node["amenity"="police"](around:${radius},${lat},${lon});
      way["amenity"="police"](around:${radius},${lat},${lon});
      relation["amenity"="police"](around:${radius},${lat},${lon});
      node["office"="police"](around:${radius},${lat},${lon});
      way["office"="police"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  try {
    // Test Hospitals
    console.log('\n🏥 Testing Hospital Query...');
    const hospitalStartTime = Date.now();
    const hospitalResponse = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(hospitalQuery)}`
    );
    const hospitalTime = Date.now() - hospitalStartTime;
    
    if (!hospitalResponse.ok) {
      console.error(`❌ Hospital API Error: ${hospitalResponse.status} ${hospitalResponse.statusText}`);
    } else {
      const hospitalData = await hospitalResponse.json();
      console.log(`✅ Hospital API Response received in ${hospitalTime}ms`);
      console.log(`   Total elements: ${hospitalData.elements?.length || 0}`);
      
      const hospitalNames = hospitalData.elements
        ?.filter(e => e.tags?.name)
        .map(e => e.tags.name)
        .slice(0, 10); // First 10
      
      if (hospitalNames && hospitalNames.length > 0) {
        console.log(`   Sample hospitals found:`);
        hospitalNames.forEach((name, i) => console.log(`     ${i + 1}. ${name}`));
        if (hospitalData.elements.length > 10) {
          console.log(`     ... and ${hospitalData.elements.length - 10} more`);
        }
      } else {
        console.log(`   ⚠️  No hospitals found within ${radius/1000}km`);
      }
    }

    // Wait 1 second to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Police Stations
    console.log('\n🚔 Testing Police Station Query...');
    const policeStartTime = Date.now();
    const policeResponse = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(policeQuery)}`
    );
    const policeTime = Date.now() - policeStartTime;
    
    if (!policeResponse.ok) {
      console.error(`❌ Police API Error: ${policeResponse.status} ${policeResponse.statusText}`);
    } else {
      const policeData = await policeResponse.json();
      console.log(`✅ Police API Response received in ${policeTime}ms`);
      console.log(`   Total elements: ${policeData.elements?.length || 0}`);
      
      const policeNames = policeData.elements
        ?.filter(e => e.tags?.name)
        .map(e => e.tags.name)
        .slice(0, 10); // First 10
      
      if (policeNames && policeNames.length > 0) {
        console.log(`   Sample police stations found:`);
        policeNames.forEach((name, i) => console.log(`     ${i + 1}. ${name}`));
        if (policeData.elements.length > 10) {
          console.log(`     ... and ${policeData.elements.length - 10} more`);
        }
      } else {
        console.log(`   ⚠️  No police stations found within ${radius/1000}km`);
      }
    }

    console.log(`\n✅ Test completed for ${locationName}`);
    
  } catch (error) {
    console.error(`\n❌ Error testing ${locationName}:`, error.message);
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('  OVERPASS API TEST SUITE');
  console.log('  Testing Hospital & Police Station Queries');
  console.log('═'.repeat(60));

  for (const [key, location] of Object.entries(testCoordinates)) {
    await testOverpassAPI(location.lat, location.lon, location.name);
    // Wait 2 seconds between locations to avoid rate limiting
    if (key !== Object.keys(testCoordinates)[Object.keys(testCoordinates).length - 1]) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  ALL TESTS COMPLETED');
  console.log('═'.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(console.error);

/* 
HOW TO USE THIS SCRIPT:

1. Save this file as test-overpass-api.js

2. Run in Node.js:
   node test-overpass-api.js

3. Or test a single location in browser console:
   - Open browser console (F12)
   - Paste the code above
   - Call: testOverpassAPI(28.6139, 77.2090, "Delhi")

4. What to look for:
   - ✅ = Success
   - ❌ = Error
   - Response times (should be under 5000ms)
   - Number of facilities found
   - Sample facility names

5. Troubleshooting:
   - If all locations return 0: Possible API issue or rate limiting
   - If some locations work: OSM data coverage varies by region
   - If timeout errors: Internet connection or API down
   - If 429 errors: Rate limited, wait a few minutes

6. Testing your own location:
   testOverpassAPI(YOUR_LAT, YOUR_LON, "My Location")
*/
