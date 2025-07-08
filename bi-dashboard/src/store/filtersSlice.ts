import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Represents the type for selected filter values for a single column
export type FilterValues = string[] | number[]; // Assuming values are string or number

// Represents the state of active filters: a map from column name to its selected values
export interface ActiveFiltersState {
  [columnName: string]: FilterValues;
}

const initialState: ActiveFiltersState = {};

const filtersSlice = createSlice({
  name: 'activeFilters',
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<{ columnName: string; values: FilterValues }>
    ) => {
      const { columnName, values } = action.payload;
      if (values.length > 0) {
        state[columnName] = values;
      } else {
        // If values array is empty, effectively clear the filter for that column
        delete state[columnName];
      }
    },
    clearFilter: (state, action: PayloadAction<{ columnName: string }>) => {
      delete state[action.payload.columnName];
    },
    clearAllFilters: () => {
      return initialState; // Reset to initial empty object
    },
    // This action might be needed if column names change (e.g. new dataset loaded)
    // to remove filters for columns that no longer exist.
    pruneFilters: (state, action: PayloadAction<{ validColumnNames: string[] }>) => {
      const { validColumnNames } = action.payload;
      const currentFilteredColumns = Object.keys(state);
      currentFilteredColumns.forEach(columnName => {
        if (!validColumnNames.includes(columnName)) {
          delete state[columnName];
        }
      });
    }
  },
});

export const {
  setFilter,
  clearFilter,
  clearAllFilters,
  pruneFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
