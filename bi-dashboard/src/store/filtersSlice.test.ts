import filtersReducer, {
  setFilter,
  clearFilter,
  clearAllFilters,
  pruneFilters,
  ActiveFiltersState,
} from './filtersSlice';

describe('filtersSlice reducer', () => {
  const initialState: ActiveFiltersState = {};

  it('should handle initial state', () => {
    expect(filtersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setFilter to add a new filter', () => {
    const actual = filtersReducer(initialState, setFilter({ columnName: 'mod3', values: [1, 2] }));
    expect(actual['mod3']).toEqual([1, 2]);
  });

  it('should handle setFilter to update an existing filter', () => {
    const stateWithFilter: ActiveFiltersState = { mod3: [1] };
    const actual = filtersReducer(stateWithFilter, setFilter({ columnName: 'mod3', values: [0] }));
    expect(actual['mod3']).toEqual([0]);
  });

  it('should handle setFilter to remove a filter if values are empty', () => {
    const stateWithFilter: ActiveFiltersState = { mod3: [1] };
    const actual = filtersReducer(stateWithFilter, setFilter({ columnName: 'mod3', values: [] }));
    expect(actual['mod3']).toBeUndefined();
    expect(Object.keys(actual).length).toEqual(0);
  });

  it('should handle clearFilter', () => {
    const stateWithFilters: ActiveFiltersState = { mod3: [1], mod4: [0] };
    const actual = filtersReducer(stateWithFilters, clearFilter({ columnName: 'mod3' }));
    expect(actual['mod3']).toBeUndefined();
    expect(actual['mod4']).toEqual([0]);
  });

  it('should handle clearAllFilters', () => {
    const stateWithFilters: ActiveFiltersState = { mod3: [1], mod4: [0] };
    const actual = filtersReducer(stateWithFilters, clearAllFilters());
    expect(actual).toEqual(initialState);
  });

  it('should handle pruneFilters to remove filters for non-existent columns', () => {
    const stateWithFilters: ActiveFiltersState = {
      mod3: [1],
      mod4: [0],
      toBeRemoved: [100],
    };
    const validColumnNames = ['mod3', 'mod4'];
    const actual = filtersReducer(stateWithFilters, pruneFilters({ validColumnNames }));
    expect(actual['mod3']).toEqual([1]);
    expect(actual['mod4']).toEqual([0]);
    expect(actual['toBeRemoved']).toBeUndefined();
    expect(Object.keys(actual).length).toEqual(2);
  });

  it('should handle pruneFilters with no filters to remove', () => {
    const stateWithFilters: ActiveFiltersState = { mod3: [1], mod4: [0] };
    const validColumnNames = ['mod3', 'mod4', 'mod5'];
    const actual = filtersReducer(stateWithFilters, pruneFilters({ validColumnNames }));
    expect(actual).toEqual(stateWithFilters);
   });

   it('should handle pruneFilters when all current filters are valid', () => {
    const stateWithFilters: ActiveFiltersState = { mod3: [1], mod4: [0] };
    const validColumnNames = ['mod3', 'mod4'];
    const actual = filtersReducer(stateWithFilters, pruneFilters({ validColumnNames }));
    expect(actual).toEqual(stateWithFilters);
   });
});
