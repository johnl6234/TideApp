import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  SafeAreaView,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Dimensions,
  Switch,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { API_BASE_URL, API_KEY } from "@env";
import { FavouritesContext } from "../context/FavouritesContext";

type TidalEvent = {
  EventType: "HighWater" | "LowWater";
  DateTime: string;
  Height: number;
};

type TidesByDay = {
  title: string;
  data: TidalEvent[];
};

type TideCardData = {
  date: string; // string in "DD/MM/YYYY" format
  events: TidalEvent[];
};

export default function TideDetailsScreen({ route }: any) {
  const { stationId, stationName } = route.params;
  const { favourites, toggleFavourite } = useContext(FavouritesContext);

  const [selectedDate, setSelectedDate] = useState<string>(""); // date as string
  const [loading, setLoading] = useState(true);
  const [tidesByDay, setTidesByDay] = useState<TidesByDay[]>([]);
  const [useUKPlusOne, setUseUKPlusOne] = useState(true);

  const isFavourite = favourites.includes(stationId);

  // --- Fetch tide data ---
  useEffect(() => {
    const fetchTides = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/Stations/${stationId}/TidalEvents`,
          {
            headers: { "Ocp-Apim-Subscription-Key": API_KEY },
          }
        );
        const data: TidalEvent[] = await response.json();
        const grouped = groupTidesByDay(data);
        setTidesByDay(grouped);
        if (grouped.length > 0) setSelectedDate(grouped[0].title); // default to first day
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTides();
  }, [stationId]);

  // --- Prepare FlatList data ---
  const flatListData: TideCardData[] = tidesByDay.map(day => ({
    date: day.title,
    events: day.data,
  }));

  // --- Prepare chart data for selected date ---
  const { chartLabels, chartValues } = useMemo(() => {
    if (!selectedDate) return { chartLabels: [], chartValues: [] };

    const dayData = tidesByDay.find(day => day.title === selectedDate)?.data || [];

    const sorted = dayData
      .map(event => {
        const dateTime = new Date(event.DateTime);
        if (useUKPlusOne) dateTime.setHours(dateTime.getHours() + 1);
        return { ...event, dateTime };
      })
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    const labels = sorted.map(t =>
      t.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
    const values = sorted.map(t => t.Height);

    return { chartLabels: labels, chartValues: values };
  }, [selectedDate, tidesByDay, useUKPlusOne]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  // --- Handle card click ---
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  // --- Render FlatList card ---
  const renderTideCardItem = ({ item }: { item: TideCardData }) => {
    const lowTides = item.events.filter(e => e.EventType === "LowWater");
    const highTides = item.events.filter(e => e.EventType === "HighWater");

    return (
      <TouchableOpacity onPress={() => handleSelectDate(item.date)}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>{item.date}</Text>
          <View style={styles.tideRow}>
            <View style={styles.tideColumn}>
              {lowTides.map((t, idx) => (
                <View key={idx} style={styles.tideBox}>
                  <Text style={styles.tideType}>Low</Text>
                  <Text style={styles.tideHeight}>{t.Height.toFixed(2)}m</Text>
                  <Text style={styles.tideTime}>
                    {new Date(t.DateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.tideColumn}>
              {highTides.map((t, idx) => (
                <View key={idx} style={styles.tideBox}>
                  <Text style={styles.tideType}>High</Text>
                  <Text style={styles.tideHeight}>{t.Height.toFixed(2)}m</Text>
                  <Text style={styles.tideTime}>
                    {new Date(t.DateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stationHeader}>
        <Text style={styles.stationName}>{stationName}</Text>
        <TouchableOpacity onPress={() => toggleFavourite(stationId)}>
          <Text style={[styles.star, isFavourite && styles.starActive]}>
            {isFavourite ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ marginRight: 10 }}>UK+1 Hour:</Text>
        <Switch
          value={useUKPlusOne}
          onValueChange={val => setUseUKPlusOne(val)}
          trackColor={{ false: "#ff0000ff", true: "#00ff00ff" }}
          thumbColor={"#f4f3f4"}
        />
      </View>

      {chartValues.length > 0 ? (
        <LineChart
          data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisSuffix="m"
          fromZero
          chartConfig={{
            backgroundColor: "#f0f8ff",
            backgroundGradientFrom: "#f0f8ff",
            backgroundGradientTo: "#e0f8ff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0,123,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#007bff" },
          }}
          bezier
          style={{ marginVertical: 10, borderRadius: 16 }}
        />
      ) : (
        <Text>No tide data for selected date</Text>
      )}

      <FlatList
        data={flatListData}
        keyExtractor={(item, index) => item.date + index}
        renderItem={renderTideCardItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

// --- Helper to group tides by day ---
const groupTidesByDay = (events: TidalEvent[]): TidesByDay[] => {
  const grouped: Record<string, TidalEvent[]> = {};
  events.forEach(event => {
    const date = new Date(event.DateTime).toLocaleDateString("en-GB", { timeZone: "Europe/London" });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(event);
  });
  return Object.entries(grouped).map(([dateStr, events]) => ({ title: dateStr, data: events }));
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f8ff" },
  stationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  stationName: { fontSize: 24, fontWeight: "bold" },
  star: { fontSize: 28, color: "#888" },
  starActive: { color: "#FFD700" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  tideRow: { flexDirection: "row", justifyContent: "space-between" },
  tideColumn: { flex: 1, justifyContent: "space-between" },
  tideBox: { backgroundColor: "#f0f8ff", borderRadius: 8, padding: 8, marginBottom: 8, alignItems: "center" },
  tideType: { fontWeight: "bold" },
  tideHeight: { fontSize: 16, color: "#007bff" },
  tideTime: { fontSize: 14, color: "#555" },
});
