import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import FilterDropdownWrapper from './FilterDropdownWrapper';
import { FilterValues, clearAllFilters } from '../../store/filtersSlice';
import { makeSelectAvailableOptionsForColumn, selectColumnNames } from '../../store/selectors';
import styled from 'styled-components';

const Container = styled.div`
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
  margin-bottom: 20px;
  max-height: 80vh; // Example: make filter container scrollable if too long
  overflow-y: auto;
`;

const Header = styled.h2`
  margin-top: 0;
  font-size: 1.2em;
`;

const ClearButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 10px;
  display: block; // Ensure it takes its own line if needed

  &:hover {
    background-color: #c82333;
  }
`;

// This is a sub-component to properly use the factory selector `makeSelectAvailableOptionsForColumn`
// Each instance of DynamicFilterDropdown will have its own memoized selector instance.
const DynamicFilterDropdown: React.FC<{ columnName: string }> = ({ columnName }) => {
  // Create a memoized selector instance for this specific column
  // The selector will recompute only if the relevant parts of the state for THIS column change.
  const selectAvailableOptions = useMemo(makeSelectAvailableOptionsForColumn, []);

  // Use this specific selector instance to get options for the current column
  const availableOptions = useSelector((state: RootState) => selectAvailableOptions(state, columnName));
  const currentSelected = useSelector((state: RootState) => state.activeFilters[columnName] || []);

  // Do not render filter for 'id' column (case-insensitive) or if no options are available after filtering
  // (though makeSelectAvailableOptionsForColumn should always return at least the selected items if they exist)
  if (columnName.toLowerCase() === 'id') {
    return null;
  }

  // If there are no available options and nothing is selected for this filter,
  // it might be better not to render it, or show a disabled state.
  // For now, let's render it if there are options, or if something is selected (to allow deselection).
  if (availableOptions.length === 0 && currentSelected.length === 0) {
      // This scenario means this column has no values that match the *other* active filters.
      // Depending on UX desired, could hide, disable, or show "No available options".
      // For now, let's hide it to keep the UI cleaner.
      return null;
  }

  return (
    <FilterDropdownWrapper
      columnName={columnName}
      options={availableOptions} // These are now dynamically calculated
      currentSelectedValues={currentSelected}
    />
  );
};


const FiltersContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const columnNames = useSelector(selectColumnNames); // Get all original column names
  const activeFilters = useSelector((state: RootState) => state.activeFilters); // For the "Clear All" button

  if (!columnNames || columnNames.length === 0) {
    return <Container><p>Loading filter definitions or no columns available.</p></Container>;
  }

  const handleClearAllFilters = () => {
    dispatch(clearAllFilters());
  };

  return (
    <Container>
      <Header>Filters</Header>
      {columnNames.map(columnName => (
        // Each DynamicFilterDropdown manages its own options fetching via its own selector instance
        <DynamicFilterDropdown key={columnName} columnName={columnName} />
      ))}
      {Object.keys(activeFilters).length > 0 && (
        <ClearButton onClick={handleClearAllFilters}>Clear All Filters</ClearButton>
      )}
    </Container>
  );
};

export default FiltersContainer;
