import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { DataRow } from '../types/data';
import { ActiveFiltersState, FilterValues } from './filtersSlice';

// Selector for raw data itself
const selectRawData = (state: RootState) => state.rawData.data;

// Selector for active filters
const selectActiveFilters = (state: RootState) => state.activeFilters;

// Selector for column names from rawData slice (might be useful)
export const selectColumnNames = (state: RootState) => state.rawData.columnNames;


// Memoized selector for filtered data
export const selectFilteredData = createSelector(
  [selectRawData, selectActiveFilters],
  (rawData: DataRow[], activeFilters: ActiveFiltersState): DataRow[] => {
    if (Object.keys(activeFilters).length === 0) {
      // No filters active, return all raw data
      return rawData;
    }

    return rawData.filter(row => {
      // Check if the row matches all active filters
      // Every returns true if the callback returns true for every element
      return Object.entries(activeFilters).every(([columnName, filterValues]) => {
        const rowValue = row[columnName];

        // If filterValues is empty for some reason (should not happen with current setFilter logic)
        // or rowValue is null/undefined, it doesn't match unless filter explicitly includes null/undefined
        if (filterValues.length === 0) {
          return true; // Or false, depending on desired behavior for empty filter array
        }
        if (rowValue === null || rowValue === undefined) {
          return false; // Or handle based on whether filters can include null/undefined
        }

        // Ensure filterValues is an array (it should be based on FilterValues type)
        if (!Array.isArray(filterValues)) return true; // Should not happen

        return filterValues.includes(rowValue);
      });
    });
  }
);

// Selector to get unique available options for a SPECIFIC filter dropdown,
// considering OTHER active filters. This will be crucial for Filter-Filter interaction.
// For a given targetColumnName, it filters rawData by all *other* active filters,
// then finds unique values for targetColumnName from that intermediate set.
export const makeSelectAvailableOptionsForColumn = () => {
  return createSelector(
    [
      selectRawData,
      selectActiveFilters,
      (_state: RootState, targetColumnName: string) => targetColumnName,
    ],
    (
      rawData: DataRow[],
      activeFilters: ActiveFiltersState,
      targetColumnName: string
    ): FilterValues => {
      // Create a temporary set of filters, excluding the target column's own filter
      const otherFilters: ActiveFiltersState = {};
      for (const key in activeFilters) {
        if (key !== targetColumnName) {
          otherFilters[key] = activeFilters[key];
        }
      }

      let dataToScan = rawData;
      // If there are other filters to apply, filter the rawData first
      if (Object.keys(otherFilters).length > 0) {
        dataToScan = rawData.filter(row => {
          return Object.entries(otherFilters).every(([columnName, filterValues]) => {
            const rowValue = row[columnName];
            if (filterValues.length === 0) return true;
            if (rowValue === null || rowValue === undefined) return false;
            return filterValues.includes(rowValue);
          });
        });
      }

      // Now, get unique values for the targetColumnName from this (potentially pre-filtered) data
      const uniqueValues = new Set<string | number>();
      dataToScan.forEach(row => {
        const value = row[targetColumnName];
        if (value !== null && value !== undefined && value !== '') {
          uniqueValues.add(value);
        }
      });

      return Array.from(uniqueValues).sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
        return String(a).localeCompare(String(b));
      });
    }
  );
};


// Selector to get all unique options for each column from the original rawData.
// This is used for the initial population of filter dropdowns before any Filter-Filter interaction logic kicks in.
// FiltersContainer currently computes this with useMemo, this selector is an alternative.
export const selectAllUniqueOptionsByColumn = createSelector(
  [selectRawData, selectColumnNames],
  (rawData: DataRow[], columnNames: string[]): { [key: string]: FilterValues } => {
    const optionsMap: { [key: string]: FilterValues } = {};
    if (rawData.length > 0 && columnNames.length > 0) {
      columnNames.forEach(column => {
        const uniqueValues = new Set<string | number>();
        rawData.forEach((row: DataRow) => {
          const value = row[column];
          if (value !== null && value !== undefined && value !== '') {
            uniqueValues.add(value);
          }
        });
        optionsMap[column] = Array.from(uniqueValues).sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
          return String(a).localeCompare(String(b));
        });
      });
    }
    return optionsMap;
  }
);
