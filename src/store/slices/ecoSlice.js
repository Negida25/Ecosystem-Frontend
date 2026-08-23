import { createSlice } from "@reduxjs/toolkit";

const ecoSlice = createSlice({
  name: "eco",
  initialState: {
    species: [],
    airReadings: [],
    waterReadings: [],
    alerts: [],
    news: [],
    regions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSpecies: (state, action) => { state.species = action.payload; },
    setAirReadings: (state, action) => { state.airReadings = action.payload; },
    setWaterReadings: (state, action) => { state.waterReadings = action.payload; },
    setAlerts: (state, action) => { state.alerts = action.payload; },
    setNews: (state, action) => { state.news = action.payload; },
    setRegions: (state, action) => { state.regions = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const {
  setSpecies, setAirReadings, setWaterReadings,
  setAlerts, setNews, setRegions, setLoading, setError
} = ecoSlice.actions;
export default ecoSlice.reducer;