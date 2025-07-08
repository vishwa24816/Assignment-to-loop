import { configureStore } from '@reduxjs/toolkit';
import rawDataReducer from './rawDataSlice';
import filtersReducer from './filtersSlice'; // Import the new reducer

export const store = configureStore({
  reducer: {
    rawData: rawDataReducer,
    activeFilters: filtersReducer, // Add the filters reducer
    // other reducers will go here
  },
  // Middleware can be added here if needed
  // devTools: process.env.NODE_ENV !== 'production', // Enabled by default
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: Define a typed useSelector hook for convenience
// import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
// export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
