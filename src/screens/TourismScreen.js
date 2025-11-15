import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const TOURISM_DATA = {
  'Arunachal Pradesh': {
    description: "Popularly known as 'Land of the Dawn-lit-Mountains', Arunachal Pradesh is India's remotest state and the first Indian soil to greet the rising sun. Located on the northeastern tip of India, its borders touch Tibet, Bhutan, and Burma (Myanmar). This beautiful land is endowed with a dazzling array of flora and fauna that is sure to allure any tourist.\n\nMore than 500 rare species of Orchids are found in the dense jungles of Arunachal Pradesh. The misty hills, sparkling rivers, and gurgling waterfalls add charm to the beauty of this incredible land. Arunachal Pradesh finds its mention in the literature of the Kalika Purana and the great Hindu Epic Mahabharata. It is believed to be the Prabhu Mountains of the Puranas.",
    stats: {
      districts: 28,
      area: '83,743 sq km',
      statehood: 1987,
      governor: 'Lt. General Kaiwalya Trivikram Parnaik (Retd.)',
      chiefMinister: 'Shri Pema Khandu',
      chiefSecretary: 'Shri Manish Gupta, IAS(AGMUT:91)'
    },
    places: [
      {
        id: 1,
        name: 'Tawang',
        description: "One of India's most spiritual and scenic towns, famous for monasteries, lakes, snow peaks, and Indo-China border",
        image: '🏛️',
        lat: 27.5860,
        lng: 91.8697,
        altitude: '10,000 ft',
        bestTime: 'March–June and September–November',
        duration: '3–5 days',
        temperature: 'Summer: 10–18°C, Winter: −10 to 5°C',
        safetyRating: '⭐⭐⭐',
        network: 'BSNL strongest, Jio/Airtel weak',
        highlights: ['Tawang Monastery (2nd largest in world)', 'Sela Pass', '108 Mani Lake', 'Tawang War Memorial'],
        thingsToDo: ['Visit Tawang Monastery', 'Trek to Gorichen Peak', 'Visit Madhuri Lake', 'Snow activities at Sela Pass'],
        nearestAirport: 'Tezpur Airport (160 km)',
        nearestPolice: 'Tawang Police Station: +91-3794-222222',
        nearestHospital: 'Tawang District Hospital',
        hotels: ['Budget: Zax Star Hotel', 'Mid-Range: Tawang Tourism Lodge', 'Luxury: Dolma Residency']
      },
      {
        id: 2,
        name: 'Sela Pass',
        description: 'High mountain pass connecting Tawang; snow-covered almost all year with eternal snowfields',
        image: '❄️',
        lat: 27.5115,
        lng: 92.0999,
        altitude: '13,700 ft',
        bestTime: 'October–May',
        safetyRating: '⭐⭐',
        network: 'Almost no network, BSNL sometimes',
        highlights: ['Sela Lake', 'Eternal snowfields', 'Himalayan views'],
        thingsToDo: ['Photography', 'Lake walk', 'Snow trekking']
      },
      {
        id: 3,
        name: 'Ziro Valley',
        description: 'UNESCO World Heritage tentative site; home of the Apatani tribe with paddy fields',
        image: '🏔️',
        lat: 27.5948,
        lng: 93.8190,
        altitude: '5,500 ft',
        bestTime: 'March–October',
        duration: '2–3 days',
        temperature: '10–24°C',
        safetyRating: '⭐⭐⭐⭐',
        highlights: ['Ziro Music Festival', 'Paddy fields', 'Tribal village tour'],
        thingsToDo: ['Visit Hong Village', 'Trek to Dolo Mando', 'Explore Talley Valley Wildlife Sanctuary'],
        nearestAirport: 'Lilabari'
      },
      {
        id: 4,
        name: 'Bomdila',
        description: 'Gateway town to Tawang; famous for monasteries, markets, and mountain views',
        image: '🏯',
        lat: 27.2648,
        lng: 92.4240,
        altitude: '8,500 ft',
        safetyRating: '⭐⭐⭐',
        highlights: ['Bomdila Monastery', 'Apple orchards', 'Viewpoints']
      },
      {
        id: 5,
        name: 'Dirang',
        description: 'Valley town with hot springs, orchards, and yak farms',
        image: '🌲',
        lat: 27.3660,
        lng: 92.2405,
        highlights: ['Dirang Dzong', 'Hot Water Springs', 'Thupsung Dhargye Monastery'],
        thingsToDo: ['River rafting', 'Trout fishing']
      },
      {
        id: 6,
        name: 'Namdapha National Park',
        description: 'Fourth largest national park; dense forests and rare species including clouded leopards',
        image: '🐆',
        lat: 27.4914,
        lng: 96.3922,
        safetyRating: '⭐⭐',
        highlights: ['Hoolock gibbons', 'Rare clouded leopards', 'Jungle trekking']
      },
      {
        id: 7,
        name: 'Mechuka Valley',
        description: 'Scenic valley with wooden houses, old monasteries, and snow mountains',
        image: '🧘',
        lat: 28.5862,
        lng: 94.1170,
        safetyRating: '⭐⭐⭐',
        highlights: ['Snow mountains', 'Buddhist villages', 'Siyom River']
      },
      {
        id: 8,
        name: 'Pasighat',
        description: 'Oldest town; gateway to Siang River and adventure activities',
        image: '🏖️',
        lat: 28.0667,
        lng: 95.3333,
        safetyRating: '⭐⭐⭐⭐',
        highlights: ['River rafting', 'Hanging bridge walk', 'Daying Ering Wildlife Sanctuary']
      },
      {
        id: 9,
        name: 'Aalo (Along)',
        description: 'Town of the Adi tribe; rivers, valleys, and traditional hanging bridges',
        image: '🌉',
        lat: 28.1715,
        lng: 94.8020,
        highlights: ['Hanging bridges', 'Patum Bridge', 'Darka Village']
      },
      {
        id: 10,
        name: 'Itanagar',
        description: 'Capital city and cultural center with historical forts and temples',
        image: '🎨',
        lat: 27.0844,
        lng: 93.6053,
        safetyRating: '⭐⭐⭐⭐',
        highlights: ['Ita Fort', 'Ganga Lake', 'Gompa Temple', 'Museums']
      },
      {
        id: 11,
        name: 'Roing',
        description: 'Town with historical Bhismaknagar Fort and scenic Mayudia Pass',
        image: '🔥',
        lat: 28.1550,
        lng: 95.8359,
        safetyRating: '⭐⭐⭐⭐',
        highlights: ['Bhismaknagar Fort', 'Mayudia Pass (snow)', 'Sally Lake']
      },
      {
        id: 12,
        name: 'Anini',
        description: 'Remote and beautiful town in Dibang Valley with snow mountains',
        image: '🌄',
        lat: 28.9593,
        lng: 95.9123,
        safetyRating: '⭐⭐',
        highlights: ['Dibang Valley', 'Snow mountains', 'Remote beauty']
      },
      {
        id: 13,
        name: 'Talle Valley Wildlife Sanctuary',
        description: 'Eco hotspot with rare birds and plants in pristine forest',
        image: '🗻',
        lat: 27.5445,
        lng: 93.8293,
        highlights: ['Rare birds', 'Unique flora', 'Eco tourism']
      },
      {
        id: 14,
        name: 'Pangsau Pass',
        description: 'Beautiful Indo-Myanmar border pass with scenic mountain views',
        image: '🏞️',
        lat: 27.3567,
        lng: 96.1753,
        highlights: ['Indo-Myanmar border', 'Mountain views', 'Historical significance']
      },
      {
        id: 15,
        name: 'Golden Pagoda, Namsai',
        description: 'Famous Buddhist temple complex with golden architecture',
        image: '🏯',
        lat: 27.7056,
        lng: 95.9969,
        highlights: ['Buddhist temple', 'Golden architecture', 'Cultural center']
      }
    ],
    festivals: [
      { name: 'Losar Festival', month: 'February', description: 'Tibetan New Year celebration' },
      { name: 'Ziro Music Festival', month: 'September', description: 'Outdoor music festival in Ziro Valley' },
      { name: 'Mopin Festival', month: 'April', description: 'Agricultural festival of Galo tribe' }
    ]
  },
  'Assam': {
    places: [
      {
        id: 4,
        name: 'Kaziranga National Park',
        description: 'UNESCO World Heritage Site, home to one-horned rhinoceros',
        image: '🦏',
        lat: 26.5775,
        lng: 93.1711,
        highlights: ['One-horned Rhino', 'Tigers', 'Elephants', 'Wildlife Safari']
      },
      {
        id: 5,
        name: 'Kamakhya Temple',
        description: 'Ancient Shakti Pitha temple on Nilachal Hill',
        image: '🕉️',
        lat: 26.1656,
        lng: 91.7050,
        highlights: ['Shakti Pitha', 'Ambubachi Mela', 'Ten Mahavidyas']
      },
      {
        id: 6,
        name: 'Majuli Island',
        description: 'World\'s largest river island on Brahmaputra',
        image: '🏝️',
        lat: 26.9500,
        lng: 94.2167,
        highlights: ['Satras', 'Mask Making', 'Neo-Vaishnavite Culture']
      },
      {
        id: 7,
        name: 'Sivasagar',
        description: 'Former Ahom Kingdom capital with temples and palaces',
        image: '🏛️',
        lat: 26.9840,
        lng: 94.6411,
        highlights: ['Shiva Temple', 'Ahom Palaces', 'Tea Gardens']
      }
    ],
    festivals: [
      { name: 'Bihu Festival', month: 'April, October, January', description: 'Assamese New Year & harvest festival' },
      { name: 'Ambubachi Mela', month: 'June', description: 'Annual congregation at Kamakhya Temple' },
      { name: 'Tea Festival', month: 'November', description: 'Celebrating Assam\'s tea heritage' }
    ]
  },
  'Meghalaya': {
    places: [
      {
        id: 8,
        name: 'Shillong',
        description: 'Scotland of the East, voted India\'s Favourite Hill Station',
        image: '⛰️',
        lat: 25.5788,
        lng: 91.8933,
        highlights: ['Shillong Peak', 'Elephant Falls', 'Don Bosco Museum']
      },
      {
        id: 9,
        name: 'Cherrapunji',
        description: 'Wettest place on Earth with spectacular waterfalls',
        image: '💧',
        lat: 25.2654,
        lng: 91.7321,
        highlights: ['Nohkalikai Falls', 'Living Root Bridges', 'Seven Sisters Falls']
      },
      {
        id: 10,
        name: 'Mawlynnong',
        description: 'Cleanest Village in Asia (2003), near Bangladesh border',
        image: '🏡',
        lat: 25.2025,
        lng: 91.9464,
        highlights: ['Sky View', 'Living Root Bridge', 'Clean Village']
      },
      {
        id: 11,
        name: 'Dawki',
        description: 'Crystal clear Umngot River at Bangladesh border',
        image: '🌊',
        lat: 25.1825,
        lng: 92.0083,
        highlights: ['Umngot River', 'Boat Rides', 'Bangladesh Border']
      }
    ],
    festivals: [
      { name: 'Shad Suk Mynsiem', month: 'April', description: 'Thanksgiving dance festival of Khasi tribe' },
      { name: 'Nongkrem Dance', month: 'November', description: 'Five-day religious festival' },
      { name: 'Wangala Festival', month: 'November', description: 'Harvest festival of Garo tribe' }
    ]
  },
  'Manipur': {
    places: [
      {
        id: 12,
        name: 'Loktak Lake',
        description: 'Largest freshwater lake in NE with floating islands',
        image: '🌊',
        lat: 24.5167,
        lng: 93.8167,
        highlights: ['Floating Phumdis', 'Keibul Lamjao National Park', 'Sangai Deer']
      },
      {
        id: 13,
        name: 'Moirang',
        description: 'INA flag first hoisted here, rich Meitei culture',
        image: '🏛️',
        lat: 24.4833,
        lng: 93.7833,
        highlights: ['INA Museum', 'Loktak Lake View', 'Historical Significance']
      },
      {
        id: 14,
        name: 'Ima Keithel',
        description: 'Asia\'s largest all-women market with 3000+ vendors',
        image: '🛍️',
        lat: 24.8070,
        lng: 93.9370,
        highlights: ['Women\'s Market', 'Handlooms', 'Local Produce']
      }
    ],
    festivals: [
      { name: 'Yaoshang', month: 'March', description: 'Manipuri Holi festival' },
      { name: 'Lai Haraoba', month: 'April-May', description: 'Traditional Meitei festival' },
      { name: 'Sangai Festival', month: 'November', description: 'State festival celebrating culture' }
    ]
  },
  'Mizoram': {
    places: [
      {
        id: 15,
        name: 'Aizawl',
        description: 'Capital city at 1132m, set on steep ridges',
        image: '🏔️',
        lat: 23.7271,
        lng: 92.7176,
        highlights: ['Solomon\'s Temple', 'Durtlang Hills', 'Museums']
      },
      {
        id: 16,
        name: 'Vantawng Falls',
        description: 'Highest waterfall in Mizoram at 750 feet',
        image: '💦',
        lat: 23.4833,
        lng: 92.9833,
        highlights: ['750ft Waterfall', 'Scenic Beauty', 'Trekking']
      }
    ],
    festivals: [
      { name: 'Chapchar Kut', month: 'March', description: 'Spring festival after jhum operations' },
      { name: 'Mim Kut', month: 'August-September', description: 'Maize harvest festival' },
      { name: 'Pawl Kut', month: 'December', description: 'Harvest festival' }
    ]
  },
  'Nagaland': {
    places: [
      {
        id: 17,
        name: 'Kohima War Cemetery',
        description: 'WWII memorial for Battle of Kohima',
        image: '🕊️',
        lat: 25.6640,
        lng: 94.1078,
        highlights: ['War Memorial', 'British Cemetery', 'Historical Site']
      },
      {
        id: 18,
        name: 'Dzukou Valley',
        description: 'Valley of flowers, scenic trekking destination',
        image: '🌸',
        lat: 25.5500,
        lng: 94.0833,
        highlights: ['Seasonal Flowers', 'Trekking', 'Natural Beauty']
      },
      {
        id: 19,
        name: 'Khonoma Village',
        description: 'Green village, first to resist British rule',
        image: '🏡',
        lat: 25.6167,
        lng: 94.0500,
        highlights: ['Eco-tourism', 'Historical Village', 'Angami Culture']
      }
    ],
    festivals: [
      { name: 'Hornbill Festival', month: 'December 1-10', description: 'Festival of Festivals showcasing all tribes' },
      { name: 'Moatsu Festival', month: 'May', description: 'Ao tribe post-sowing festival' },
      { name: 'Sekrenyi Festival', month: 'February', description: 'Angami tribe purification festival' }
    ]
  },
  'Sikkim': {
    places: [
      {
        id: 20,
        name: 'Gangtok',
        description: 'Capital with spectacular Kanchenjunga views',
        image: '🏔️',
        lat: 27.3389,
        lng: 88.6065,
        highlights: ['MG Marg', 'Rumtek Monastery', 'Cable Car']
      },
      {
        id: 21,
        name: 'Tsomgo Lake',
        description: 'Glacial lake at 12,400 ft altitude',
        image: '🌊',
        lat: 27.3333,
        lng: 88.7500,
        highlights: ['Changu Lake', 'Yak Rides', 'Snow Views']
      },
      {
        id: 22,
        name: 'Rumtek Monastery',
        description: 'Largest monastery in Sikkim with Tibetan architecture',
        image: '🛕',
        lat: 27.2833,
        lng: 88.5667,
        highlights: ['Golden Stupa', 'Tibetan Art', 'Prayer Wheels']
      }
    ],
    festivals: [
      { name: 'Losar', month: 'February', description: 'Tibetan New Year' },
      { name: 'Saga Dawa', month: 'May-June', description: 'Buddha\'s birthday celebration' },
      { name: 'Pang Lhabsol', month: 'August', description: 'Guardian deity festival' }
    ]
  },
  'Tripura': {
    places: [
      {
        id: 23,
        name: 'Ujjayanta Palace',
        description: 'Former royal palace, now state museum',
        image: '🏰',
        lat: 23.8368,
        lng: 91.2791,
        highlights: ['Mughal Gardens', 'Museum', 'Royal Architecture']
      },
      {
        id: 24,
        name: 'Tripura Sundari Temple',
        description: 'One of 51 Shakti Peethas',
        image: '🕉️',
        lat: 23.5333,
        lng: 91.4833,
        highlights: ['Shakti Pitha', 'Diwali Fair', 'Ancient Temple']
      },
      {
        id: 25,
        name: 'Neermahal',
        description: 'Lake palace in Rudrasagar Lake',
        image: '🏛️',
        lat: 23.5767,
        lng: 91.5333,
        highlights: ['Water Palace', 'Boat Rides', 'Sound & Light Show']
      },
      {
        id: 26,
        name: 'Unakoti',
        description: 'Rock carvings from 7th-9th century, one less than crore images',
        image: '🗿',
        lat: 24.3167,
        lng: 92.0833,
        highlights: ['Ancient Carvings', 'Shiva Images', 'Waterfalls']
      }
    ],
    festivals: [
      { name: 'Kharchi Puja', month: 'July', description: 'Worship of 14 deities' },
      { name: 'Garia Puja', month: 'April', description: 'Harvest festival of Tripuri tribe' },
      { name: 'Ker Puja', month: 'July-August', description: 'Royal tribal festival' }
    ]
  }
};

const HOTELS_DATA = [
  {
    id: 1,
    name: 'Hotel Brahmaputra Ashok',
    location: 'Guwahati, Assam',
    rating: 4.2,
    price: '₹3,500',
    image: '🏨',
    amenities: ['WiFi', 'Restaurant', 'Pool', 'Parking'],
    type: 'Luxury'
  },
  {
    id: 2,
    name: 'Vivanta Guwahati',
    location: 'Guwahati, Assam',
    rating: 4.5,
    price: '₹5,200',
    image: '🏨',
    amenities: ['WiFi', 'Spa', 'Gym', 'Restaurant'],
    type: 'Premium'
  },
  {
    id: 3,
    name: 'Wild Grass Lodge',
    location: 'Kaziranga, Assam',
    rating: 4.3,
    price: '₹4,800',
    image: '🏨',
    amenities: ['Safari', 'Restaurant', 'Garden', 'WiFi'],
    type: 'Resort'
  },
  {
    id: 4,
    name: 'Hotel Polo Towers',
    location: 'Shillong, Meghalaya',
    rating: 4.4,
    price: '₹4,200',
    image: '🏨',
    amenities: ['WiFi', 'Restaurant', 'Room Service', 'Bar'],
    type: 'Luxury'
  },
  {
    id: 5,
    name: 'Ri Kynjai Resort',
    location: 'Shillong, Meghalaya',
    rating: 4.6,
    price: '₹6,500',
    image: '🏨',
    amenities: ['Lake View', 'Spa', 'Restaurant', 'Activities'],
    type: 'Premium'
  },
  {
    id: 6,
    name: 'Hotel Elgin Nor-Khill',
    location: 'Gangtok, Sikkim',
    rating: 4.5,
    price: '₹7,800',
    image: '🏨',
    amenities: ['Heritage', 'Restaurant', 'Library', 'Garden'],
    type: 'Heritage'
  },
];

export default function TourismScreen({ navigation, route }) {
  const { destinationLocation } = route.params || {};
  const [selectedState, setSelectedState] = useState(null);
  const [activeTab, setActiveTab] = useState('places');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showHotelModal, setShowHotelModal] = useState(false);

  // Extract state from destination location
  React.useEffect(() => {
    if (destinationLocation) {
      // Try to match destination with states
      const states = Object.keys(TOURISM_DATA);
      const matchedState = states.find(state => 
        destinationLocation.toLowerCase().includes(state.toLowerCase()) ||
        TOURISM_DATA[state].places.some(place => 
          place.name.toLowerCase().includes(destinationLocation.toLowerCase())
        )
      );
      if (matchedState) {
        setSelectedState(matchedState);
      } else {
        // Default to Assam if no match
        setSelectedState('Assam');
      }
    } else {
      setSelectedState('Assam');
    }
  }, [destinationLocation]);

  const stateData = selectedState ? TOURISM_DATA[selectedState] : null;

  const openGoogleMaps = (lat, lng, name) => {
    const url = Platform.select({
      ios: `comgooglemaps://?q=${lat},${lng}&zoom=14`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${name})`,
    });
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(webUrl);
      }
    });
  };

  const renderPlaceCard = (place) => (
    <TouchableOpacity
      key={place.id}
      style={styles.placeCard}
      onPress={() => setSelectedPlace(place)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[theme.colors.surface, `${theme.colors.primary}05`]}
        style={styles.placeGradient}
      >
        <View style={styles.placeHeader}>
          <View style={styles.placeIcon}>
            <Text style={styles.placeEmoji}>{place.image}</Text>
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeDescription}>{place.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.highlightsContainer}>
          {place.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightChip}>
              <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHotelCard = (hotel) => (
    <TouchableOpacity
      key={hotel.id}
      style={styles.hotelCard}
      activeOpacity={0.7}
    >
      <View style={styles.hotelImageContainer}>
        <Text style={styles.hotelEmoji}>{hotel.image}</Text>
        <View style={styles.hotelTypeBadge}>
          <Text style={styles.hotelTypeText}>{hotel.type}</Text>
        </View>
      </View>
      <View style={styles.hotelDetails}>
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{hotel.rating}</Text>
          </View>
        </View>
        <View style={styles.hotelLocationRow}>
          <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.hotelLocation}>{hotel.location}</Text>
        </View>
        <View style={styles.amenitiesRow}>
          {hotel.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
        <View style={styles.hotelFooter}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceValue}>{hotel.price}/night</Text>
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFestivalCard = (festival, index) => (
    <View key={index} style={styles.festivalCard}>
      <View style={styles.festivalHeader}>
        <View style={styles.festivalIcon}>
          <Ionicons name="calendar" size={24} color={theme.colors.accent} />
        </View>
        <View style={styles.festivalInfo}>
          <Text style={styles.festivalName}>{festival.name}</Text>
          <Text style={styles.festivalMonth}>{festival.month}</Text>
        </View>
      </View>
      <Text style={styles.festivalDescription}>{festival.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Explore Northeast</Text>
            <Text style={styles.headerSubtitle}>Places, Festivals & Culture</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* State Selector */}
          <View style={styles.stateSelectorContainer}>
            <Text style={styles.sectionTitle}>Select State</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
              {Object.keys(TOURISM_DATA).map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateChip,
                    selectedState === state && styles.stateChipSelected
                  ]}
                  onPress={() => setSelectedState(state)}
                >
                  <Text style={[
                    styles.stateChipText,
                    selectedState === state && styles.stateChipTextSelected
                  ]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* State Information */}
          {stateData && stateData.description && (
            <View style={styles.stateInfoContainer}>
              <Text style={styles.stateInfoTitle}>{selectedState}</Text>
              <Text style={styles.stateInfoDescription}>{stateData.description}</Text>
              {stateData.stats && (
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stateData.stats.districts}</Text>
                    <Text style={styles.statLabel}>Districts</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stateData.stats.area}</Text>
                    <Text style={styles.statLabel}>Area</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stateData.stats.statehood}</Text>
                    <Text style={styles.statLabel}>Statehood</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'places' && styles.tabActive]}
              onPress={() => setActiveTab('places')}
            >
              <Ionicons 
                name="location" 
                size={20} 
                color={activeTab === 'places' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'places' && styles.tabTextActive
              ]}>
                Places
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'hotels' && styles.tabActive]}
              onPress={() => setActiveTab('hotels')}
            >
              <Ionicons 
                name="bed" 
                size={20} 
                color={activeTab === 'hotels' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'hotels' && styles.tabTextActive
              ]}>
                Hotels
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'festivals' && styles.tabActive]}
              onPress={() => setActiveTab('festivals')}
            >
              <Ionicons 
                name="sparkles" 
                size={20} 
                color={activeTab === 'festivals' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'festivals' && styles.tabTextActive
              ]}>
                Festivals
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {stateData && (
            <View style={styles.contentContainer}>
              {activeTab === 'places' && (
                <View>
                  <Text style={styles.contentHeader}>
                    {stateData.places.length} Amazing Places in {selectedState}
                  </Text>
                  {stateData.places.map(renderPlaceCard)}
                </View>
              )}

              {activeTab === 'hotels' && (
                <View>
                  <Text style={styles.contentHeader}>
                    Best Hotels & Stays
                  </Text>
                  <Text style={styles.contentSubheader}>
                    Handpicked accommodations for your comfortable stay
                  </Text>
                  {HOTELS_DATA.map(renderHotelCard)}
                </View>
              )}

              {activeTab === 'festivals' && (
                <View>
                  <Text style={styles.contentHeader}>
                    Celebrate {selectedState}'s Culture
                  </Text>
                  {stateData.festivals.map(renderFestivalCard)}
                </View>
              )}
            </View>
          )}

          {/* Place Details Modal */}
          {selectedPlace && (
            <View style={styles.modalOverlay}>
              <TouchableOpacity 
                style={styles.modalBackdrop}
                onPress={() => setSelectedPlace(null)}
                activeOpacity={1}
              />
              <View style={styles.placeDetailModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconLarge}>
                      <Text style={styles.modalEmoji}>{selectedPlace.image}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setSelectedPlace(null)}
                    >
                      <Ionicons name="close-circle" size={32} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                  <Text style={styles.modalDescription}>{selectedPlace.description}</Text>
                  
                  {/* Travel Info Grid */}
                  {(selectedPlace.altitude || selectedPlace.bestTime || selectedPlace.safetyRating) && (
                    <View style={styles.travelInfoGrid}>
                      {selectedPlace.altitude && (
                        <View style={styles.infoBox}>
                          <Ionicons name="trending-up" size={18} color={theme.colors.primary} />
                          <Text style={styles.infoLabel}>Altitude</Text>
                          <Text style={styles.infoValue}>{selectedPlace.altitude}</Text>
                        </View>
                      )}
                      {selectedPlace.bestTime && (
                        <View style={styles.infoBox}>
                          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
                          <Text style={styles.infoLabel}>Best Time</Text>
                          <Text style={styles.infoValue}>{selectedPlace.bestTime}</Text>
                        </View>
                      )}
                      {selectedPlace.safetyRating && (
                        <View style={styles.infoBox}>
                          <Ionicons name="shield-checkmark" size={18} color={theme.colors.primary} />
                          <Text style={styles.infoLabel}>Safety</Text>
                          <Text style={styles.infoValue}>{selectedPlace.safetyRating}</Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {/* Additional Details */}
                  {selectedPlace.temperature && (
                    <View style={styles.detailRow}>
                      <Ionicons name="thermometer" size={18} color={theme.colors.info} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Temperature</Text>
                        <Text style={styles.detailValue}>{selectedPlace.temperature}</Text>
                      </View>
                    </View>
                  )}
                  {selectedPlace.duration && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={18} color={theme.colors.warning} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Duration Needed</Text>
                        <Text style={styles.detailValue}>{selectedPlace.duration}</Text>
                      </View>
                    </View>
                  )}
                  {selectedPlace.network && (
                    <View style={styles.detailRow}>
                      <Ionicons name="wifi" size={18} color={theme.colors.success} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Network</Text>
                        <Text style={styles.detailValue}>{selectedPlace.network}</Text>
                      </View>
                    </View>
                  )}
                  {selectedPlace.nearestAirport && (
                    <View style={styles.detailRow}>
                      <Ionicons name="airplane" size={18} color={theme.colors.primary} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Nearest Airport</Text>
                        <Text style={styles.detailValue}>{selectedPlace.nearestAirport}</Text>
                      </View>
                    </View>
                  )}
                  
                  <Text style={styles.modalSectionTitle}>Highlights</Text>
                  {selectedPlace.highlights.map((highlight, index) => (
                    <View key={index} style={styles.modalHighlightRow}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                      <Text style={styles.modalHighlightText}>{highlight}</Text>
                    </View>
                  ))}
                  
                  {selectedPlace.thingsToDo && selectedPlace.thingsToDo.length > 0 && (
                    <>
                      <Text style={styles.modalSectionTitle}>Things to Do</Text>
                      {selectedPlace.thingsToDo.map((activity, index) => (
                        <View key={index} style={styles.modalHighlightRow}>
                          <Ionicons name="compass" size={20} color={theme.colors.primary} />
                          <Text style={styles.modalHighlightText}>{activity}</Text>
                        </View>
                      ))}
                    </>
                  )}
                  
                  {selectedPlace.hotels && selectedPlace.hotels.length > 0 && (
                    <>
                      <Text style={styles.modalSectionTitle}>Accommodation</Text>
                      {selectedPlace.hotels.map((hotel, index) => (
                        <View key={index} style={styles.modalHighlightRow}>
                          <Ionicons name="bed" size={20} color={theme.colors.warning} />
                          <Text style={styles.modalHighlightText}>{hotel}</Text>
                        </View>
                      ))}
                    </>
                  )}
                  
                  {/* Emergency Info */}
                  {(selectedPlace.nearestPolice || selectedPlace.nearestHospital) && (
                    <>
                      <Text style={styles.modalSectionTitle}>Emergency Contact</Text>
                      {selectedPlace.nearestPolice && (
                        <View style={styles.emergencyRow}>
                          <Ionicons name="shield" size={20} color={theme.colors.error} />
                          <Text style={styles.emergencyText}>{selectedPlace.nearestPolice}</Text>
                        </View>
                      )}
                      {selectedPlace.nearestHospital && (
                        <View style={styles.emergencyRow}>
                          <Ionicons name="medical" size={20} color={theme.colors.error} />
                          <Text style={styles.emergencyText}>{selectedPlace.nearestHospital}</Text>
                        </View>
                      )}
                    </>
                  )}
                  
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.modalActionButton}
                      onPress={() => {
                        openGoogleMaps(selectedPlace.lat, selectedPlace.lng, selectedPlace.name);
                        setSelectedPlace(null);
                      }}
                    >
                      <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.modalActionGradient}
                      >
                        <Ionicons name="navigate" size={20} color="#fff" />
                        <Text style={styles.modalActionText}>Get Directions</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.modalActionButton}
                      onPress={() => {
                        setSelectedPlace(null);
                        setActiveTab('hotels');
                      }}
                    >
                      <View style={styles.modalActionOutline}>
                        <Ionicons name="bed" size={20} color={theme.colors.primary} />
                        <Text style={styles.modalActionTextOutline}>Find Hotels</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="bed" size={32} color="#fff" />
                  <Text style={styles.quickActionText}>Hotels</Text>
                  <Text style={styles.quickActionSubtext}>Find Stay</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="navigate-circle" size={32} color="#fff" />
                  <Text style={styles.quickActionText}>Live Track</Text>
                  <Text style={styles.quickActionSubtext}>Monitor Trip</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('Emergency')}
              >
                <LinearGradient
                  colors={['#FF4757', '#FF3838']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="alert-circle" size={32} color="#fff" />
                  <Text style={styles.quickActionText}>Emergency</Text>
                  <Text style={styles.quickActionSubtext}>SOS Help</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('Profile')}
              >
                <LinearGradient
                  colors={['#5F27CD', '#341F97']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="person-circle" size={32} color="#fff" />
                  <Text style={styles.quickActionText}>Profile</Text>
                  <Text style={styles.quickActionSubtext}>My Account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  stateSelectorContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  stateScroll: {
    flexDirection: 'row',
  },
  stateChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full || 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  stateChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stateChipText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  stateChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  stateInfoContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  stateInfoTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  stateInfoDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    textAlign: 'justify',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.xs,
  },
  tabActive: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  tabText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  contentHeader: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  placeCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  placeGradient: {
    padding: theme.spacing.lg,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  placeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  placeEmoji: {
    fontSize: 28,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  placeDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}15`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  highlightText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.success,
    fontWeight: '500',
  },
  festivalCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  festivalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  festivalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  festivalInfo: {
    flex: 1,
  },
  festivalName: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  festivalMonth: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  festivalDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  quickActionsSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: theme.spacing.sm,
  },
  quickActionSubtext: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  contentSubheader: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    marginTop: -theme.spacing.sm,
  },
  hotelCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  hotelImageContainer: {
    height: 120,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hotelEmoji: {
    fontSize: 48,
  },
  hotelTypeBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  hotelTypeText: {
    fontSize: theme.fonts.sizes.xs,
    color: '#fff',
    fontWeight: '600',
  },
  hotelDetails: {
    padding: theme.spacing.md,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  hotelName: {
    flex: 1,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}15`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.success,
  },
  hotelLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 4,
  },
  hotelLocation: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  amenityChip: {
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  amenityText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  bookButtonText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  placeDetailModal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl || 24,
    borderTopRightRadius: theme.borderRadius.xl || 24,
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  modalIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 50,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  modalDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    lineHeight: 22,
  },
  modalSectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  modalHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  modalHighlightText: {
    flex: 1,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  travelInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.lg,
  },
  infoBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: `${theme.colors.primary}08`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  infoValue: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.error}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  emergencyText: {
    flex: 1,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  modalActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  modalActionText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  modalActionOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  modalActionTextOutline: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
