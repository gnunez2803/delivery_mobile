import { apiClient } from './config';
import * as SecureStore from 'expo-secure-store';

interface DeliveryQueryParams{
    id: string;
}

interface Package {
    id: number,
    size: string,
    status: string,
}

interface DeliveriesResponse {
    id: number;
    senderId: number;
    recipientId: number;
    Latitude: number,
    Longitude: number,
    numOfPackages: number,
    status: string,
    packages: Package[],
}


export const getDeliveries = async(data: DeliveryQueryParams ): Promise<DeliveriesResponse>=> {
    const token = await SecureStore.getItemAsync("token");
    const {id}  = data;
    let deliveryData: DeliveriesResponse;
    try {
        apiClient.options
        const response = await apiClient.get(`deliveries/${id}`)
        .then(response => {
            deliveryData = response.data.json();
            // Ensure the fetched data conforms to DeliveriesResponse
            const result: DeliveriesResponse = {
                id: deliveryData.id,
                senderId: deliveryData.senderId,
                recipientId: deliveryData.recipientId,
                Latitude: deliveryData.Latitude,
                Longitude: deliveryData.Longitude,
                numOfPackages: deliveryData.numOfPackages,
                status: deliveryData.status,
                packages: deliveryData.packages.map((pkg: any) => ({
                    id: pkg.id,
                    size: pkg.size,
                    status: pkg.status,
                })),
            };
            return result;
        })
        .catch(error => {
            throw new Error("Unable to get deliveries.");
        });
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        throw error;
    }
}