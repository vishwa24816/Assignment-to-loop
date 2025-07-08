// Represents a single row in the dataset
// Keys are column headers (strings), values can be strings or numbers
export interface DataRow {
  [key: string]: string | number;
}

// Represents the entire dataset
export type DataSet = DataRow[];

// Represents the structure of parsed CSV data from Papaparse
export interface ParsedCsvData {
  data: DataSet;
  errors: any[]; // Papaparse error objects
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields?: string[]; // Column headers
  };
}
