class PricingService {
    constructor() {
      this.localData = null;
    }
  
    async loadLocalData() {
      try {
        const filePath = new URL('fixedRates.csv', window.location.href).pathname;
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to fetch the CSV file');
  
        const csvContent = await response.text();
        const rows = csvContent.trim().split('\n');
        const headers = rows.shift().split(',').map(header => header.trim().replace(/["]/g, ''));
  
        this.localData = rows.map(row => {
          // Split the row and clean each value
          const values = row.split(',').map(value => 
            value.trim()
                 .replace(/["]/g, '')  // Remove quotes
                 .replace(/\\r/g, '')  // Remove \r
                 .replace(/\r/g, '')   // Remove actual carriage returns
          );
          
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
  
        console.log('Pricing data loaded successfully:', this.localData);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      }
    }
}
  
export default new PricingService();