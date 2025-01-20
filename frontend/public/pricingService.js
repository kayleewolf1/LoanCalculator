class PricingService {
    constructor() {
      this.localData = null;
    }
  
    async loadLocalData() {
      try {
        // Construct the file path relative to the current directory
        const filePath = new URL('fixedRates.csv', window.location.href).pathname;
        // Fetch the CSV file from the server
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to fetch the CSV file');
  
        // Read the file content as text
        const csvContent = await response.text();
  
        // Split the CSV content into an array of rows
        const rows = csvContent.trim().split('\n');
  
        // Extract the header row
        const headers = rows.shift().split(',');
  
        // Parse the remaining rows into an array of objects
        const parsedData = rows.map(row => {
          const values = row.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
  
        // Store the parsed data in the localData property
        this.localData = parsedData;
  
        console.log('Pricing data loaded successfully:', this.localData);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      }
    }
  }
  
  export default new PricingService();