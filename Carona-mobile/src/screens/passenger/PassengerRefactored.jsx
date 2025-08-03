import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { styles } from './passenger.style.js';

// Hooks customizados
import { useUserData } from './hooks/useUserData';
import { useLocation } from './hooks/useLocation';
import { useAddressSuggestions } from './hooks/useAddressSuggestions';
import { useRide } from './hooks/useRide';

// Componentes
import { Header } from './components/Header';
import { AddressInput } from './components/AddressInput';
import { AddressSuggestions } from './components/AddressSuggestions';
import { RideMap } from './components/RideMap';

// Serviços
import { api } from '../../constants/api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PassengerRefactored = ({ navigation }) => {
    // Estados básicos
    const [dropoffAddress, setDropoffAddress] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const mapRef = useRef(null);

    // Hooks customizados
    const { userId, loadUserData, clearOtherUserData } = useUserData();
    const { 
        myLocation, 
        pickupAddress, 
        requestPermissionAndGetLocation, 
        getAddressFromCoordinates,
        updateLocation 
    } = useLocation();
    const { 
        dropoffSuggestions, 
        showDropoffSuggestions, 
        getAddressSuggestions, 
        closeSuggestions 
    } = useAddressSuggestions();
    const {
        status,
        rideId,
        driverName,
        dropoffLocation,
        routeCoordinates,
        getRideFromUser,
        createRide,
        cancelRide,
        finishRide,
        updateRideStatus
    } = useRide(userId);

    // Funções auxiliares
    const saveUserAddresses = async () => {
        try {
            if (!userId) return;
            
            const key = `user_${userId}_addresses`;
            await AsyncStorage.setItem(key, JSON.stringify({
                pickupAddress,
                dropoffAddress
            }));
        } catch (error) {
            console.error("Erro ao salvar endereços:", error);
        }
    };

    const loadUserAddresses = async () => {
        try {
            if (!userId) return;
            
            const key = `user_${userId}_addresses`;
            const savedAddresses = await AsyncStorage.getItem(key);
            
            if (savedAddresses) {
                const addresses = JSON.parse(savedAddresses);
                if (addresses.dropoffAddress) {
                    setDropoffAddress(addresses.dropoffAddress);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
        }
    };

    const getCoordinatesFromAddress = async (address) => {
        try {
            const response = await api.get("/geocode", { params: { address } });
            if (response.data && response.data.latitude && response.data.longitude) {
                return {
                    latitude: response.data.latitude,
                    longitude: response.data.longitude
                };
            }
            return null;
        } catch (error) {
            console.error("Erro ao obter coordenadas:", error);
            return null;
        }
    };

    const calculateRoute = async () => {
        try {
            if (!dropoffAddress || !myLocation) return;

            const destinationCoords = await getCoordinatesFromAddress(dropoffAddress);
            if (destinationCoords) {
                const route = [
                    { latitude: myLocation.latitude, longitude: myLocation.longitude },
                    destinationCoords
                ];
                // Aqui você pode implementar cálculo de rota real
            }
        } catch (error) {
            console.error("Erro ao calcular rota:", error);
        }
    };

    const selectSuggestion = (suggestion) => {
        const fullAddress = suggestion.subAddress 
            ? `${suggestion.address}, ${suggestion.subAddress}` 
            : suggestion.address;
        
        setDropoffAddress(fullAddress);
        closeSuggestions();
        
        setTimeout(() => {
            calculateRoute();
        }, 500);
    };

    const handleDropoffChange = (text) => {
        setDropoffAddress(text);
        getAddressSuggestions(text, false);
        
        if (userId) {
            setTimeout(() => saveUserAddresses(), 500);
        }
    };

    const handleDropoffFocus = () => {
        if (!dropoffAddress.trim()) {
            getAddressSuggestions("Brasil", false);
        } else if (dropoffSuggestions.length > 0) {
            // Mostrar sugestões existentes
        }
    };

    const handleConfirmRide = async () => {
        const success = await createRide({
            dropoffAddress,
            myLocation,
            pickupAddress
        });
        
        if (success) {
            navigation.goBack();
        }
    };

    const handleCancelRide = async () => {
        const success = await cancelRide();
        if (success) {
            navigation.goBack();
        }
    };

    const handleFinishRide = async () => {
        const success = await finishRide();
        if (success) {
            navigation.goBack();
        }
    };

    const isFieldEditable = () => {
        return status === "" || rideId === 0;
    };

    // Carregamento inicial
    const loadScreen = async () => {
        try {
            setIsLoading(true);
            
            const currentUserId = await loadUserData();
            if (!currentUserId) {
                Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
                navigation.navigate("login");
                return;
            }

            await clearOtherUserData(currentUserId);

            const rideData = await getRideFromUser(currentUserId);
            
            if (!rideData.ride_id) {
                // Usuário não tem carona ativa
                updateRideStatus({});
                
                const location = await requestPermissionAndGetLocation();
                if (location) {
                    const address = await getAddressFromCoordinates(location.latitude, location.longitude);
                    await loadUserAddresses();
                    
                    if (dropoffAddress) {
                        await calculateRoute();
                    }
                } else {
                    Alert.alert(
                        "Localização Necessária",
                        "Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.",
                        [
                            { text: "Tentar Novamente", onPress: loadScreen },
                            { text: "Cancelar", onPress: () => navigation.goBack(), style: "cancel" }
                        ]
                    );
                    setIsLoading(false);
                    return;
                }
            } else {
                // Usuário tem carona ativa
                updateRideStatus(rideData);
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error("Erro ao carregar tela:", error);
            Alert.alert("Erro", "Ocorreu um erro ao carregar a tela. Tente novamente.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadScreen();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setTimeout(loadScreen, 100);
        });

        return unsubscribe;
    }, [navigation]);

    // Renderização
    if (isLoading || !myLocation) {
        return (
            <View style={styles.container}>
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#F7D600" />
                    <Text style={{ marginTop: 10, color: "#666" }}>Carregando...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RideMap 
                myLocation={myLocation}
                dropoffLocation={dropoffLocation}
                routeCoordinates={routeCoordinates}
                pickupAddress={pickupAddress}
                dropoffAddress={dropoffAddress}
                mapRef={mapRef}
            />

            <Header onGoBack={() => navigation.goBack()} />

            <AddressInput 
                pickupAddress={pickupAddress}
                dropoffAddress={dropoffAddress}
                onDropoffChange={handleDropoffChange}
                onDropoffFocus={handleDropoffFocus}
                isEditable={isFieldEditable()}
            />

            <AddressSuggestions 
                showSuggestions={showDropoffSuggestions}
                suggestions={dropoffSuggestions}
                onSelectSuggestion={selectSuggestion}
                onClearDestination={() => {
                    setDropoffAddress("");
                    closeSuggestions();
                }}
                onChooseOnMap={() => {
                    closeSuggestions();
                    // Implementar seleção no mapa
                }}
            />

            {/* Botões de ação */}
            {status === "" && dropoffAddress && (
                <View style={styles.confirmButtonContainer}>
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        activeOpacity={0.7}
                        onPress={handleConfirmRide}
                    >
                        <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {status === "P" && (
                <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelRide}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            )}

            {status === "A" && (
                <View style={styles.driverInfo}>
                    <Text style={styles.driverLabel}>Motorista</Text>
                    <Text style={styles.driverName}>{driverName}</Text>
                    <TouchableOpacity 
                        style={styles.finishButton}
                        onPress={handleFinishRide}
                    >
                        <Text style={styles.finishButtonText}>Finalizar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}; 