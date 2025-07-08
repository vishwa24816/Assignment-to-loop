import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DataRow } from '../../types/data';
import { selectFilteredData, selectColumnNames } from '../../store/selectors'; // Import selectors
import styled from 'styled-components';

const TableWrapper = styled.div`
  // Styles for the table wrapper can go here if needed
  // e.g., setting a max-width or margin.
  // The react-data-table-component has its own internal scrolling and structure.
`;

const NoDataMessage = styled.p`
  padding: 20px;
  text-align: center;
  color: #777;
`;

const DataTableWrapper: React.FC = () => {
  // Use the new selector for filtered data
  const filteredData = useSelector(selectFilteredData);
  // Still need columnNames from rawData state or a selector
  const columnNames = useSelector(selectColumnNames);
  // Loading and error states are still relevant from rawData slice for initial load
  const { loading: initialDataLoading, error: initialDataError } = useSelector((state: RootState) => state.rawData);

  if (initialDataLoading) {
    return <p>Loading table data...</p>; // Or a spinner component
  }

  if (initialDataError) {
    // This error is for the initial data loading failure.
    return <NoDataMessage>Error displaying table: Data loading failed. ({initialDataError})</NoDataMessage>;
  }

  // After initial load, if columnNames are not available, something is wrong or data is truly empty (no headers)
  if (!columnNames || columnNames.length === 0) {
    return <NoDataMessage>No columns defined. Cannot display table.</NoDataMessage>;
  }

  // Dynamically create columns for react-data-table-component
  // This should only be done once or when columnNames change, useMemo can be good here.
  const columns: TableColumn<DataRow>[] = React.useMemo(() =>
    columnNames.map(colName => ({
      name: colName.replace(/_/g, ' '), // Prettify column names
      selector: (row: DataRow) => row[colName] === null || row[colName] === undefined ? '' : String(row[colName]), // Handle null/undefined for display
      sortable: true,
      reorder: true,
      wrap: true, // Good for cells with long text
      // Example of conditional formatting or custom cell rendering:
      // cell: row => row[colName] > 100 ? <span style={{color: 'green'}}>{row[colName]}</span> : row[colName],
    })), [columnNames]);

  // If there are no rows after filtering, show a specific message
  if (filteredData.length === 0) {
    return (
      <TableWrapper>
        {/* Render the table header even if there's no data, so user knows what columns are available */}
        <DataTable
            columns={columns}
            data={[]}
            noHeader={false} // Ensure header is shown
            noTableHead={false} // Ensure table head is shown
            pagination
            paginationPerPage={100} // Or a smaller default like 10 when empty
            paginationRowsPerPageOptions={[10, 20, 50, 100, 200]}
            responsive
            striped
            highlightOnHover
            noDataComponent={<NoDataMessage>No data matches the current filters.</NoDataMessage>}
        />
      </TableWrapper>
    );
  }

  return (
    <TableWrapper>
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={100}
        paginationRowsPerPageOptions={[10, 20, 50, 100, 200]}
        responsive
        striped
        highlightOnHover
        persistTableHead
        // fixedHeader
        // fixedHeaderScrollHeight="calc(100vh - 300px)" // Example for fixed header scroll
        dense // Makes rows more compact
      />
    </TableWrapper>
  );
};

export default DataTableWrapper;
