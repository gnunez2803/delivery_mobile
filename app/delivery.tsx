import { View, Text, StyleSheet, Button, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import BackendClient from '@/api/config';

// Define the data structure for delivery information
interface DeliveryData {
  sender_id: number;
  business_id: number;
  receipient_id: string;
  address: string;
  number_of_packages: number;
  status: string;
}

interface Business {
  name: string;
}

interface Sender {
  first_name: string;
  last_name: string;
}

interface Recipient {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}

export default function Delivery() {
  const marker = useLocalSearchParams();
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [businessData, setBusinessData] = useState<Business | null>(null);
  const [senderData, setSenderData] = useState<Sender | null>(null);
  const [recipientData, setRecipientData] = useState<Recipient | null>(null);
  const navigation = useNavigation();

  const [error, setError] = useState<string | null>(null);

  // useEffect with dependency on navigation state
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Re-fetch to update delivery data when the screen is focused
      fetchDeliveryData();
    });

    return unsubscribe;
  }, [navigation]);

  const renderSender = () => {
    if (deliveryData?.business_id) {
      return (
      <View style={styles.sender}>
        <Text style={styles.senderText}>Sender: {businessData?.name}</Text>
      </View>
    );
    }
    if (senderData) {
      return (
        <View style={styles.sender}>
          <Text style={styles.senderText}>Sender: {senderData.first_name} {senderData.last_name}</Text>
        </View>
      );
    }
    return (
    <View style={styles.sender}>
      <Text style={styles.senderText}>Sender: Unknown</Text>
      </View>
    );
  };

  const buttonDelivery = (data: DeliveryData) => {
    navigation.navigate("delivery-action", data);
  };

  const renderButtons = (data: DeliveryData) => {
    if (data.status == "completed") {
      return;
    } else {
      return (
        <View style={styles.deliveryButton}>
          <Button color="green" title='Start Dropoff Now' onPress={() => buttonDelivery(data)}/>
        </View>
      );
    }
  };

  const fetchDeliveryData = async () => {
    try {
      const backendClient = BackendClient.getInstance();
      const response = await backendClient.get<DeliveryData>(`/deliveries/${marker.id}`);
      setDeliveryData(response);

      if (response.business_id) {
        const businessResponse = await backendClient.get<Business>(`business/${response.business_id}`);
        setBusinessData(businessResponse);
      } else if (response.sender_id) {
        const senderResponse = await backendClient.get<Sender>(`customer/${response.sender_id}`);
        setSenderData(senderResponse);
      }
      if (response.receipient_id) {
        const recipientResponse = await backendClient.get<Recipient>(`customer/${response.receipient_id}`);
        setRecipientData(recipientResponse);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Perform your actions here (e.g., save data)
      navigation.setParams(marker.id);

      // If you want to prevent the default back behavior:
      // e.preventDefault(); 

      // Optionally, navigate to a different screen instead of going back:
      // navigation.navigate('OtherScreen'); 
    });

    return unsubscribe;
  }, [navigation]);


  useEffect(() => {
    // Make the API call
    if (!marker.id) {
      setError('Marker ID is missing');
      return;
    }
    fetchDeliveryData();
  }, [marker.id]);

  const callContact = (phoneNumber: string) => {
    if (!phoneNumber) {
      alert("No phone number found.")
      return;
    }
    let dialUrl = `tel:${phoneNumber}`;
    if (Platform.OS === 'ios') {
      dialUrl = `telprompt:${phoneNumber}`; // Use telprompt for iOS to ensure user confirmation
    }
    Linking.openURL(dialUrl);
  }

  const navigateToAddress = (address: string) => {
    if (address == null) {
      alert("No address found");
      return;
    }
    const encodeaddress = encodeURIComponent(address);
    const platformUrl = Platform.select({
      ios: `http://maps.apple.com/?daddr=${encodeaddress}`,
      android: `geo:?q=${encodeaddress}`,
    })
    Linking.openURL(platformUrl);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  if (!deliveryData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}> 
        <Text style={styles.sectionTitle}>Delivery Info</Text>
        <View style={styles.sectionContent}>
          <View style={styles.columnContainer}> 
            <View style={styles.column}>
              <Text style={styles.deliveryText}>ID: {marker.title}</Text>
              <Text style={styles.deliveryText}>Status: {deliveryData.status}</Text>
            </View>
            <View style={styles.column}>
              {renderButtons(deliveryData)} 
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recipient Info</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.recipientText}>Name: {recipientData?.first_name} {recipientData?.last_name}</Text>
          <View style={styles.buttonView}>
            <Button color="#3daebf" title="Contact" onPress={() => callContact(recipientData.phone_number)}/>
            <View style={styles.buttonGap}></View>
            <Button color="#3daebf" title="Navigate" onPress={() => navigateToAddress(recipientData.address)}/>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sender Info</Text>
        <View style={styles.sectionContent}>
          {renderSender()} 
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginBottom: 20, // Add margin bottom for spacing
    borderBottomWidth: 1, // Add a border for visual separation
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    padding: 15, // Increase padding for more space
  },

  deliveryInfo: {
    flex: 1,
    justifyContent:"center",
    borderColor: "black",
  },
  deliveryText: {
    fontSize: 20,
    marginBottom: 5, // Add space between text elements
  },
  deliveryButton: {
    width: '50%', // Adjust button width as needed
    alignSelf: 'center', // Center button within its container
  },

  senderText: {
    fontSize: 20,
    marginBottom: 5, // Add space between text elements
  },
  recipient: {
    flex: 1,
    justifyContent: "center",
  },
  recipientText: {
    fontSize: 20,
    marginBottom: 5, // Add space between text elements
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

  },
  buttonGap: {
    width: 20
  }
});