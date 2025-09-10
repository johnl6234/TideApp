
export type Station = {
  StationId: string;
  Name: string;
  Latitude: number;
  Longitude: number;
};

export type TidalEvent = {
  EventType: "HighWater" | "LowWater";
  DateTime: string;
  Height: number;
};

export type TidesByDay = {
  title: string;
  data: TidalEvent[];
};

export type TideCardData = {
  date: string; // string in "DD/MM/YYYY" format
  events: TidalEvent[];
};

export interface StationFeature {
  geometry: { coordinates: [number, number] }; // [lon, lat]
  properties: { Id: string; Name: string; Country?: string };
  type: string;
}