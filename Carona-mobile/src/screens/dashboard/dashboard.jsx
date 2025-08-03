import { Alert, Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import icons from "../../constants/icons.js";
import { styles } from "./dashboard.style.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from "react";

function Dashboard(props) {

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    async function loadUserData() {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                setUserData(JSON.parse(userDataString));
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    function OpenPassenger() {
        props.navigation.navigate("passenger");
    }

    function OpenRide() {
        props.navigation.navigate("ride");
    }

    async function handleLogout() {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            props.navigation.navigate("login");
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    return <ImageBackground source={icons.bg} resizeMode="cover" style={styles.bg}>
        
        <View style={styles.container}>
            
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Image source={icons.logo} style={styles.logo} />
                    <Text style={styles.appName}>CARONAPP</Text>
                    <Text style={styles.appSubtitle}>PEÇA E DÊ CARONA</Text>
                </View>
                
                {userData && (
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeText}>Bem-vindo,</Text>
                        <Text style={styles.userName}>{userData.name}</Text>
                        <Text style={styles.userType}>
                            {userData.user_type === 'passenger' ? 'Passageiro' : 'Motorista'}
                        </Text>
                    </View>
                )}
                
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>O que você deseja fazer?</Text>
                
                <TouchableOpacity style={styles.optionButton} onPress={OpenPassenger}>
                    <Image source={icons.passenger} style={styles.optionIcon} />
                    <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Passageiro</Text>
                        <Text style={styles.optionSubtitle}>Encontre uma carona para você</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton} onPress={OpenRide}>
                    <Image source={icons.driver} style={styles.optionIcon} />
                    <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Motorista</Text>
                        <Text style={styles.optionSubtitle}>Ofereça carona em seu carro</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </View>

    </ImageBackground>
}

export default Dashboard; 