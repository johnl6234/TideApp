import {
  StyleSheet,
} from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#296facff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 , color: "white"},
  item: {
    padding: 15,
    backgroundColor: "#ffffffff",
    marginBottom: 8,
    borderRadius: 8,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  coords: { fontSize: 14, color: "gray" },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  stationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  stationName: { fontSize: 20, fontWeight: "bold", marginBottom: 10 , color: "white"},
  star: { fontSize: 28, color: "#888" },
  starActive: { color: "#FFD700" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  tideRow: { flexDirection: "row", justifyContent: "space-between" },
  tideColumn: { flex: 1, justifyContent: "space-between", padding: 5 },
  tideBox: { backgroundColor: "#f0f8ff", borderRadius: 8, padding: 8, marginBottom: 8, alignItems: "center" },
  tideType: { fontWeight: "bold" },
  tideHeight: { fontSize: 16, color: "#007bff" },
  tideTime: { fontSize: 18, color: "#555" },
});

