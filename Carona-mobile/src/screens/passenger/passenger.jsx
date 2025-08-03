import { ActivityIndicator, Alert, Text, TextInput, View, Linking, TouchableOpacity } from "react-native";
import MyButton from "../../components/mybutton/mybutton.jsx";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";
import { styles } from "./passenger.style.js";
import { useEffect, useState, useRef } from "react";
import icons from "../../constants/icons.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getCurrentPositionAsync,
    requestForegroundPermissionsAsync,
    reverseGeocodeAsync,
    geocodeAsync
} from "expo-location";
import { api, HandleError } from "../../constants/api.js";


function Passenger(props) {

    const [userId, setUserId] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [dropoffLocation, setDropoffLocation] = useState(null);
    const [title, setTitle] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [dropoffAddress, setDropoffAddress] = useState("");
    const [status, setStatus] = useState("");
    console.log("Estado inicial - status:", status);
    const [rideId, setRideId] = useState(0);
    const [driverName, setDriverName] = useState("");
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const mapRef = useRef(null);
    const suggestionTimeoutRef = useRef(null);

    async function loadUserData() {
        try {
            console.log("=== DEBUG: Carregando dados do usuário ===");
            
            // Verificar todas as chaves no AsyncStorage
            const allKeys = await AsyncStorage.getAllKeys();
            console.log("Todas as chaves no AsyncStorage:", allKeys);
            
            const userData = await AsyncStorage.getItem('userData');
            console.log("userData bruto:", userData);
            
            if (userData) {
                const user = JSON.parse(userData);
                console.log("userData parseado:", user);
                
                const currentUserId = user.user_id;
                console.log("currentUserId extraído:", currentUserId);
                
                if (!currentUserId) {
                    console.error("userId não encontrado nos dados do usuário:", user);
                    return null;
                }
                
                console.log("UserId carregado com sucesso:", currentUserId);
                
                // Limpar dados de usuários anteriores para garantir isolamento
                await clearOtherUserData(currentUserId);
                
                return currentUserId;
            } else {
                console.error("userData não encontrado no AsyncStorage");
                return null;
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
            return null;
        }
    }

    async function clearOtherUserData(currentUserId) {
        try {
            // Obter todas as chaves do AsyncStorage
            const keys = await AsyncStorage.getAllKeys();
            
            // Filtrar chaves de endereços de outros usuários
            const addressKeys = keys.filter(key => 
                key.startsWith('user_') && 
                key.endsWith('_addresses') && 
                !key.includes(`user_${currentUserId}_`)
            );
            
            // Remover dados de outros usuários
            if (addressKeys.length > 0) {
                await AsyncStorage.multiRemove(addressKeys);
                console.log("Dados de outros usuários removidos");
            }
        } catch (error) {
            console.error("Erro ao limpar dados de outros usuários:", error);
        }
    }

    async function saveUserAddresses() {
        try {
            if (!userId) return;
            
            const key = `user_${userId}_addresses`;
            await AsyncStorage.setItem(key, JSON.stringify({
                pickupAddress,
                dropoffAddress
            }));
            console.log("Endereços salvos para usuário:", userId);
        } catch (error) {
            console.error("Erro ao salvar endereços:", error);
        }
    }

    async function loadUserAddresses() {
        try {
            if (!userId) return;
            
            const key = `user_${userId}_addresses`;
            const addresses = await AsyncStorage.getItem(key);
            if (addresses) {
                const data = JSON.parse(addresses);
                setPickupAddress(data.pickupAddress || "");
                setDropoffAddress(data.dropoffAddress || "");
                
                // Calcular rota após carregar endereços
                if (data.dropoffAddress && myLocation.latitude) {
                    setTimeout(() => calculateRoute(), 500);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
        }
    }

    async function RequestRideFromUser(userIdParam = null) {
        try {
            const currentUserId = userIdParam || userId;
            console.log("Buscando corridas para usuário:", currentUserId);
            
            if (!currentUserId) {
                console.error("userId não definido");
                Alert.alert("Erro", "Usuário não identificado. Faça login novamente.");
                props.navigation.navigate("login");
                return {};
            }

            console.log("Fazendo requisição para API com userId:", currentUserId);
            
            const response = await api.get("/rides", {
                params: {
                    passenger_user_id: currentUserId,
                    pickup_date: new Date().toISOString("pt-BR", { timeZone: "America/Sao_Paulo" }).substring(0, 10),
                    status_not: "F"
                }
            });

            console.log("Resposta da API:", response.data);
            
            if (response.data && response.data.length > 0) {
                const userRide = response.data.find(ride => ride.passenger_user_id == currentUserId);
                if (userRide) {
                    console.log("Corrida do usuário encontrada:", userRide);
                    return userRide;
                }
            }
            
            console.log("Nenhuma corrida encontrada para o usuário");
            return {};

        } catch (error) {
            console.error("Erro ao buscar corridas:", error);
            if (error.response?.status === 401) {
                Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
                props.navigation.navigate("login");
            } else {
                HandleError(error);
            }
            return {};
        }
    }

    async function RequestPermissionAndGetLocation() {
        try {
            console.log("=== SOLICITANDO LOCALIZAÇÃO REAL ===");
            
            // Verificar se a permissão já foi concedida
            const permissionStatus = await AsyncStorage.getItem('locationPermission');
            console.log("Status da permissão:", permissionStatus);
            
            const { granted } = await requestForegroundPermissionsAsync();

            if (granted) {
                console.log("✅ Permissão de localização concedida");
                await AsyncStorage.setItem('locationPermission', 'granted');
                
                // Tentar obter localização com configurações otimizadas
                const currentPosition = await getCurrentPositionAsync({
                    accuracy: 3, // Máxima precisão
                    maximumAge: 5000, // Cache de 5 segundos
                    timeout: 20000 // Timeout de 20 segundos
                });

                if (currentPosition && currentPosition.coords) {
                    console.log("✅ Localização real obtida:", currentPosition.coords);
                    console.log("Latitude:", currentPosition.coords.latitude);
                    console.log("Longitude:", currentPosition.coords.longitude);
                    console.log("Precisão:", currentPosition.coords.accuracy, "metros");
                    
                    // Verificar se as coordenadas são válidas
                    if (currentPosition.coords.latitude !== 0 && currentPosition.coords.longitude !== 0) {
                        return currentPosition.coords;
                    } else {
                        console.log("❌ Coordenadas inválidas (0,0)");
                        return null;
                    }
                } else {
                    console.log("❌ Não foi possível obter coordenadas");
                    return null;
                }
            } else {
                console.log("❌ Permissão de localização negada");
                await AsyncStorage.setItem('locationPermission', 'denied');
                
                Alert.alert(
                    "Permissão de Localização Necessária",
                    "Este app precisa de acesso à sua localização para funcionar corretamente. Por favor, permita o acesso nas configurações do seu dispositivo.",
                    [
                        { 
                            text: "Configurações", 
                            onPress: () => Linking.openSettings() 
                        },
                        { 
                            text: "Cancelar", 
                            onPress: () => console.log("Usuário cancelou"),
                            style: "cancel"
                        }
                    ]
                );
                return null;
            }
        } catch (error) {
            console.error("❌ Erro ao obter localização:", error);
            await AsyncStorage.setItem('locationPermission', 'error');
            Alert.alert(
                "Erro de Localização", 
                "Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente."
            );
            return null;
        }
    }

    async function RequestAddressName(lat, long) {
        try {
            console.log("=== OBTENDO ENDEREÇO DA LOCALIZAÇÃO REAL ===");
            console.log("Coordenadas:", lat, long);
            
            const response = await reverseGeocodeAsync({
                latitude: lat,
                longitude: long
            });

            console.log("Resposta do reverse geocode:", response);

            if (response && response.length > 0) {
                const address = response[0];
                console.log("Endereço bruto:", address);
                
                let fullAddress = "";
                const addressParts = [];
                
                // Construir endereço completo com mais detalhes
                if (address.street) {
                    addressParts.push(address.street);
                    if (address.streetNumber) {
                        addressParts[addressParts.length - 1] += ", " + address.streetNumber;
                    }
                }
                
                if (address.district && address.district !== address.city) {
                    addressParts.push(address.district);
                }
                
                if (address.city) {
                    addressParts.push(address.city);
                }
                
                if (address.region) {
                    addressParts.push(address.region);
                }
                
                fullAddress = addressParts.join(", ");
                
                if (fullAddress) {
                    console.log("✅ Endereço completo obtido:", fullAddress);
                    setPickupAddress(fullAddress);
                } else {
                    console.log("⚠️ Não foi possível construir endereço completo");
                    setPickupAddress(`Localização atual (${lat.toFixed(6)}, ${long.toFixed(6)})`);
                }
            } else {
                console.log("⚠️ Nenhum endereço encontrado para as coordenadas");
                setPickupAddress(`Localização atual (${lat.toFixed(6)}, ${long.toFixed(6)})`);
            }
        } catch (error) {
            console.error("❌ Erro ao obter endereço:", error);
            setPickupAddress(`Localização atual (${lat.toFixed(6)}, ${long.toFixed(6)})`);
        }
    }

    async function getCoordinatesFromAddress(address) {
        try {
            console.log("Geocodificando endereço:", address);
            
            if (!address || address.trim() === "") {
                console.log("Endereço vazio, pulando geocodificação");
                return null;
            }

            const response = await geocodeAsync(address);
            console.log("Resposta da geocodificação:", response);
            
            if (response && response.length > 0) {
                const coords = {
                    latitude: response[0].latitude,
                    longitude: response[0].longitude
                };
                console.log("Coordenadas obtidas:", coords);
                return coords;
            } else {
                console.log("Nenhuma coordenada encontrada para o endereço");
                return null;
            }
        } catch (error) {
            console.error("Erro ao geocodificar endereço:", error);
            Alert.alert(
                "Erro de Geocodificação",
                "Não foi possível encontrar as coordenadas para este endereço. Verifique se o endereço está correto.",
                [{ text: "OK" }]
            );
            return null;
        }
    }

    function selectSuggestion(suggestion, isPickup = true) {
        console.log("Selecionando sugestão:", suggestion, "isPickup:", isPickup);
        
        const fullAddress = suggestion.subAddress ? `${suggestion.address}, ${suggestion.subAddress}` : suggestion.address;
        
        if (isPickup) {
            console.log("Definindo endereço de origem:", fullAddress);
            setPickupAddress(fullAddress);
            setShowPickupSuggestions(false);
            setPickupSuggestions([]);
        } else {
            console.log("Definindo endereço de destino:", fullAddress);
            setDropoffAddress(fullAddress);
            setShowDropoffSuggestions(false);
            setDropoffSuggestions([]);
            // Recalcular rota quando destino for selecionado
            console.log("Agendando cálculo de rota...");
            setTimeout(() => {
                console.log("Executando cálculo de rota...");
                calculateRoute();
            }, 500);
        }
    }

    async function getAddressSuggestions(query, isPickup = true) {
        try {
            console.log("=== INICIANDO BUSCA DE SUGESTÕES ===");
            console.log("Query:", query, "isPickup:", isPickup);
            
            // Limpar sugestões se query estiver vazia
            if (!query || query.trim().length === 0) {
                console.log("Query vazia, limpando sugestões");
                if (isPickup) {
                    setPickupSuggestions([]);
                    setShowPickupSuggestions(false);
                } else {
                    setDropoffSuggestions([]);
                    setShowDropoffSuggestions(false);
                }
                return;
            }

            // Limpar timeout anterior
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }

            // Debounce de 200ms (mais rápido)
            suggestionTimeoutRef.current = setTimeout(async () => {
                try {
                    console.log("Executando geocodeAsync para:", query);
                    
                    // Múltiplas tentativas de busca como no Uber/99
                    let response = null;
                    const searchQueries = [
                        query.trim(),
                        `${query.trim()}, Brasil`,
                        `${query.trim()}, BR`,
                        query.trim().toLowerCase()
                    ];
                    
                    // Tentar cada query até encontrar resultados
                    for (let i = 0; i < searchQueries.length; i++) {
                        const searchQuery = searchQueries[i];
                        console.log(`Tentativa ${i + 1}: "${searchQuery}"`);
                        
                        try {
                            response = await geocodeAsync(searchQuery);
                            console.log(`Resposta tentativa ${i + 1}:`, response?.length || 0, "resultados");
                            
                            if (response && response.length > 0) {
                                console.log(`✅ Sucesso na tentativa ${i + 1} com "${searchQuery}"`);
                                break;
                            }
                        } catch (error) {
                            console.log(`❌ Erro na tentativa ${i + 1}:`, error.message);
                            continue;
                        }
                    }
                    
                    if (response && response.length > 0) {
                        console.log("✅ API retornou", response.length, "resultados");
                        
                        const suggestions = response.slice(0, 8).map((item, index) => {
                            console.log(`Processando item ${index}:`, item);
                            
                            // Construir endereço similar ao Uber/99
                            let mainAddress = item.name || item.street || "Endereço não especificado";
                            let subAddress = "";
                            
                            // Construir sub-endereço com detalhes
                            const details = [];
                            if (item.street && item.street !== mainAddress) {
                                details.push(item.street);
                            }
                            if (item.city && item.city !== item.street) {
                                details.push(item.city);
                            }
                            if (item.region && item.region !== item.city) {
                                details.push(item.region);
                            }
                            if (item.country && item.country !== item.region) {
                                details.push(item.country);
                            }
                            
                            if (details.length > 0) {
                                subAddress = details.join(', ');
                            }
                            
                            return {
                                address: mainAddress,
                                subAddress: subAddress,
                                coordinates: {
                                    latitude: item.latitude,
                                    longitude: item.longitude
                                }
                            };
                        });
                        
                        console.log("Sugestões processadas:", suggestions);
                        
                        if (isPickup) {
                            console.log("Definindo sugestões de origem:", suggestions);
                            setPickupSuggestions(suggestions);
                            setShowPickupSuggestions(true);
                            console.log("✅ Estados de origem atualizados");
                        } else {
                            console.log("Definindo sugestões de destino:", suggestions);
                            setDropoffSuggestions(suggestions);
                            setShowDropoffSuggestions(true);
                            console.log("✅ Estados de destino atualizados");
                        }
                    } else {
                        console.log("Nenhuma sugestão encontrada para:", query);
                        if (isPickup) {
                            setPickupSuggestions([]);
                            setShowPickupSuggestions(false);
                        } else {
                            setDropoffSuggestions([]);
                            setShowDropoffSuggestions(false);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao buscar sugestões:", error);
                    console.error("Detalhes do erro:", error.message);
                    if (isPickup) {
                        setPickupSuggestions([]);
                        setShowPickupSuggestions(false);
                    } else {
                        setDropoffSuggestions([]);
                        setShowDropoffSuggestions(false);
                    }
                }
            }, 200);

        } catch (error) {
            console.error("Erro geral ao buscar sugestões:", error);
            if (isPickup) {
                setPickupSuggestions([]);
                setShowPickupSuggestions(false);
            } else {
                setDropoffSuggestions([]);
                setShowDropoffSuggestions(false);
            }
        }
    }

    async function calculateRoute() {
        try {
            console.log("=== INICIANDO CÁLCULO DE ROTA ===");
            console.log("Endereço de destino:", dropoffAddress);
            console.log("Localização atual:", myLocation);
            
            if (!dropoffAddress || !myLocation || !myLocation.latitude) {
                console.log("Dados insuficientes para calcular rota");
                console.log("dropoffAddress:", dropoffAddress);
                console.log("myLocation:", myLocation);
                return;
            }

            console.log("Obtendo coordenadas do endereço de destino...");
            const destinationCoords = await getCoordinatesFromAddress(dropoffAddress);
            
            if (destinationCoords) {
                console.log("Coordenadas de destino obtidas:", destinationCoords);
                setDropoffLocation(destinationCoords);
                
                // Simular rota (em produção, usar API de roteamento como Google Directions)
                const route = [
                    { latitude: myLocation.latitude, longitude: myLocation.longitude },
                    destinationCoords
                ];
                setRouteCoordinates(route);
                console.log("Rota calculada e definida:", route);
                
                // Ajustar região do mapa para mostrar toda a rota
                console.log("Ajustando região do mapa...");
                adjustMapRegion();
            } else {
                console.log("Não foi possível obter coordenadas de destino");
                setDropoffLocation(null);
                setRouteCoordinates([]);
            }
        } catch (error) {
            console.error("Erro ao calcular rota:", error);
            setDropoffLocation(null);
            setRouteCoordinates([]);
        }
    }

    function adjustMapRegion() {
        if (!myLocation.latitude || !dropoffLocation) return;
        
        const latDelta = Math.abs(myLocation.latitude - dropoffLocation.latitude) * 1.5;
        const lngDelta = Math.abs(myLocation.longitude - dropoffLocation.longitude) * 1.5;
        
        const region = {
            latitude: (myLocation.latitude + dropoffLocation.latitude) / 2,
            longitude: (myLocation.longitude + dropoffLocation.longitude) / 2,
            latitudeDelta: Math.max(latDelta, 0.01),
            longitudeDelta: Math.max(lngDelta, 0.01)
        };
        
        // Atualizar região do mapa
        if (mapRef.current) {
            mapRef.current.animateToRegion(region, 1000);
        }
    }

    async function LoadScreen() {
        try {
            console.log("Iniciando carregamento da tela de passageiro...");
            setIsLoading(true);
            
            // Carregar dados do usuário logado
            const currentUserId = await loadUserData();
            
            if (!currentUserId) {
                console.error("Usuário não encontrado - redirecionando para login");
                Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
                props.navigation.navigate("login");
                return;
            }

            console.log("Usuário carregado com sucesso, userId:", currentUserId);
            
            // Verificar se o userId foi definido no estado
            setUserId(currentUserId);
            console.log("userId definido no estado:", currentUserId);

            // Aguardar um momento para garantir que o userId foi definido
            await new Promise(resolve => setTimeout(resolve, 100));

            // buscar dados de corrida aberta na API para o usuario...
            console.log("Chamando RequestRideFromUser com userId:", currentUserId);
            const response = await RequestRideFromUser(currentUserId);

            if (!response.ride_id) {
                // Usuário não tem carona ativa - limpar estado e mostrar tela para criar nova
                console.log("Usuário não tem carona ativa - limpando estado");
                setStatus(""); // Status vazio permite edição
                setRideId(0);
                setDriverName("");
                setDropoffLocation(null);
                setRouteCoordinates([]);
                console.log("Status definido como vazio para permitir edição");
                
                // Obter localização real do dispositivo
                const location = await RequestPermissionAndGetLocation();

                if (location && location.latitude) {
                    console.log("Localização real obtida:", location);
                    setTitle("Encontre a sua carona agora");
                    setMyLocation(location);
                    
                    // Obter endereço da localização atual
                    await RequestAddressName(location.latitude, location.longitude);
                    
                    // Carregar endereços salvos do usuário
                    await loadUserAddresses();
                    
                    // Calcular rota se houver destino
                    if (dropoffAddress) {
                        await calculateRoute();
                    }
                } else {
                    // Não usar fallback fixo - insistir na localização real
                    console.log("Não foi possível obter localização real - solicitando novamente");
                    Alert.alert(
                        "Localização Necessária",
                        "Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.",
                        [
                            { 
                                text: "Tentar Novamente", 
                                onPress: () => {
                                    console.log("Usuário escolheu tentar novamente");
                                    LoadScreen();
                                }
                            },
                            { 
                                text: "Cancelar", 
                                onPress: () => props.navigation.goBack(),
                                style: "cancel"
                            }
                        ]
                    );
                    setIsLoading(false);
                    return;
                }

            } else {
                // Usuário tem carona ativa - mostrar status
                if (response.status == "P") {
                    setTitle("Aguardando motorista...");
                } else if (response.status == "A") {
                    setTitle("Carona confirmada");
                } else {
                    setTitle("Status da carona");
                }
                
                setMyLocation({
                    latitude: Number(response.pickup_latitude),
                    longitude: Number(response.pickup_longitude)
                });
                setPickupAddress(response.pickup_address);
                setDropoffAddress(response.dropoff_address);
                setStatus(response.status);
                setRideId(response.ride_id);
                setDriverName(response.driver_name + " - " + response.driver_phone);
            }
            
            console.log("Tela carregada com sucesso. myLocation:", myLocation, "status:", status);
            setIsLoading(false);
        } catch (error) {
            console.error("Erro ao carregar tela de passageiro:", error);
            Alert.alert("Erro", "Ocorreu um erro ao carregar a tela. Tente novamente.");
            setIsLoading(false);
        }
    }

    async function AskForRide() {
        try {
            console.log("Criando carona para usuário:", userId);
            
            if (!userId) {
                Alert.alert("Erro", "Usuário não identificado. Faça login novamente.");
                return;
            }

            if (!dropoffAddress || dropoffAddress.trim() === "") {
                Alert.alert("Erro", "Por favor, selecione um destino.");
                return;
            }

            if (!myLocation || !myLocation.latitude) {
                Alert.alert("Erro", "Não foi possível obter sua localização. Tente novamente.");
                return;
            }

            // Salvar endereços do usuário
            await saveUserAddresses();

            const json = {
                passenger_user_id: userId,
                pickup_address: pickupAddress || "Localização atual",
                dropoff_address: dropoffAddress,
                pickup_latitude: myLocation.latitude,
                pickup_longitude: myLocation.longitude
            }

            console.log("Dados da carona:", json);

            console.log("Enviando requisição para API...");
            const response = await api.post("/rides", json);
            console.log("Resposta da API:", response);
            console.log("Status da resposta:", response.status);
            console.log("Dados da resposta:", response.data);

            if (response.status === 200 || response.status === 201) {
                console.log("Carona criada com sucesso");
                
                // Atualizar o estado da carona se a resposta contiver dados
                if (response.data && response.data.ride_id) {
                    setRideId(response.data.ride_id);
                    setStatus("P"); // Pendente
                    console.log("Estado da carona atualizado - RideId:", response.data.ride_id);
                }
                
                Alert.alert("Sucesso", "Carona solicitada com sucesso! Aguardando motorista...", [
                    { text: "OK", onPress: () => props.navigation.goBack() }
                ]);
            } else {
                console.log("Erro na resposta da API - Status:", response.status);
                Alert.alert("Erro", "Não foi possível criar a carona. Tente novamente.");
            }

        } catch (error) {
            console.error("Erro ao criar carona:", error);
            HandleError(error);
        }

    }


    async function CancelRide() {
        try {
            console.log("Cancelando carona:", rideId, "para usuário:", userId);
            
            if (!userId || !rideId) {
                Alert.alert("Erro", "Dados inválidos para cancelar carona.");
                return;
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
                                    console.log("Carona cancelada com sucesso");
                                    Alert.alert("Sucesso", "Carona cancelada com sucesso!", [
                                        { text: "OK", onPress: () => props.navigation.goBack() }
                                    ]);
                                }
                            } catch (error) {
                                console.error("Erro ao cancelar carona:", error);
                                HandleError(error);
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error("Erro ao cancelar carona:", error);
            HandleError(error);
        }
    }

    async function FinishRide() {
        try {
            console.log("Finalizando carona:", rideId, "para usuário:", userId);
            
            if (!userId || !rideId) {
                Alert.alert("Erro", "Dados inválidos para finalizar carona.");
                return;
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
                                const json = {
                                    passenger_user_id: userId,
                                };

                                const response = await api.put("/rides/" + rideId + "/finish", json);

                                if (response.data) {
                                    console.log("Carona finalizada com sucesso");
                                    Alert.alert("Sucesso", "Carona finalizada com sucesso!", [
                                        { text: "OK", onPress: () => props.navigation.goBack() }
                                    ]);
                                }
                            } catch (error) {
                                console.error("Erro ao finalizar carona:", error);
                                HandleError(error);
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error("Erro ao finalizar carona:", error);
            HandleError(error);
        }
    }

    useEffect(() => {
        console.log("Tela de passageiro montada - iniciando carregamento");
        LoadScreen();
        
        // Testar API de geocodificação
        testGeocoding();
        
        // Cleanup function
        return () => {
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }
        };
    }, []);

    // Recarregar quando a tela receber foco (usuário voltando do dashboard)
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            console.log("Tela de passageiro recebeu foco - recarregando");
            // Aguardar um pouco antes de recarregar para evitar conflitos
            setTimeout(() => {
                LoadScreen();
            }, 100);
        });

        return unsubscribe;
    }, [props.navigation]);


    function closeSuggestions() {
        console.log("Fechando sugestões");
        setShowPickupSuggestions(false);
        setShowDropoffSuggestions(false);
        // Limpar as sugestões também
        setPickupSuggestions([]);
        setDropoffSuggestions([]);
    }

    function isFieldEditable() {
        // Campos são editáveis quando não há carona ativa (status vazio) ou quando não há rideId
        const editable = status === "" || status === null || status === undefined || rideId === 0;
        console.log("Verificando se campos são editáveis - status:", status, "rideId:", rideId, "editable:", editable);
        return editable;
    }

    // Função para atualizar localização em tempo real
    async function updateCurrentLocation() {
        try {
            console.log("=== ATUALIZANDO LOCALIZAÇÃO EM TEMPO REAL ===");
            
            const newLocation = await RequestPermissionAndGetLocation();
            if (newLocation && newLocation.latitude) {
                console.log("✅ Nova localização obtida:", newLocation);
                setMyLocation(newLocation);
                
                // Atualizar endereço da localização atual
                await RequestAddressName(newLocation.latitude, newLocation.longitude);
                
                // Recalcular rota se houver destino
                if (dropoffAddress) {
                    await calculateRoute();
                }
                
                return true;
            } else {
                console.log("❌ Não foi possível atualizar localização");
                return false;
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar localização:", error);
            return false;
        }
    }

    // Função de teste para verificar se a API está funcionando
    async function testGeocoding() {
        try {
            console.log("=== TESTE DE GEOCODIFICAÇÃO ===");
            const testQueries = ["São Paulo", "Brasília", "Rio de Janeiro"];
            
            for (let i = 0; i < testQueries.length; i++) {
                const testQuery = testQueries[i];
                console.log(`Teste ${i + 1} com: "${testQuery}"`);
                
                try {
                    const response = await geocodeAsync(testQuery);
                    console.log(`Resposta teste ${i + 1}:`, response?.length || 0, "resultados");
                    
                    if (response && response.length > 0) {
                        console.log(`✅ API funcionando - encontradas ${response.length} sugestões para "${testQuery}"`);
                        return true;
                    }
                } catch (error) {
                    console.log(`❌ Erro no teste ${i + 1}:`, error.message);
                }
            }
            
            console.log("❌ Todos os testes falharam");
            return false;
        } catch (error) {
            console.error("❌ Erro geral no teste de geocodificação:", error);
            return false;
        }
    }

    return <View style={styles.container}>

        {
            !isLoading && myLocation && myLocation.latitude ? <>
                {/* Removido overlay que pode estar bloqueando toques */}
                <MapView 
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={{
                        latitude: myLocation.latitude,
                        longitude: myLocation.longitude,
                        latitudeDelta: 0.004,
                        longitudeDelta: 0.004
                    }}
                >
                    {/* Marcador de origem */}
                    <Marker coordinate={{
                        latitude: myLocation.latitude,
                        longitude: myLocation.longitude
                    }}
                        title="Origem"
                        description={pickupAddress}
                        pinColor="green"
                    />

                    {/* Marcador de destino */}
                    {dropoffLocation && (
                        <Marker coordinate={{
                            latitude: dropoffLocation.latitude,
                            longitude: dropoffLocation.longitude
                        }}
                            title="Destino"
                            description={dropoffAddress}
                            pinColor="red"
                        />
                    )}

                    {/* Linha da rota */}
                    {routeCoordinates.length > 1 && (
                        <>
                            {console.log("Renderizando rota:", routeCoordinates)}
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeColor="#F7D600"
                                strokeWidth={3}
                                lineDashPattern={[1]}
                            />
                        </>
                    )}

                </MapView>
                {/* Header com título e botão voltar */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => props.navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>Selecionar destino</Text>
                </View>

                {/* Container principal com campos de origem e destino */}
                <View style={styles.mainContainer}>
                    {/* Campo de origem */}
                    <View style={styles.originContainer}>
                        <View style={styles.originIconContainer}>
                            <View style={styles.originDot}></View>
                            <View style={styles.originLine}></View>
                            <View style={styles.destinationDot}></View>
                        </View>
                        
                        <View style={styles.originFieldContainer}>
                            <View style={styles.originTextContainer}>
                                <Text style={styles.originLabel}>Partida</Text>
                                <Text style={styles.originAddress}>{pickupAddress || "Estrada Sem Nome"}</Text>
                            </View>
                            <TouchableOpacity style={styles.favoriteButton}>
                                <Text style={styles.favoriteIcon}>⭐</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Campo de destino */}
                    <View style={styles.destinationContainer}>
                        <View style={styles.destinationFieldContainer}>
                            <View style={styles.destinationTextContainer}>
                                <Text style={styles.destinationLabel}>Destino</Text>
                                <TextInput 
                                    style={styles.destinationInput}
                                    value={dropoffAddress}
                                    placeholder="Para onde você vai?"
                                    placeholderTextColor="#999"
                                    onChangeText={(text) => {
                                        console.log("=== CAMPO DESTINO ALTERADO ===");
                                        console.log("Texto digitado:", text);
                                        setDropoffAddress(text);
                                        getAddressSuggestions(text, false);
                                        
                                        if (userId) {
                                            setTimeout(() => saveUserAddresses(), 500);
                                        }
                                    }}
                                    onFocus={() => {
                                        console.log("Campo destino focado");
                                        if (!dropoffAddress.trim()) {
                                            getAddressSuggestions("Brasil", false);
                                        } else if (dropoffSuggestions.length > 0) {
                                            setShowDropoffSuggestions(true);
                                        }
                                    }}
                                    editable={isFieldEditable()}
                                />
                            </View>
                            <TouchableOpacity style={styles.addStopButton}>
                                <Text style={styles.addStopIcon}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sugestões de destino */}
                    {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {console.log("🎯 Renderizando sugestões de destino:", dropoffSuggestions.length, "itens")}
                            {dropoffSuggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionItem}
                                    onPress={() => selectSuggestion(suggestion, false)}
                                >
                                    <View style={styles.suggestionContent}>
                                        <Text style={styles.suggestionIcon}>📍</Text>
                                        <View style={styles.suggestionTextContainer}>
                                            <Text style={styles.suggestionText}>{suggestion.address}</Text>
                                            {suggestion.subAddress ? (
                                                <Text style={styles.suggestionSubText}>{suggestion.subAddress}</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            
                            {/* Opções extras */}
                            <View style={styles.extraOptionsContainer}>
                                <TouchableOpacity
                                    style={styles.extraOptionItem}
                                    onPress={() => {
                                        setDropoffAddress("");
                                        setShowDropoffSuggestions(false);
                                    }}
                                >
                                    <View style={styles.suggestionContent}>
                                        <Text style={styles.extraOptionIcon}>🚫</Text>
                                        <Text style={styles.extraOptionText}>Não informar destino</Text>
                                    </View>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={styles.extraOptionItem}
                                    onPress={() => {
                                        setShowDropoffSuggestions(false);
                                    }}
                                >
                                    <View style={styles.suggestionContent}>
                                        <Text style={styles.extraOptionIcon}>🗺️</Text>
                                        <Text style={styles.extraOptionText}>Escolher no mapa</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Botão de confirmação flutuante */}
                {status == "" && dropoffAddress ? (
                    <View style={styles.confirmButtonContainer}>
                        <TouchableOpacity 
                            style={styles.confirmButton}
                            activeOpacity={0.7}
                            onPress={AskForRide}
                        >
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {status == "P" && (
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={CancelRide}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                )}

                {status == "A" && (
                    <View style={styles.driverInfo}>
                        <Text style={styles.driverLabel}>Motorista</Text>
                        <Text style={styles.driverName}>{driverName}</Text>
                        <TouchableOpacity 
                            style={styles.finishButton}
                            onPress={FinishRide}
                        >
                            <Text style={styles.finishButtonText}>Finalizar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </>

                : <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#F7D600" />
                    <Text style={{ marginTop: 10, color: "#666" }}>Carregando...</Text>
                </View>
        }



    </View>
}

export default Passenger;