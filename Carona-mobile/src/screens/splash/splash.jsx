import { Image, ImageBackground, Text, View, Animated, Alert, Linking } from "react-native";
import { styles } from "./splash.style.js";
import { useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestForegroundPermissionsAsync } from "expo-location";

function Splash(props) {

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        startAnimation();
        checkAuthAndNavigate();
    }, []);

    function startAnimation() {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }

    async function requestLocationPermission() {
        try {
            console.log("Solicitando permissão de localização no splash...");
            const { granted } = await requestForegroundPermissionsAsync();
            
            if (granted) {
                console.log("Permissão de localização concedida no splash");
                await AsyncStorage.setItem('locationPermission', 'granted');
            } else {
                console.log("Permissão de localização negada no splash");
                await AsyncStorage.setItem('locationPermission', 'denied');
                
                Alert.alert(
                    "Permissão de Localização",
                    "O CaronAPP precisa de acesso à sua localização para funcionar corretamente. Você pode permitir o acesso nas configurações do seu dispositivo.",
                    [
                        { text: "Continuar", style: "default" },
                        { text: "Configurações", onPress: () => Linking.openSettings() }
                    ]
                );
            }
        } catch (error) {
            console.error("Erro ao solicitar permissão de localização:", error);
            await AsyncStorage.setItem('locationPermission', 'error');
        }
    }

    async function checkAuthAndNavigate() {
        try {
            // Aguarda 2 segundos para mostrar a animação
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Solicitar permissão de localização
            await requestLocationPermission();
            
            const userToken = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');
            
            if (userToken && userData) {
                // Usuário já está logado, ir para dashboard
                props.navigation.replace("dashboard");
            } else {
                // Usuário não está logado, ir para login
                props.navigation.replace("login");
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            props.navigation.replace("login");
        }
    }

    return (
        <ImageBackground 
            source={require("../../assets/background.png")} 
            resizeMode="cover" 
            style={styles.container}
        >
            <View style={styles.content}>
                <Animated.View 
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <Image 
                        source={require("../../assets/logo.png")} 
                        style={styles.logo} 
                    />
                    <Text style={styles.appName}>CARONAPP</Text>
                    <Text style={styles.appSubtitle}>PEÇA E DÊ CARONA</Text>
                </Animated.View>
            </View>
        </ImageBackground>
    );
}

export default Splash; 