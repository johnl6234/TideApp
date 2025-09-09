import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  Text,
  SectionList,
  ActivityIndicator,
  StyleSheet,
  View,
  Dimensions,
  Switch,
  TouchableOpacity,
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

export default function TideDetailsScreen({ route }: any) {
  const { stationId, stationName } = route.params;
  const { favourites, toggleFavourite } = useContext(FavouritesContext);

  const [loading, setLoading] = useState(true);
  const [tidesByDay, setTidesByDay] = useState<TidesByDay[]>([]);
  const [useUKPlusOne, setUseUKPlusOne] = useState(true);

  const isFavourite = favourites.includes(stationId);

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
        setTidesByDay(groupTidesByDay(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTides();
  }, [stationId]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  // --- Chart ---
  const allTides = tidesByDay
    .flatMap(day => day.data)
    .map(event => {
      const dateTime = new Date(event.DateTime);
      if (useUKPlusOne) dateTime.setHours(dateTime.getHours() + 1);
      return { ...event, dateTime };
    })
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

// --- Chart: include last tide yesterday, today, first tide tomorrow ---
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const lastYesterdayTide = allTides.filter(t => t.dateTime < today).pop();
const todaysTides = allTides.filter(t => t.dateTime >= today && t.dateTime < tomorrow);
const firstTomorrowTide = allTides.find(t => t.dateTime >= tomorrow);

const extendedTides = [
  ...(lastYesterdayTide ? [lastYesterdayTide] : []),
  ...todaysTides,
  ...(firstTomorrowTide ? [firstTomorrowTide] : []),
];

const chartDataPoints = extendedTides.map(t => ({
  time: t.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  height: t.Height,
}));

const chartLabels = chartDataPoints.map(p => p.time);
const chartValues = chartDataPoints.map(p => p.height);

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

      {chartDataPoints.length > 0 ? (
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
        <Text>No tide data available</Text>
      )}

      {/* Date Picker */}
      
      <SectionList
        sections={tidesByDay}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.dateHeader}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const dateTime = new Date(item.DateTime);
          if (useUKPlusOne) dateTime.setHours(dateTime.getHours() + 1);
          return (
            <Text style={styles.item}>
              {item.EventType === "HighWater" ? "High Tide" : "Low Tide"} at{" "}
              {dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} –{" "}
              {item.Height.toFixed(2)}m
            </Text>
          );
        }}
      />
    </SafeAreaView>
  );
}

const groupTidesByDay = (events: TidalEvent[]): TidesByDay[] => {
  const grouped: Record<string, TidalEvent[]> = {};
  events.forEach(event => {
    const date = new Date(event.DateTime).toLocaleDateString("en-GB", { timeZone: "Europe/London" });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(event);
  });
  return Object.entries(grouped).map(([dateStr, events]) => ({ title: dateStr, data: events }));
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f8ff" },
  stationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  stationName: { fontSize: 24, fontWeight: "bold" },
  star: { fontSize: 28, color: "#888" },
  starActive: { color: "#FFD700" },
  dateHeader: { fontSize: 20, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  item: { fontSize: 16, marginBottom: 5 },
});
