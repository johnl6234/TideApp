import React, { useEffect, useRef, useState } from "react";
import MapView, { Callout, MapMarker, Marker } from "react-native-maps";
import { ActivityIndicator, SafeAreaView, View, Text } from "react-native";
import { API_BASE_URL, API_KEY } from "@env";
import { Station, StationFeature } from "../types/types";
import {  useFocusEffect, useNavigation } from "@react-navigation/native";

export default function TideMapScreen() {

    const navigation = useNavigation<any>();
    const [selectedStation, setSelectedStation] = useState<string | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);

    // Keep refs for markers so we can trigger callouts
    const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});

    // Fetch stations from API

    const fetchStations = async () => { 
            try {
                const response = await fetch(`${API_BASE_URL}/Stations`, {
                    headers: { "Ocp-Apim-Subscription-Key": API_KEY },
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const text = await response.text();
                if (!text) throw new Error("Empty response from API");

                const data = JSON.parse(text);

                if (Array.isArray(data.features)) {
                    const stationsData: Station[] = data.features
                        .map((f: StationFeature) => {
                            const props = f.properties;
                            const coords = f.geometry?.coordinates;

                            if (!props?.Id || !props?.Name || !coords || coords.length < 2) return null;

                            return {
                                StationId: props.Id,
                                Name: props.Name,
                                Latitude: coords[1],
                                Longitude: coords[0],
                            };
                        })
                        // @ts-ignore
                        .filter((s): s is Station => s !== null);
                    setStations(stationsData);
                } else {
                    setStations([]);
                }
            } catch (error) {
                console.error("Error fetching stations:", error);
                setStations([]);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchStations();
    }, []); 

    useFocusEffect(
    React.useCallback(() => {
        fetchStations();
      console.log("In Focus")
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
    );

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 57,
                    longitude: -5,
                    latitudeDelta: 3,
                    longitudeDelta: 3,
                }}
            >
                {stations.map(station => (
                    <Marker
                        key={station.StationId}
                        coordinate={{ latitude: station.Latitude, longitude: station.Longitude }}
                        title={station.Name}
                        description="Tap again to view tides"
                        onPress={() => {
                            if (selectedStation === station.StationId) {
                                // Second tap → navigate
                                navigation.navigate("TideDetails", {
                                    stationId: station.StationId,
                                    stationName: station.Name,
                                });
                                setSelectedStation(null); // reset
                            } else {
                                // First tap → show name
                                setSelectedStation(station.StationId);
                            }
                        }}
                    >
                        {selectedStation === station.StationId && (
                            <Callout tooltip>
                                <View style={{ backgroundColor: "#fff", padding: 5, borderRadius: 5 }}>
                                    <Text>{station.Name}</Text>
                                </View>
                            </Callout>
                        )}
                    </Marker>
                ))}
            </MapView>
        </SafeAreaView>
    );
}
