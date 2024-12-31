import { useNavigation } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import  MapView, { Marker, Region } from 'react-native-maps';
import React, { useEffect, useState } from 'react';
import BackendClient from '@/api/config';


interface MarkerData {
  latlng: {
    latitude: number;
    longitude: number;
  };
  title: string,
  description: string,
  id: number,
}

interface State {
  region: Region;
  markers: MarkerData[];
}

export default function DeliveryMap() {
  const navigation = useNavigation();
  const [region, setRegion] = useState<Region>({
    latitude: 30.266666,
    longitude: -97.73333,
    latitudeDelta: 0.222,
    longitudeDelta: 0.222,
  });

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    const unsubscribe = navigation.addListener('focus', () => {
      // Re-fetch delivery data when the screen is focused
      fetchMarkers();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchMarkers = async () => {
    try {
      const backendClient = BackendClient.getInstance();
      const data = await backendClient.get('/deliveries');
      const mappedMarkers = data.map((item: any) => ({
        latlng: {
          latitude: item.latitude,
          longitude: item.longtitude,
        },
        title: `Delivery #${item.id}`,
        description: `Status: ${item.status}, Packages: ${item.number_of_packages}`, // A simple description
        id: item.id, // or use another unique identifier if available
      }));
      setMarkers(mappedMarkers); // Set the mapped markers to state
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);
  
  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const onMarkerCalloutPress = (marker: MarkerData) => {
    navigation.navigate("delivery", marker);
  }
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}>
        {
          markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              onCalloutPress={() => onMarkerCalloutPress(marker)}
            />
          ))
        }
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});