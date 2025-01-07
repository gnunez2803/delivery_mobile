import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { useFonts } from 'expo-font'; 
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import { Colors } from '@/constants/Colors';
import * as SecureStore from 'expo-secure-store';
import BackendClient from '@/api/config';

interface Package {
  size: string;
  id: number;
  status: string;
}

interface Delivery {
  status: string,
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
        const backendClient = BackendClient.getInstance();
        const response = await backendClient.get<any>(`deliveries/${deliveryData.id}/packages`);
        setPackages(response);
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
      const updatedPackage: Package = {
        status: newStatus,
      };
      const backendClient = BackendClient.getInstance()
      const response = await backendClient.put<Package, Package>(`/deliveries/${deliveryData.id}/packages/${packageId}`, updatedPackage);

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
      const token = await SecureStore.getItemAsync("token");
      const updatedDelivery: Delivery = {
        status: "completed",
      };
      const backendClient = BackendClient.getInstance();
      backendClient.put<Delivery, Delivery>(`/deliveries/${deliveryData.id}`, updatedDelivery);
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
    backgroundColor: Colors.light.background,
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
