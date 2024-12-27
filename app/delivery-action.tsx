import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { useFonts } from 'expo-font'; 
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';

interface Package {
  size: string;
  id: number;
  status: string;
}

export default function DeliveryAction() {
  const deliveryData = useLocalSearchParams();
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allDelivered, setAllDelivered] = useState<boolean>(false);
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    OpenSans_400Regular,
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`http://192.168.1.165:8000/deliveries/${deliveryData.id}/packages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch packages: ${response.status}`);
        }
        const data = await response.json();

        const packages = data.map((item: any) => ({
          size: item.size,
          id: item.id,
          status: item.status,
        }));
        setPackages(packages);
        setAllDelivered(data.every((pkg: Package) => pkg.status === 'delivered'));
      } catch (err: any) {
        console.error(err.message);
        setError('Failed to load packages');
      }
    };

    fetchPackages();
  }, [deliveryData.id]);

  useEffect(() => {
    // Check if all packages are delivered whenever the 'packages' state changes
    if (packages) { 
      setAllDelivered(packages.every((pkg) => pkg.status === 'delivered'));
    }
  }, [packages]); 

  const handleToggleDeliveryStatus = async (packageId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'delivered' ? 'incomplete' : 'delivered';
      const response = await fetch(`http://192.168.1.165:8000/deliveries/${deliveryData.id}/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update package ${packageId}: ${response.status}`);
      }

      setPackages((prevPackages) =>
        prevPackages?.map((pkg) =>
          pkg.id === packageId ? { ...pkg, status: newStatus } : pkg
        ) || []
      );
    } catch (err: any) {
      console.error(err.message);
      setError('Failed to update package status');
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      const response = await fetch(`http://192.168.1.165:8000/deliveries/${deliveryData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update delivery: ${response.status}`);
      }

      navigation.goBack();
    } catch (err: any) {
      console.error(err.message);
      setError('Failed to complete delivery');
    }
  };

  const renderDeliveryButton = (item: Package) => {
    const buttonTitle = item.status === 'delivered' ? 'Mark as Incomplete' : 'Mark as Delivered';
    return (
      <Button
        title={buttonTitle}
        onPress={() => handleToggleDeliveryStatus(item.id, item.status)}
      />
    );
  };

  const renderPackageItem = ({ item }: { item: Package }) => (
    <View style={styles.packageItem}>
      <Text style={styles.text}>Size: {item.size}</Text>
      <Text style={styles.text}>Status: {item.status}</Text>
      {renderDeliveryButton(item)}
    </View>
  );

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={packages}
            renderItem={renderPackageItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.text}>No packages available</Text>}
          />
        )}
  
        {allDelivered && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderText}>Slide to complete delivery</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              step={1}
              onSlidingComplete={handleCompleteDelivery}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  packageItem: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  sliderText: {
    fontSize: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'OpenSans_400Regular'
  },
});
