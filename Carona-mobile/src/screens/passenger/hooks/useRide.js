import { useState } from 'react';
import { Alert } from 'react-native';
import { api, HandleError } from "../../../constants/api.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useRide = (userId) => {
    const [status, setStatus] = useState("");
    const [rideId, setRideId] = useState(0);
    const [driverName, setDriverName] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    const getRideFromUser = async (userIdParam = null) => {
        try {
            const currentUserId = userIdParam || userId;
            
            if (!currentUserId) {
                Alert.alert("Erro", "Usuário não identificado. Faça login novamente.");
                return {};
            }

            const response = await api.get("/rides", {
                params: {
                    passenger_user_id: currentUserId,
                    pickup_date: new Date().toISOString("pt-BR", { timeZone: "America/Sao_Paulo" }).substring(0, 10),
                    status_not: "F"
                }
            });

            if (response.data && response.data.length > 0) {
                const userRide = response.data.find(ride => ride.passenger_user_id == currentUserId);
                if (userRide) {
                    return userRide;
                }
            }

            return {};
        } catch (error) {
            console.error("Erro ao buscar corridas:", error);
            if (error.response?.status === 401) {
                Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
            } else {
                HandleError(error);
            }
            return {};
        }
    };

    const createRide = async (rideData) => {
        try {
            if (!userId) {
                Alert.alert("Erro", "Usuário não identificado. Faça login novamente.");
                return false;
            }

            if (!rideData.dropoffAddress || rideData.dropoffAddress.trim() === "") {
                Alert.alert("Erro", "Por favor, selecione um destino.");
                return false;
            }

            if (!rideData.myLocation || !rideData.myLocation.latitude) {
                Alert.alert("Erro", "Não foi possível obter sua localização. Tente novamente.");
                return false;
            }

            const json = {
                passenger_user_id: userId,
                pickup_address: rideData.pickupAddress || "Localização atual",
                dropoff_address: rideData.dropoffAddress,
                pickup_latitude: rideData.myLocation.latitude,
                pickup_longitude: rideData.myLocation.longitude
            };

            const response = await api.post("/rides", json);

            if (response.status === 200 || response.status === 201) {
                if (response.data && response.data.ride_id) {
                    setRideId(response.data.ride_id);
                    setStatus("P");
                }
                
                Alert.alert("Sucesso", "Carona solicitada com sucesso! Aguardando motorista...", [
                    { text: "OK", onPress: () => {} }
                ]);
                return true;
            } else {
                Alert.alert("Erro", "Não foi possível criar a carona. Tente novamente.");
                return false;
            }
        } catch (error) {
            console.error("Erro ao criar carona:", error);
            HandleError(error);
            return false;
        }
    };

    const cancelRide = async () => {
        try {
            if (!userId || !rideId) {
                Alert.alert("Erro", "Dados inválidos para cancelar carona.");
                return false;
            }

            Alert.alert(
                "Cancelar Carona",
                "Tem certeza que deseja cancelar esta carona?",
                [
                    { text: "Não", style: "cancel" },
                    { 
                        text: "Sim", 
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const response = await api.delete("/rides/" + rideId);
                                if (response.data) {
                                    Alert.alert("Sucesso", "Carona cancelada com sucesso!", [
                                        { text: "OK", onPress: () => {} }
                                    ]);
                                    return true;
                                }
                            } catch (error) {
                                console.error("Erro ao cancelar carona:", error);
                                HandleError(error);
                            }
                            return false;
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Erro ao cancelar carona:", error);
            HandleError(error);
            return false;
        }
    };

    const finishRide = async () => {
        try {
            if (!userId || !rideId) {
                Alert.alert("Erro", "Dados inválidos para finalizar carona.");
                return false;
            }

            Alert.alert(
                "Finalizar Carona",
                "Tem certeza que deseja finalizar esta carona?",
                [
                    { text: "Não", style: "cancel" },
                    { 
                        text: "Sim", 
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const json = { passenger_user_id: userId };
                                const response = await api.put("/rides/" + rideId + "/finish", json);

                                if (response.data) {
                                    Alert.alert("Sucesso", "Carona finalizada com sucesso!", [
                                        { text: "OK", onPress: () => {} }
                                    ]);
                                    return true;
                                }
                            } catch (error) {
                                console.error("Erro ao finalizar carona:", error);
                                HandleError(error);
                            }
                            return false;
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Erro ao finalizar carona:", error);
            HandleError(error);
            return false;
        }
    };

    const updateRideStatus = (rideData) => {
        if (rideData.ride_id) {
            setStatus(rideData.status);
            setRideId(rideData.ride_id);
            setDriverName(rideData.driver_name + " - " + rideData.driver_phone);
        } else {
            setStatus("");
            setRideId(0);
            setDriverName("");
        }
    };

    return {
        status,
        setStatus,
        rideId,
        setRideId,
        driverName,
        setDriverName,
        dropoffLocation,
        setDropoffLocation,
        routeCoordinates,
        setRouteCoordinates,
        getRideFromUser,
        createRide,
        cancelRide,
        finishRide,
        updateRideStatus
    };
}; 