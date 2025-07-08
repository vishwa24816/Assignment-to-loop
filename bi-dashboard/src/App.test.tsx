import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit'; // To create a mock store
import App from './App';
import rawDataReducer from './store/rawDataSlice';
import filtersReducer from './store/filtersSlice';

// Minimal mock store setup for rendering App component
const createMockStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      rawData: rawDataReducer,
      activeFilters: filtersReducer,
    },
    preloadedState,
  });
};

// Define RootState type if not already exported from store/index.ts for test usage
// For simplicity, I'll assume a basic structure for PreloadedState if RootState is complex to import/mock fully.
interface RootState {
  rawData: ReturnType<typeof rawDataReducer>;
  activeFilters: ReturnType<typeof filtersReducer>;
}


test('renders dashboard title', () => {
  const store = createMockStore();
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  // Check for the main title of the dashboard
  const titleElement = screen.getByText(/Business Intelligence Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});

test('shows loading message initially', () => {
  // Mock a state where rawData is loading
  const store = createMockStore({
    rawData: { data: [], columnNames: [], loading: true, error: null }
  });
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();
});

// Add more tests for App component as needed, e.g., error state, dataset switching.
// For now, ensuring it renders without crashing with Redux is the main goal.
