import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../passenger.style.js';

export const AddressInput = ({ 
    pickupAddress, 
    dropoffAddress, 
    onDropoffChange, 
    onDropoffFocus,
    isEditable 
}) => {
    return (
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
                            onChangeText={onDropoffChange}
                            onFocus={onDropoffFocus}
                            editable={isEditable}
                        />
                    </View>
                    <TouchableOpacity style={styles.addStopButton}>
                        <Text style={styles.addStopIcon}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}; 