import React from 'react';
import { useDispatch } from 'react-redux';
import Multiselect from 'multiselect-react-dropdown';
import { AppDispatch } from '../../store';
import { setFilter, FilterValues } from '../../store/filtersSlice'; // Assuming FilterValues can be string[] | number[]
import styled from 'styled-components';

interface FilterDropdownWrapperProps {
  columnName: string;
  options: FilterValues; // Array of unique string or number values for the dropdown
  // selectedValues will be sourced from Redux store inside the component or passed down
  // For now, let's make it simple and rely on parent to pass current selection if needed,
  // or the component can fetch it. Let's try to make it self-contained for selection display.
  currentSelectedValues: FilterValues;
}

// Basic styling for the multiselect component container
const DropdownContainer = styled.div`
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 4px;

  .multiselect-container {
    font-size: 0.9rem;
  }
  .search-wrapper input {
    font-size: 0.9rem;
  }
  .optionListContainer {
    font-size: 0.9rem;
  }
`;

const FilterLabel = styled.p`
  margin-bottom: 5px;
  font-weight: bold;
  text-transform: capitalize;
`;

const FilterDropdownWrapper: React.FC<FilterDropdownWrapperProps> = ({
  columnName,
  options,
  currentSelectedValues,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSelect = (selectedList: FilterValues) => {
    // selectedList is an array of the selected items (strings or numbers)
    dispatch(setFilter({ columnName, values: selectedList }));
  };

  const handleRemove = (selectedList: FilterValues) => {
    // selectedList is the list of items remaining after removal
    dispatch(setFilter({ columnName, values: selectedList }));
  };

  // Convert options to the format multiselect-react-dropdown expects if they are primitive values.
  // If options are [{id:1, name:'Option1'}, ...], then displayValue="name" would be used.
  // For an array of strings/numbers like ['A', 'B', 'C'] or [1, 2, 3],
  // it can often work directly or by mapping them to { name: value } format.
  // Let's assume it works directly with primitives for now.
  // The `selectedValues` prop in Multiselect also expects the same type as options.

  // Ensure options are unique and sorted for better UX, parent should handle this.
  // For `multiselect-react-dropdown` with primitive options, `selectedValues` should be an array of those primitives.

  return (
    <DropdownContainer>
      <FilterLabel>{columnName.replace(/_/g, ' ')}</FilterLabel>
      <Multiselect
        options={options} // e.g., [1, 2, 3] or ['A', 'B', 'C']
        isObject={false} // Important: Set to false if options is an array of primitives
        selectedValues={currentSelectedValues} // e.g., [1] or ['A']
        onSelect={handleSelect}
        onRemove={handleRemove}
        placeholder={`Select ${columnName}...`}
        showCheckbox={true}
        hidePlaceholder={currentSelectedValues.length > 0}
        // closeOnSelect={false} // Keep dropdown open for multi-selection
        style={{
          // Minimal styling, can be expanded
          searchBox: {
            border: '1px solid #ccc',
            borderRadius: '4px',
            minHeight: '38px',
          },
          chips: {
            background: '#007bff',
            fontSize: '0.8rem',
          },
          optionContainer: {
            maxHeight: '200px', // Limit height of dropdown list
          }
        }}
      />
    </DropdownContainer>
  );
};

export default FilterDropdownWrapper;
