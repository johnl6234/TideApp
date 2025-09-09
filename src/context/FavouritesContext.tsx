import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavouritesContextType {
  favourites: string[];
  toggleFavourite: (stationId: string) => void;
}

export const FavouritesContext = createContext<FavouritesContextType>({
  favourites: [],
  toggleFavourite: () => {},
});

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const stored = await AsyncStorage.getItem("favourites");
        if (stored) setFavourites(JSON.parse(stored));
      } catch (err) {
        console.error("Error loading favourites:", err);
      }
    };
    loadFavourites();
  }, []);

  const toggleFavourite = async (stationId: string) => {
    const newFavourites = favourites.includes(stationId)
      ? favourites.filter(id => id !== stationId)
      : [...favourites, stationId];
    setFavourites(newFavourites);
    await AsyncStorage.setItem("favourites", JSON.stringify(newFavourites));
  };

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};
