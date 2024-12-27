import { View, Text, StyleSheet, Button, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

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
      // Re-fetch delivery data when the screen is focused
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
      return <Button title='Start Delivery' onPress={() => buttonDelivery(data)}/>
    }
  };

  const fetchDeliveryData = async () => {
    try {
      const response = await fetch(`http://192.168.1.165:8000/deliveries/${marker.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      const deliveryResponse = await response.json();
      setDeliveryData(deliveryResponse);

      if (deliveryResponse.business_id) {
        const businessResponse = await fetch(`http://192.168.1.165:8000/business/${deliveryResponse.business_id}`);
        if (!businessResponse.ok) {
          throw new Error(`Failed to fetch business data: ${businessResponse.status}`);
        }
        const business = await businessResponse.json();
        setBusinessData(business);
      } else if (deliveryResponse.sender_id) {
        const senderResponse = await fetch(`http://192.168.1.165:8000/customer/${deliveryResponse.sender_id}`);
        if (!senderResponse.ok) {
          throw new Error(`Failed to fetch sender data: ${senderResponse.status}`);
        }
        const sender = await senderResponse.json();
        setSenderData(sender);
      }

      if (deliveryResponse.receipient_id) {
        const recipientResponse = await fetch(`http://192.168.1.165:8000/customer/${deliveryResponse.receipient_id}`);
        if (!recipientResponse.ok) {
          throw new Error(`Failed to fetch recipient data: ${recipientResponse.status}`);
        }
        const recipient = await recipientResponse.json();
        setRecipientData(recipient);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Make the API call
    if (!marker.id) {
      setError('Marker ID is missing');
      return;
    }
    fetchDeliveryData();
  }, [marker.id]);

  const callContact = (phoneNumber: string) => {
    console.log(phoneNumber);
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
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryText}>ID: {marker.title}</Text>
        <Text style={styles.deliveryText}>Status: {deliveryData.status}</Text>
        {renderButtons(deliveryData)}   
      </View>
      <View style={styles.recipient}>
        <Text style={styles.recipientText}>Recipient</Text>
        <Text style={styles.recipientText}>Name: {recipientData?.first_name} {recipientData?.last_name}</Text>
        <View style={styles.buttonView}>
          <Button title="Contact" onPress={() => callContact(recipientData.phone_number)}/>
          <View style={styles.buttonGap}></View>
          <Button title="Navigate" onPress={() => navigateToAddress(recipientData.address)}/>
        </View>
      </View>
      {renderSender()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: "column",
    padding: 16,
  },
  deliveryInfo: {
    flex: 1,
    justifyContent:"center",
  },
  deliveryText: {
    fontSize: 20,
  },
  sender: {
    flex: 1,
    justifyContent:"center",
  },
  senderText: {
    fontSize: 20,
  },
  recipient: {
    flex: 1,
    justifyContent: "center",
  },
  recipientText: {
    fontSize: 20,
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
