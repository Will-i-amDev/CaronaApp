import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    //baseURL: "http://localhost:3001",
    baseURL: "http://192.168.1.7:3001",
    timeout: 10000
});

// Interceptor para adicionar token de autorização automaticamente
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Erro ao adicionar token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido - redirecionar para login
            try {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userData');
                // Aqui você pode adicionar uma navegação para login se necessário
            } catch (clearError) {
                console.error('Erro ao limpar dados de autenticação:', clearError);
            }
        }
        return Promise.reject(error);
    }
);

function HandleError(error) {
    if (error.response?.data.error)
        Alert.alert(error.response?.data.error);
    else
        Alert.alert("Ocorreu um erro. Tente novamente mais tarde");
}

export { api, HandleError };