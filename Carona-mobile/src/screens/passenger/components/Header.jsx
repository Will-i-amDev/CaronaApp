import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../passenger.style.js';

export const Header = ({ onGoBack }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={onGoBack}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Selecionar destino</Text>
        </View>
    );
}; 