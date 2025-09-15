
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

export type Region = {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
}

export type MoonDataType = {
  astronomicalDawn: string,
  astronomicalDusk: string,
  civilDawn: string,
  civilDusk: string,
  moonFraction: number,
  moonPhase: {
    closest: {
      text: string,
      time: string,
      value: number
    },
    current: {
      text: string,
      time: string,
      value: number
    }
  },
  moonrise: string,
  moonset: string,
  nauticalDawn: string,
  nauticalDusk: string,
  sunrise: string,
  sunset:string,
  time: string
}

export type WeatherDataType = {
  airTemperature: {
    dwd:number,
    ecmwf: number,
    "ecmwf:aifs": number,
    noaa: number,
    sg: number
  },
  currentSpeed: {
    ecmwf: number,
    metno: number,
    sg: number
  },
  gust: {
    dwd: number,
    ecmwf: number,
    noaa: number,
    sg: number
  },
  swellDirection: {
    dwd: number,
    metno: number,
    sg: number
  },
  swellHeight: {
    dwd: number,
    metno: number,
    sg: number
  },
  time:string,
  waveHeight: {
    dwd: number,
    ecmwf: number,
    metno:number,
    sg: number
  }
}