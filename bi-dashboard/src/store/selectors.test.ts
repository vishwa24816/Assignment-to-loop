import {
  selectFilteredData,
  makeSelectAvailableOptionsForColumn,
  selectAllUniqueOptionsByColumn,
  selectColumnNames,
} from './selectors';
import { RootState } from './index';
import { DataRow, DataSet } from '../types/data';
import { ActiveFiltersState } from './filtersSlice';

// Helper to create a mock RootState
const createMockState = (
  rawData: DataSet,
  columnNames: string[],
  activeFilters: ActiveFiltersState = {}
): RootState => ({
  rawData: {
    data: rawData,
    columnNames: columnNames,
    loading: false,
    error: null,
  },
  activeFilters: activeFilters,
  // Add other slices if they become relevant to selectors under test
});

describe('Redux Selectors', () => {
  // Sample data similar to dataset_small.csv structure
  const sampleRawData: DataSet = [
    { id: 1, value: 10, mod3: 1, mod4: 2, mod5: 0 },
    { id: 2, value: 11, mod3: 2, mod4: 3, mod5: 1 },
    { id: 3, value: 12, mod3: 0, mod4: 0, mod5: 2 },
    { id: 4, value: 13, mod3: 1, mod4: 1, mod5: 3 },
    { id: 5, value: 14, mod3: 2, mod4: 2, mod5: 4 },
    { id: 6, value: 15, mod3: 0, mod4: 3, mod5: 0 },
  ];
  const sampleColumnNames = ['id', 'value', 'mod3', 'mod4', 'mod5'];

  describe('selectColumnNames', () => {
    it('should return the column names from rawData state', () => {
      const mockState = createMockState(sampleRawData, sampleColumnNames);
      expect(selectColumnNames(mockState)).toEqual(sampleColumnNames);
    });
  });

  describe('selectFilteredData', () => {
    it('should return all data when no filters are active', () => {
      const mockState = createMockState(sampleRawData, sampleColumnNames);
      expect(selectFilteredData(mockState)).toEqual(sampleRawData);
    });

    it('should filter data based on a single active filter', () => {
      const filters: ActiveFiltersState = { mod3: [0] }; // Select rows where mod3 is 0
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      const expectedData = [
        { id: 3, value: 12, mod3: 0, mod4: 0, mod5: 2 },
        { id: 6, value: 15, mod3: 0, mod4: 3, mod5: 0 },
      ];
      expect(selectFilteredData(mockState)).toEqual(expectedData);
    });

    it('should filter data based on multiple active filters (AND logic)', () => {
      const filters: ActiveFiltersState = { mod3: [1], mod4: [2] }; // mod3 is 1 AND mod4 is 2
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      const expectedData = [
        { id: 1, value: 10, mod3: 1, mod4: 2, mod5: 0 },
      ];
      expect(selectFilteredData(mockState)).toEqual(expectedData);
    });

    it('should return empty array if no data matches filters', () => {
      const filters: ActiveFiltersState = { mod3: [100] }; // No such mod3 value
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      expect(selectFilteredData(mockState)).toEqual([]);
    });

     it('should handle filters with multiple selected values (OR logic within a column)', () => {
      const filters: ActiveFiltersState = { mod5: [0, 1] }; // mod5 is 0 OR mod5 is 1
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      const expectedData = [
        { id: 1, value: 10, mod3: 1, mod4: 2, mod5: 0 },
        { id: 2, value: 11, mod3: 2, mod4: 3, mod5: 1 },
        { id: 6, value: 15, mod3: 0, mod4: 3, mod5: 0 },
      ];
      expect(selectFilteredData(mockState)).toEqual(expectedData);
    });
  });

  describe('makeSelectAvailableOptionsForColumn', () => {
    const selectAvailableMod3Options = makeSelectAvailableOptionsForColumn();
    const selectAvailableMod4Options = makeSelectAvailableOptionsForColumn();

    it('should return all unique options for a column when no other filters are active', () => {
      const mockState = createMockState(sampleRawData, sampleColumnNames);
      // For 'mod3', unique values are 0, 1, 2. Sorted: [0, 1, 2]
      expect(selectAvailableMod3Options(mockState, 'mod3')).toEqual([0, 1, 2]);
    });

    it('should return relevant options for a column when another filter is active', () => {
      // Filter by mod4 = 0. Rows matching: id 3 ({mod3: 0, mod4: 0})
      // So, for mod3, only 0 should be an available option.
      const filters: ActiveFiltersState = { mod4: [0] };
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      expect(selectAvailableMod3Options(mockState, 'mod3')).toEqual([0]);
    });

    it('should ignore the target column\'s own filter when calculating its options', () => {
      // Filter by mod3 = 1 AND mod4 = 2.
      // When calculating options for mod3, it should ignore mod3=[1] filter.
      // It should only consider mod4=[2].
      // Rows where mod4=2:
      //   { id: 1, value: 10, mod3: 1, mod4: 2, mod5: 0 }
      //   { id: 5, value: 14, mod3: 2, mod4: 2, mod5: 4 }
      // Unique mod3 values from these rows: [1, 2]. Sorted: [1, 2]
      const filters: ActiveFiltersState = { mod3: [1], mod4: [2] };
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      expect(selectAvailableMod3Options(mockState, 'mod3')).toEqual([1, 2]);
    });

    it('should return options for mod4 based on mod3 filter', () => {
      // Filter by mod3 = 0. Rows matching:
      //   { id: 3, value: 12, mod3: 0, mod4: 0, mod5: 2 }
      //   { id: 6, value: 15, mod3: 0, mod4: 3, mod5: 0 }
      // Unique mod4 values from these: [0, 3]. Sorted: [0, 3]
      const filters: ActiveFiltersState = { mod3: [0] };
      const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
      expect(selectAvailableMod4Options(mockState, 'mod4')).toEqual([0, 3]);
    });

    it('should return empty array if no data matches other filters', () => {
        const filters: ActiveFiltersState = { mod5: [100] }; // No such mod5 value
        const mockState = createMockState(sampleRawData, sampleColumnNames, filters);
        // No rows match mod5=[100], so mod3 options should be empty
        expect(selectAvailableMod3Options(mockState, 'mod3')).toEqual([]);
    });
  });

  describe('selectAllUniqueOptionsByColumn', () => {
    it('should return a map of all unique options for each column from rawData', () => {
      const mockState = createMockState(sampleRawData, sampleColumnNames);
      const expectedOptionsMap = {
        id: [1, 2, 3, 4, 5, 6],
        value: [10, 11, 12, 13, 14, 15],
        mod3: [0, 1, 2],
        mod4: [0, 1, 2, 3],
        mod5: [0, 1, 2, 3, 4],
      };
      const result = selectAllUniqueOptionsByColumn(mockState);
      // Check keys and values separately due to potential sorting differences if not careful
      expect(Object.keys(result)).toEqual(Object.keys(expectedOptionsMap));
      Object.keys(expectedOptionsMap).forEach(key => {
        expect(result[key]).toEqual(expectedOptionsMap[key as keyof typeof expectedOptionsMap]);
      });
    });

    it('should return empty map if rawData is empty', () => {
        const mockState = createMockState([], sampleColumnNames);
        expect(selectAllUniqueOptionsByColumn(mockState)).toEqual({});
    });

    it('should return empty map if columnNames is empty', () => {
        const mockState = createMockState(sampleRawData, []);
        expect(selectAllUniqueOptionsByColumn(mockState)).toEqual({});
    });
  });
});
