import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataSet, DataRow } from '../types/data';

export interface RawDataState {
  data: DataSet;
  columnNames: string[];
  loading: boolean;
  error: string | null;
}

const initialState: RawDataState = {
  data: [],
  columnNames: [],
  loading: false,
  error: null,
};

const rawDataSlice = createSlice({
  name: 'rawData',
  initialState,
  reducers: {
    loadDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    loadDataSuccess(state, action: PayloadAction<{ data: DataSet; columnNames: string[] }>) {
      state.data = action.payload.data;
      state.columnNames = action.payload.columnNames;
      state.loading = false;
    },
    loadDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.data = [];
      state.columnNames = [];
    },
    // It might be useful to have a way to clear data if we switch datasets later
    clearData(state) {
      state.data = [];
      state.columnNames = [];
      state.loading = false;
      state.error = null;
    }
  },
});

export const {
  loadDataStart,
  loadDataSuccess,
  loadDataFailure,
  clearData,
} = rawDataSlice.actions;

export default rawDataSlice.reducer;
