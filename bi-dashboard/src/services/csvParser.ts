import Papa from 'papaparse';
import { DataSet, ParsedCsvData, DataRow } from '../types/data';

/**
 * Fetches and parses a CSV file from a given URL.
 * @param fileUrl The URL of the CSV file.
 * @returns A promise that resolves with the parsed data (DataSet and columnNames) or rejects with an error.
 */
export const parseCsvFromUrl = async (
  fileUrl: string
): Promise<{ data: DataSet; columnNames: string[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(fileUrl, {
      download: true,
      header: true, // Assumes the first row is headers
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically converts numbers and booleans
      complete: (results: Papa.ParseResult<DataRow>) => {
        const { data, errors, meta } = results;

        if (errors.length > 0) {
          console.error('Errors parsing CSV:', errors);
          // Reject with the first error message, or a generic one
          reject(new Error(errors[0]?.message || 'An error occurred during CSV parsing.'));
          return;
        }

        if (!meta.fields) {
          reject(new Error('Could not determine column headers from CSV.'));
          return;
        }

        // Filter out any rows that might be completely null or undefined due to dynamicTyping issues or malformed CSV
        // Papaparse with header: true and dynamicTyping: true might return rows like {columnName: null} for empty parsed lines
        // or rows that are just null if something goes wrong.
        const cleanedData = data.filter(row => row && Object.values(row).some(val => val !== null && val !== undefined && val !== ""));


        resolve({ data: cleanedData as DataSet, columnNames: meta.fields });
      },
      error: (error: Error) => {
        console.error('Error fetching or parsing CSV:', error);
        reject(error);
      },
    });
  });
};
