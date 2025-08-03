import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUserData = () => {
    const [userId, setUserId] = useState(null);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            
            if (!userData) {
                console.error("userData não encontrado no AsyncStorage");
                return null;
            }

            const user = JSON.parse(userData);
            const currentUserId = user.user_id;
            
            if (!currentUserId) {
                console.error("userId não encontrado nos dados do usuário");
                return null;
            }

            setUserId(currentUserId);
            return currentUserId;
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
            return null;
        }
    };

    const clearOtherUserData = async (currentUserId) => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const addressKeys = keys.filter(key => 
                key.startsWith('user_') && 
                key.endsWith('_addresses') && 
                !key.includes(`user_${currentUserId}_`)
            );
            
            if (addressKeys.length > 0) {
                await AsyncStorage.multiRemove(addressKeys);
            }
        } catch (error) {
            console.error("Erro ao limpar dados de outros usuários:", error);
        }
    };

    return {
        userId,
        setUserId,
        loadUserData,
        clearOtherUserData
    };
}; 