import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { AppDispatch, RootState } from './store';
import { loadDataStart, loadDataSuccess, loadDataFailure, clearData as clearRawDataAction } from './store/rawDataSlice';
import { parseCsvFromUrl } from './services/csvParser';
import DataTableWrapper from './components/DataTable/DataTableWrapper';
import FiltersContainer from './components/Filters/FiltersContainer';
import { pruneFilters, clearAllFilters as clearAllFiltersAction } from './store/filtersSlice';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Import ErrorBoundary

// Define available datasets
const DATASETS = {
  small: { name: 'Small Dataset (Modulo)', path: '/data/dataset_small.csv' },
  large: { name: 'Large Dataset (Modulo)', path: '/data/dataset_large.csv' },
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, columnNames } = useSelector((state: RootState) => state.rawData);
  const [currentDatasetPath, setCurrentDatasetPath] = useState<string>(DATASETS.small.path);

  useEffect(() => {
    const fetchData = async (filePath: string) => {
      dispatch(clearRawDataAction());
      dispatch(clearAllFiltersAction());
      dispatch(loadDataStart());
      try {
        const { data: parsedData, columnNames: parsedColumnNames } = await parseCsvFromUrl(filePath);
        if (parsedColumnNames && parsedColumnNames.length > 0) {
          dispatch(loadDataSuccess({ data: parsedData, columnNames: parsedColumnNames }));
          dispatch(pruneFilters({ validColumnNames: parsedColumnNames }));
        } else {
          console.warn(`Parsed data or column names are empty from ${filePath}. Using as empty.`);
          dispatch(loadDataSuccess({ data: [], columnNames: [] }));
          dispatch(pruneFilters({ validColumnNames: [] }));
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        // Check if error is due to placeholder file (e.g. 404 or parsing HTML error page)
        if (filePath.includes('dataset_large.csv') && (errorMessage.includes('404') || errorMessage.toLowerCase().includes('unexpected token') || errorMessage.includes('Error fetching'))) {
            console.warn(`Failed to load ${filePath}. This is expected if the actual large dataset is not provided. Displaying empty state.`);
            dispatch(loadDataSuccess({ data: [], columnNames: [] })); // Show empty state instead of error for missing large dataset
            dispatch(pruneFilters({ validColumnNames: [] }));
        } else {
            dispatch(loadDataFailure(errorMessage));
        }
      }
    };

    fetchData(currentDatasetPath);
  }, [dispatch, currentDatasetPath]);

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDatasetPath(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Intelligence Dashboard</h1>
        <div className="dataset-selector">
          <label htmlFor="dataset-select">Select Dataset: </label>
          <select id="dataset-select" value={currentDatasetPath} onChange={handleDatasetChange}>
            {Object.entries(DATASETS).map(([key, { name, path }]) => (
              <option key={key} value={path}>{name}</option>
            ))}
          </select>
        </div>
      </header>
      <main className="App-main-content">
        <ErrorBoundary fallbackMessage="Filters encountered an error.">
          {!loading && !error && columnNames.length > 0 && <FiltersContainer />}
        </ErrorBoundary>

        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: 'red' }}>Error loading data: {error}</p>}

        {!loading && !error && (
          <ErrorBoundary fallbackMessage="Data table encountered an error.">
            <DataTableWrapper />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

export default App;
