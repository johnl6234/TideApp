// screens/LocationScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { API_BASE_URL, API_KEY } from "@env";

import { styles } from "../../global";
import { Station, StationFeature } from "../types/types";



export default function LocationScreen({ navigation }: any) {
  const [stations, setStations] = useState<Station[]>([]);
  const [filtered, setFiltered] = useState<Station[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch stations from API
  useEffect(() => {
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
                Latitude: coords[1],  // lat
                Longitude: coords[0], // lon
              };
            })
            // @ts-ignore
            .filter((s): s is Station => s !== null); // type guard


          setStations(stationsData);
        } else {
          console.warn("API did not return an array, got:", data);
          setStations([]);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on search
  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      stations.filter((station) => station.Name.toLowerCase().includes(lower))
    );
  }, [search, stations]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Search station..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item.StationId + "_" + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("TideDetails", {
                stationId: item.StationId,
                stationName: item.Name,
              })
            }
          >
            <Text style={styles.name}>{item.Name}</Text>
            <Text style={styles.coords}>
              {item.Latitude.toFixed(2)}, {item.Longitude.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

