import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';
import {
    getCurrentPositionAsync,
    requestForegroundPermissionsAsync,
    reverseGeocodeAsync
} from "expo-location";

export const useLocation = () => {
    const [myLocation, setMyLocation] = useState(null);
    const [pickupAddress, setPickupAddress] = useState("");

    const requestPermissionAndGetLocation = async () => {
        try {
            const { granted } = await requestForegroundPermissionsAsync();

            if (!granted) {
                Alert.alert(
                    "Permissão de Localização Necessária",
                    "Este app precisa de acesso à sua localização para funcionar corretamente.",
                    [
                        { text: "Configurações", onPress: () => Linking.openSettings() },
                        { text: "Cancelar", style: "cancel" }
                    ]
                );
                return null;
            }

            const currentPosition = await getCurrentPositionAsync({
                accuracy: 3,
                maximumAge: 5000,
                timeout: 20000
            });

            if (currentPosition?.coords) {
                const { latitude, longitude } = currentPosition.coords;
                
                if (latitude !== 0 && longitude !== 0) {
                    return { latitude, longitude };
                }
            }

            return null;
        } catch (error) {
            console.error("Erro ao obter localização:", error);
            return null;
        }
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await reverseGeocodeAsync({ latitude, longitude });
            
            if (response && response.length > 0) {
                const address = response[0];
                const fullAddress = [
                    address.street,
                    address.district,
                    address.city,
                    address.region
                ].filter(Boolean).join(', ');
                
                return fullAddress || "Localização atual";
            }
            
            return "Localização atual";
        } catch (error) {
            console.error("Erro ao obter endereço:", error);
            return "Localização atual";
        }
    };

    const updateLocation = async () => {
        const location = await requestPermissionAndGetLocation();
        
        if (location) {
            setMyLocation(location);
            const address = await getAddressFromCoordinates(location.latitude, location.longitude);
            setPickupAddress(address);
            return location;
        }
        
        return null;
    };

    return {
        myLocation,
        setMyLocation,
        pickupAddress,
        setPickupAddress,
        requestPermissionAndGetLocation,
        getAddressFromCoordinates,
        updateLocation
    };
}; 