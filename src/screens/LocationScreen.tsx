// screens/LocationScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { API_BASE_URL, API_KEY } from "@env";

type Station = {
  StationId: string;
  Name: string;
  Latitude: number;
  Longitude: number;
};

interface StationFeature {
  geometry: any;
  properties: any;
  type: string;
}

interface StationsResponse {
  features: StationFeature[];
}

export default function LocationScreen({ navigation }: any) {
  const [stations, setStations] = useState<Station[]>([]);
  const [filtered, setFiltered] = useState<Station[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Stations`, {
        headers: { "Ocp-Apim-Subscription-Key": API_KEY },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Ensure we only set if it's an array
      if (Array.isArray(data)) {
        setStations(data);
      } else {
        console.warn("API did not return an array, got:", data);
        setStations([]); // fallback
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
      setStations([]); // fallback
    } finally {
      setLoading(false);
    }
  };
  fetchStations();
}, []);



  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(stations.filter(station => station.Name.toLowerCase().includes(lower)));
  }, [search, stations]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search station..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.StationId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("TideDetails", { stationId: item.StationId, stationName: item.Name })}
          >
            <Text style={styles.name}>{item.Name}</Text>
            <Text style={styles.coords}>
              {item.Latitude.toFixed(2)}, {item.Longitude.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f0f8ff" },
  input: { backgroundColor: "white", padding: 10, borderRadius: 8, marginBottom: 10 },
  item: { padding: 15, backgroundColor: "white", marginBottom: 8, borderRadius: 8 }, // <-- item here
  name: { fontSize: 16, fontWeight: "bold" },
  coords: { fontSize: 14, color: "gray" },
});
