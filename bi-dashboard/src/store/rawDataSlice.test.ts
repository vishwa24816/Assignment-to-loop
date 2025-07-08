import rawDataReducer, {
  loadDataStart,
  loadDataSuccess,
  loadDataFailure,
  clearData,
  RawDataState,
} from './rawDataSlice';
import { DataSet } from '../types/data';

describe('rawDataSlice reducer', () => {
  const initialState: RawDataState = {
    data: [],
    columnNames: [],
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(rawDataReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle loadDataStart', () => {
    const actual = rawDataReducer(initialState, loadDataStart());
    expect(actual.loading).toEqual(true);
    expect(actual.error).toBeNull();
  });

  it('should handle loadDataSuccess', () => {
    const testData: DataSet = [{ id: 1, name: 'Test' }];
    const testColumns = ['id', 'name'];
    const actual = rawDataReducer(
      { ...initialState, loading: true },
      loadDataSuccess({ data: testData, columnNames: testColumns })
    );
    expect(actual.data).toEqual(testData);
    expect(actual.columnNames).toEqual(testColumns);
    expect(actual.loading).toEqual(false);
    expect(actual.error).toBeNull();
  });

  it('should handle loadDataFailure', () => {
    const actual = rawDataReducer(
      { ...initialState, loading: true },
      loadDataFailure('Test error')
    );
    expect(actual.loading).toEqual(false);
    expect(actual.error).toEqual('Test error');
    expect(actual.data).toEqual([]);
    expect(actual.columnNames).toEqual([]);
  });

  it('should handle clearData', () => {
    const populatedState: RawDataState = {
      data: [{ id: 1, name: 'Test' }],
      columnNames: ['id', 'name'],
      loading: false,
      error: null,
    };
    const actual = rawDataReducer(populatedState, clearData());
    expect(actual).toEqual(initialState);
  });
});
