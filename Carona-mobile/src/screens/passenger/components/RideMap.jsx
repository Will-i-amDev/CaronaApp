import React from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";
import { styles } from '../passenger.style.js';

export const RideMap = ({ 
    myLocation, 
    dropoffLocation, 
    routeCoordinates, 
    pickupAddress, 
    dropoffAddress,
    mapRef 
}) => {
    if (!myLocation || !myLocation.latitude) {
        return null;
    }

    return (
        <MapView 
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
                latitude: myLocation.latitude,
                longitude: myLocation.longitude,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004
            }}
        >
            {/* Marcador de origem */}
            <Marker 
                coordinate={{
                    latitude: myLocation.latitude,
                    longitude: myLocation.longitude
                }}
                title="Origem"
                description={pickupAddress}
                pinColor="green"
            />

            {/* Marcador de destino */}
            {dropoffLocation && (
                <Marker 
                    coordinate={{
                        latitude: dropoffLocation.latitude,
                        longitude: dropoffLocation.longitude
                    }}
                    title="Destino"
                    description={dropoffAddress}
                    pinColor="red"
                />
            )}

            {/* Linha da rota */}
            {routeCoordinates.length > 1 && (
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="#F7D600"
                    strokeWidth={3}
                    lineDashPattern={[1]}
                />
            )}
        </MapView>
    );
}; 