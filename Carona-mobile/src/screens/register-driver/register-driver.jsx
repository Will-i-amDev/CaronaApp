import { Alert, Image, ImageBackground, Text, TextInput, TouchableOpacity, View, ScrollView, Modal, Animated } from "react-native";
import { styles } from "./register-driver.style.js";
import icons from "../../constants/icons.js";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, HandleError } from "../../constants/api.js";

function RegisterDriver(props) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carPlate, setCarPlate] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const errorFadeAnim = useRef(new Animated.Value(0)).current;
    const errorScaleAnim = useRef(new Animated.Value(0)).current;

    async function handleRegister() {
        if (!name || !email || !phone || !password || !confirmPassword || !carModel || !carPlate) {
            Alert.alert("Erro", "Preencha todos os campos");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/auth/register-driver", {
                name: name,
                email: email,
                phone: phone,
                password: password,
                car_model: carModel,
                car_plate: carPlate,
                user_type: "driver"
            });

            if (response.data.success) {
                // Fazer login automático após cadastro bem-sucedido
                await autoLoginAfterRegister();
            } else {
                setErrorMessage(response.data.error || "Erro ao criar conta");
                showErrorAnimation();
            }

        } catch (error) {
            if (error.response?.data?.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Erro ao conectar com o servidor");
            }
            showErrorAnimation();
        } finally {
            setIsLoading(false);
        }
    }

    function showSuccessAnimation() {
        setShowSuccessModal(true);
        
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
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

    function showErrorAnimation() {
        setShowErrorModal(true);
        
        Animated.parallel([
            Animated.timing(errorFadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(errorScaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }

    function hideSuccessModal() {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setShowSuccessModal(false);
            props.navigation.navigate("dashboard");
        });
    }

    function hideErrorModal() {
        Animated.parallel([
            Animated.timing(errorFadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(errorScaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setShowErrorModal(false);
        });
    }

    async function autoLoginAfterRegister() {
        try {
            const loginResponse = await api.post("/auth/login", {
                email: email,
                password: password
            });

            if (loginResponse.data.token) {
                await AsyncStorage.setItem('userToken', loginResponse.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(loginResponse.data.user));
                showSuccessAnimation();
            } else {
                setErrorMessage("Erro ao fazer login automático");
                showErrorAnimation();
            }
        } catch (error) {
            console.error("Erro no login automático:", error);
            setErrorMessage("Erro ao fazer login automático");
            showErrorAnimation();
        }
    }

    function goBack() {
        props.navigation.goBack();
    }

    return <ImageBackground source={icons.bg} resizeMode="cover" style={styles.bg}>
        
        <View style={styles.container}>
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                
                <View style={styles.logoContainer}>
                    <Image source={icons.logo} style={styles.logo} />
                    <Text style={styles.appName}>CARONAPP</Text>
                    <Text style={styles.appSubtitle}>CADASTRO DE MOTORISTA</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Criar conta de motorista</Text>
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="Nome completo"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="E-mail"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="Telefone"
                        placeholderTextColor="#999"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="Modelo do carro"
                        placeholderTextColor="#999"
                        value={carModel}
                        onChangeText={setCarModel}
                        autoCapitalize="words"
                    />
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="Placa do carro"
                        placeholderTextColor="#999"
                        value={carPlate}
                        onChangeText={setCarPlate}
                        autoCapitalize="characters"
                    />
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                    
                    <TextInput 
                        style={styles.input}
                        placeholder="Confirmar senha"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true}
                    />
                    
                    <TouchableOpacity 
                        style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.registerButtonText}>
                            {isLoading ? "Criando conta..." : "Criar Conta"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de Sucesso */}
            <Modal
                transparent={true}
                visible={showSuccessModal}
                animationType="none"
            >
                <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                    <Animated.View 
                        style={[
                            styles.successModal, 
                            { 
                                transform: [{ scale: scaleAnim }] 
                            }
                        ]}
                    >
                        <View style={styles.successIconContainer}>
                            <Text style={styles.successIcon}>✓</Text>
                        </View>
                        <Text style={styles.successTitle}>Sucesso!</Text>
                        <Text style={styles.successMessage}>
                            Conta de motorista criada com sucesso!
                        </Text>
                        <TouchableOpacity 
                            style={styles.successButton} 
                            onPress={hideSuccessModal}
                        >
                            <Text style={styles.successButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Modal de Erro */}
            <Modal
                transparent={true}
                visible={showErrorModal}
                animationType="none"
            >
                <Animated.View style={[styles.modalOverlay, { opacity: errorFadeAnim }]}>
                    <Animated.View 
                        style={[
                            styles.errorModal, 
                            { 
                                transform: [{ scale: errorScaleAnim }] 
                            }
                        ]}
                    >
                        <View style={styles.errorIconContainer}>
                            <Text style={styles.errorIcon}>✕</Text>
                        </View>
                        <Text style={styles.errorTitle}>Erro!</Text>
                        <Text style={styles.errorMessage}>
                            {errorMessage}
                        </Text>
                        <TouchableOpacity 
                            style={styles.errorButton} 
                            onPress={hideErrorModal}
                        >
                            <Text style={styles.errorButtonText}>OK</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Modal>

        </View>

    </ImageBackground>
}

export default RegisterDriver; 