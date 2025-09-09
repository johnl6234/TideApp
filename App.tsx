import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { FavouritesProvider } from "./src/context/FavouritesContext";

import TideDetailsScreen from "./src/screens/TideDetailsScreen";
import LocationScreen from "./src/screens/LocationScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const LocationsStack = createNativeStackNavigator();

function MapScreen() {
  return (
    <View style={styles.screen}>
      <Text>Map</Text>
    </View>
  );
}

function LocationsStackScreen() {
  return (
    <LocationsStack.Navigator>
      <LocationsStack.Screen
        name="LocationsMain"
        component={LocationScreen}
        options={{ headerShown: false }}
      />
      <LocationsStack.Screen
        name="TideDetails"
        component={TideDetailsScreen}
        options={{ title: "Tide Details" }}
      />
    </LocationsStack.Navigator>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text>Settings</Text>
    </View>
  );
}

// Stack Navigator for Home tab
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TideDetails"
        component={TideDetailsScreen}
        options={{ title: "Tide Details" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <FavouritesProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = "home";
              if (route.name === "Home") iconName = "home";
              else if (route.name === "Map") iconName = "map";
              else if (route.name === "Locations") iconName = "location";
              else if (route.name === "Settings") iconName = "settings";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Locations" component={LocationsStackScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </FavouritesProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", alignItems: "center" },
});
