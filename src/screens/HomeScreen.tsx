import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { API_BASE_URL, API_KEY } from "@env";
import { FavouritesContext } from "../context/FavouritesContext";

import {styles} from "../../global"
import { Station } from "../types/types";

export default function HomeScreen({ navigation }: any) {
  const { favourites, toggleFavourite } = useContext(FavouritesContext);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Stations`, {
          headers: { "Ocp-Apim-Subscription-Key": API_KEY },
        });
        const data = await response.json();

        let parsed: Station[] = [];
        if (Array.isArray(data)) parsed = data;
        else if (data?.features && Array.isArray(data.features)) {
          parsed = data.features.map((f: any) => ({
            StationId: f.properties.StationId || f.properties.Id,
            Name: f.properties.Name,
            Latitude: f.geometry.coordinates[1],
            Longitude: f.geometry.coordinates[0],
          }));
        }

        setStations(parsed);
      } catch (err) {
        console.error(err);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const favStations = Array.isArray(stations)
    ? stations.filter(st => favourites.includes(st.StationId))
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>⭐ Favourite Stations</Text>

      {favStations.length === 0 ? (
        <Text>No favourites yet. Tap a station star to add!</Text>
      ) : (
        <FlatList
          data={favStations}
          keyExtractor={item => item.StationId}
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

              <TouchableOpacity
                onPress={() => toggleFavourite(item.StationId)}
                style={{ position: "absolute", right: 15, top: 15 }}
              >
                <Text style={{ fontSize: 22, color: "#FFD700" }}>★</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}


