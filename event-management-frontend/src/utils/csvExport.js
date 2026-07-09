/**
 * Clean client-side CSV spreadsheet exporter.
 * Formats table rows and triggers an immediate download.
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add column header names
  csvRows.push(
    headers
      .map(h => `"${h.replace(/([A-Z])/g, ' $1').toUpperCase().trim()}"`)
      .join(',')
  );
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape double quotes inside values
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = '\uFEFF' + csvRows.join('\n'); // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
