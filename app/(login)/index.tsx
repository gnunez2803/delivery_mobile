import React, { useState, useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import BackendClient from '../api/config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Check if token exists in secure storage when the component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        // If token is found, navigate to home screen
        navigation.reset('delivery-map');  // Replace login screen with home screen
      }
    };
    checkAuthStatus();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const backendClient = BackendClient.getInstance();
      const requestBody = {email: email, password: password};

      const response = await backendClient.post<any, { email: string, password: string }>('/login', requestBody);
      console.log(response)
      const token = response.token; // Assuming the response structure is {"token": "fasdfasdf"}
      await SecureStore.setItemAsync('token', token);
      navigation.navigate('delivery-map'); 
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.link} onPress={() => Alert.alert(`Go to hivesolutions.biz`)}>
        <Text style={styles.linkText}>Don't have an account? Reach out to Hive Hub LLC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
