import { Alert, Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./login.style.js";
import icons from "../../constants/icons.js";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, HandleError } from "../../constants/api.js";

function Login(props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Erro", "Preencha todos os campos");
            return;
        }

        try {
            const response = await api.post("/auth/login", {
                email: email,
                password: password
            });

            if (response.data.token) {
                console.log("Dados do usuário recebidos:", response.data.user);
                await AsyncStorage.setItem('userToken', response.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
                console.log("Dados salvos no AsyncStorage");
                props.navigation.navigate("dashboard");
            }

        } catch (error) {
            HandleError(error);
        }
    }

    function openRegisterPassenger() {
        props.navigation.navigate("register-passenger");
    }

    function openRegisterDriver() {
        props.navigation.navigate("register-driver");
    }

    function openRecovery() {
        props.navigation.navigate("recovery");
    }

    return <ImageBackground source={icons.bg} resizeMode="cover" style={styles.bg}>
        
        <View style={styles.container}>
            
            <View style={styles.logoContainer}>
                <Image source={icons.logo} style={styles.logo} />
                <Text style={styles.appName}>CARONAPP</Text>
                <Text style={styles.appSubtitle}>PEÇA E DÊ CARONA</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.loginText}>Tem conta ? faça login</Text>
                
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
                    placeholder="Senha"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Acessar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.forgotPasswordLink} onPress={openRecovery}>
                    <Text style={styles.forgotPasswordText}>
                        Esqueceu a senha?{" "}
                        <Text style={styles.registerHighlight}>Recuperar agora.</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
                <TouchableOpacity style={styles.registerLink} onPress={openRegisterPassenger}>
                    <Text style={styles.registerText}>
                        Não tenho conta passageiro.{" "}
                        <Text style={styles.registerHighlight}>Criar conta agora.</Text>
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.registerLink} onPress={openRegisterDriver}>
                    <Text style={styles.registerText}>
                        Não tenho conta motorista.{" "}
                        <Text style={styles.registerHighlight}>Criar conta agora.</Text>
                    </Text>
                </TouchableOpacity>
            </View>

        </View>

    </ImageBackground>
}

export default Login;
