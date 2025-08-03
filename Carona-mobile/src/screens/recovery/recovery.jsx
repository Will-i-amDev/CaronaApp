import { Alert, Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./recovery.style.js";
import icons from "../../constants/icons.js";
import { useState } from "react";
import { api, HandleError } from "../../constants/api.js";

function Recovery(props) {

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleRecovery() {
        if (!email) {
            Alert.alert("Erro", "Preencha o campo de e-mail");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/auth/recovery", {
                email: email
            });

            if (response.data.success) {
                Alert.alert(
                    "E-mail enviado", 
                    "Um link de recuperação foi enviado para seu e-mail. Verifique sua caixa de entrada.",
                    [
                        {
                            text: "OK",
                            onPress: () => props.navigation.navigate("login")
                        }
                    ]
                );
            }

        } catch (error) {
            if (error.response?.status === 404) {
                Alert.alert("E-mail não encontrado", "Este e-mail não está registrado em nossa base de dados.");
            } else {
                HandleError(error);
            }
        } finally {
            setIsLoading(false);
        }
    }

    function goBack() {
        props.navigation.goBack();
    }

    return <ImageBackground source={icons.bg} resizeMode="cover" style={styles.bg}>
        
        <View style={styles.container}>
            
            <View style={styles.logoContainer}>
                <Image source={icons.logo} style={styles.logo} />
                <Text style={styles.appName}>CARONAPP</Text>
                <Text style={styles.appSubtitle}>PEÇA E DÊ CARONA</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.recoveryText}>Recuperação de senha</Text>
                <Text style={styles.recoverySubtitle}>Digite seu e-mail para receber um link de recuperação</Text>
                
                <TextInput 
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                
                <TouchableOpacity 
                    style={[styles.recoveryButton, isLoading && styles.recoveryButtonDisabled]} 
                    onPress={handleRecovery}
                    disabled={isLoading}
                >
                    <Text style={styles.recoveryButtonText}>
                        {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Text style={styles.backButtonText}>Voltar ao login</Text>
                </TouchableOpacity>
            </View>

        </View>

    </ImageBackground>
}

export default Recovery; 