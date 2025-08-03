import { useState, useRef } from 'react';
import { geocodeAsync } from "expo-location";

export const useAddressSuggestions = () => {
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
    const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
    const suggestionTimeoutRef = useRef(null);

    const getAddressSuggestions = async (query, isPickup = true) => {
        if (!query || query.trim().length === 0) {
            setDropoffSuggestions([]);
            setShowDropoffSuggestions(false);
            return;
        }

        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        suggestionTimeoutRef.current = setTimeout(async () => {
            try {
                const searchQueries = [
                    query.trim(),
                    `${query.trim()}, Brasil`,
                    `${query.trim()}, BR`,
                    query.trim().toLowerCase()
                ];

                let response = null;
                
                for (let i = 0; i < searchQueries.length; i++) {
                    const searchQuery = searchQueries[i];
                    
                    try {
                        response = await geocodeAsync(searchQuery);
                        
                        if (response && response.length > 0) {
                            break;
                        }
                    } catch (error) {
                        continue;
                    }
                }

                if (response && response.length > 0) {
                    const suggestions = response.slice(0, 8).map((item) => {
                        const mainAddress = item.name || item.street || "Endereço não especificado";
                        const details = [];
                        
                        if (item.street && item.street !== mainAddress) {
                            details.push(item.street);
                        }
                        if (item.city && item.city !== item.street) {
                            details.push(item.city);
                        }
                        if (item.region && item.region !== item.city) {
                            details.push(item.region);
                        }
                        if (item.country && item.country !== item.region) {
                            details.push(item.country);
                        }

                        const subAddress = details.join(', ');

                        return {
                            address: mainAddress,
                            subAddress: subAddress,
                            coordinates: {
                                latitude: item.latitude,
                                longitude: item.longitude
                            }
                        };
                    });

                    setDropoffSuggestions(suggestions);
                    setShowDropoffSuggestions(true);
                } else {
                    setDropoffSuggestions([]);
                    setShowDropoffSuggestions(false);
                }
            } catch (error) {
                console.error("Erro ao buscar sugestões:", error);
                setDropoffSuggestions([]);
                setShowDropoffSuggestions(false);
            }
        }, 200);
    };

    const closeSuggestions = () => {
        setShowDropoffSuggestions(false);
        setDropoffSuggestions([]);
    };

    return {
        dropoffSuggestions,
        showDropoffSuggestions,
        getAddressSuggestions,
        closeSuggestions
    };
}; 