import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

class BackendClient {
    private static instance: BackendClient | null = null;
    private client: AxiosInstance;

    constructor(baseUrl: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            }      
        })
    }

    public static getInstance(): BackendClient {
        if (!BackendClient.instance) {
            const endpoint = process.env.EXPO_PUBLIC_API_ENDPOINT;
            if (endpoint) {
                BackendClient.instance = new BackendClient(endpoint);
            } else {
                BackendClient.instance = new BackendClient("http://192.168.1.165:8000");
            }
        }
        return BackendClient.instance;
    }


    public async get<T>(endpoint: string): Promise <T> {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                this.client.defaults.headers['Authorization'] = `Bearer ${token}`
            }
            const response = await this.client.get<T>(endpoint);
            return response.data;
          } catch (error) {
            console.error('Error fetching data:', error);
            // Handle errors appropriately (e.g., display an error message to the user)
            throw error; // Re-throw for potential error handling in calling code
          }
    }

    public async login<T>(endpoint: string, data?: any): Promise<T> {
        try {
            const response = await this.client.post(endpoint, data);
            return response.data;            
        } catch (error) {
            console.error(error);
            throw error; // Re-throw for potential error handling in calling code
        }
    }
    
    public async post<T,D>(endpoint: string, data?: D): Promise<T> {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                this.client.defaults.headers['Authorization'] = `Bearer ${token}`
            }
            const response = await this.client.post<T,D>(endpoint, data);
            return response.data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    public async put<T, D>(endpoint: string, data: D): Promise<T> {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                this.client.defaults.headers['Authorization'] = `Bearer ${token}`
            }
            const response = await this.client.put<T, D>(endpoint, data); 
            return response.data;
        } catch (error) {
            console.error('Error putting data:', error);
            throw error; 
        }
      }
}

export default BackendClient;