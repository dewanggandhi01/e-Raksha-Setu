# Advanced Map Analysis Tools for e-Raksha-Setu
# This script demonstrates how Python libraries can be used for map data analysis
# Note: This is for server-side analysis, not direct React Native integration

import folium
import geopandas as gpd
import networkx as nx
import pandas as pd
from geopy.distance import geodesic
import json

class TourismSafetyMapAnalyzer:
    """
    Advanced map analysis using Python libraries for tourism safety
    """
    
    def __init__(self, center_lat=28.6139, center_lng=77.2090):
        self.center = (center_lat, center_lng)
        self.map = None
        self.safety_data = []
        
    def create_interactive_map(self):
        """Create an interactive Folium map"""
        self.map = folium.Map(
            location=self.center,
            zoom_start=13,
            tiles='OpenStreetMap'
        )
        
        # Add user location marker
        folium.Marker(
            self.center,
            popup='Your Location',
            tooltip='Current Position',
            icon=folium.Icon(color='blue', icon='user')
        ).add_to(self.map)
        
        return self.map
    
    def add_safety_zones(self, safety_points):
        """Add safety zone markers to the map"""
        if not self.map:
            self.create_interactive_map()
            
        for point in safety_points:
            color = 'green' if point['safety_level'] == 'safe' else 'orange' if point['safety_level'] == 'caution' else 'red'
            
            folium.CircleMarker(
                location=[point['lat'], point['lng']],
                radius=point.get('radius', 50),
                popup=f"{point['name']}<br>Safety: {point['safety_level']}",
                color=color,
                fill=True,
                fillOpacity=0.3
            ).add_to(self.map)
    
    def calculate_safe_route(self, start, end, safety_points):
        """Calculate safest route using NetworkX"""
        G = nx.Graph()
        
        # Add nodes for start, end, and safety points
        G.add_node('start', pos=start)
        G.add_node('end', pos=end)
        
        for i, point in enumerate(safety_points):
            G.add_node(f'safety_{i}', pos=(point['lat'], point['lng']), safety=point['safety_level'])
        
        # Add edges with weights based on distance and safety
        nodes = list(G.nodes(data=True))
        for i, (node1, data1) in enumerate(nodes):
            for node2, data2 in nodes[i+1:]:
                distance = geodesic(data1['pos'], data2['pos']).kilometers
                
                # Weight calculation: distance + safety penalty
                safety_penalty = 0
                if 'safety' in data1 and data1['safety'] == 'danger':
                    safety_penalty += 2
                if 'safety' in data2 and data2['safety'] == 'danger':
                    safety_penalty += 2
                    
                weight = distance + safety_penalty
                G.add_edge(node1, node2, weight=weight)
        
        try:
            path = nx.shortest_path(G, 'start', 'end', weight='weight')
            return path
        except nx.NetworkXNoPath:
            return None
    
    def analyze_area_safety(self, bounds):
        """Analyze safety of a geographic area"""
        # This would integrate with real crime data, lighting data, etc.
        analysis = {
            'overall_safety_score': 0.75,  # 0-1 scale
            'risk_factors': [
                'Low lighting in some areas',
                'Limited police presence after 10 PM'
            ],
            'safe_hours': '6 AM - 10 PM',
            'recommended_routes': ['Main roads', 'Well-lit paths'],
            'emergency_contacts': {
                'police': '100',
                'tourist_helpline': '1363'
            }
        }
        return analysis
    
    def export_map_data(self, filename):
        """Export map data for React Native consumption"""
        if not self.map:
            return None
            
        # Convert map data to JSON format for React Native
        map_data = {
            'center': self.center,
            'safety_zones': self.safety_data,
            'routes': [],
            'metadata': {
                'generated_at': pd.Timestamp.now().isoformat(),
                'source': 'e-Raksha-Setu Safety Analysis'
            }
        }
        
        with open(f'{filename}.json', 'w') as f:
            json.dump(map_data, f, indent=2)
        
        return map_data

# Example usage
if __name__ == "__main__":
    # Sample safety data for Delhi tourism
    safety_points = [
        {'lat': 28.6129, 'lng': 77.2295, 'name': 'India Gate', 'safety_level': 'safe', 'radius': 100},
        {'lat': 28.6562, 'lng': 77.2410, 'name': 'Red Fort', 'safety_level': 'safe', 'radius': 80},
        {'lat': 28.5535, 'lng': 77.2588, 'name': 'Lotus Temple', 'safety_level': 'safe', 'radius': 60},
        {'lat': 28.6280, 'lng': 77.2137, 'name': 'Connaught Place', 'safety_level': 'caution', 'radius': 150},
    ]
    
    # Create analyzer
    analyzer = TourismSafetyMapAnalyzer()
    
    # Create interactive map
    interactive_map = analyzer.create_interactive_map()
    analyzer.add_safety_zones(safety_points)
    
    # Save map
    interactive_map.save('delhi_tourism_safety_map.html')
    
    # Export data for React Native
    analyzer.export_map_data('safety_data_for_app')
    
    print("Advanced map analysis complete!")
    print("- Interactive HTML map saved as 'delhi_tourism_safety_map.html'")
    print("- Safety data exported as 'safety_data_for_app.json'")
    print("- This data can be integrated into the React Native app via API")

# Note: To use these libraries, install them with:
# pip install folium geopandas networkx pandas geopy

"""
Integration with React Native App:
1. Run this Python script on a server
2. Expose the generated JSON data via REST API
3. Fetch the data in React Native app
4. Use the safety zones and route data in the WebView map
5. Update map markers and routes based on real-time analysis
"""