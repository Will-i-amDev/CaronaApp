import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../passenger.style.js';

export const AddressSuggestions = ({ 
    showSuggestions, 
    suggestions, 
    onSelectSuggestion,
    onClearDestination,
    onChooseOnMap 
}) => {
    if (!showSuggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => onSelectSuggestion(suggestion)}
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
                    onPress={onClearDestination}
                >
                    <View style={styles.suggestionContent}>
                        <Text style={styles.extraOptionIcon}>🚫</Text>
                        <Text style={styles.extraOptionText}>Não informar destino</Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.extraOptionItem}
                    onPress={onChooseOnMap}
                >
                    <View style={styles.suggestionContent}>
                        <Text style={styles.extraOptionIcon}>🗺️</Text>
                        <Text style={styles.extraOptionText}>Escolher no mapa</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}; 