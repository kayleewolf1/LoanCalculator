class FicoLtvService {
    constructor() {
        this.localData = null;
    }

    async loadLocalData() {
        try {
            const response = await fetch('./ficoltv.csv');
            if (!response.ok) throw new Error('Failed to fetch the FICO/LTV CSV file');

            const csvContent = await response.text();
            const rows = csvContent.trim().split('\n');
            const headers = rows.shift().split(',').map(header => header.trim().replace(/["]/g, ''));

            this.localData = rows.map(row => {
                const values = row.split(',').map(value => 
                    value.trim()
                         .replace(/["]/g, '')
                         .replace(/\\r/g, '')
                         .replace(/\r/g, '')
                );
                
                return headers.reduce((obj, header, index) => {
                    if (header === 'LTV' || header === 'FICO') {
                        obj[header] = parseInt(values[index], 10);
                    } else if (header === 'LLPA') {
                        obj[header] = parseFloat(values[index]);
                    } else {
                        obj[header] = values[index];
                    }
                    return obj;
                }, {});
            });

            console.log('FICO/LTV data loaded successfully');
        } catch (error) {
            console.error('Error loading FICO/LTV data:', error);
        }

        
    }

    logData() {
        if (!this.localData) {
            console.log('No data loaded');
            return;
        }

        console.log('FICO/LTV Data:');
        console.log('------------------');
        this.localData.forEach((row, index) => {
            console.log(`Row ${index + 1}:`);
            console.log(`  FICO: ${row.FICO}`);
            console.log(`  LTV: ${row.LTV}`);
            console.log(`  LLPA: ${row.LLPA}`);
            console.log('------------------');
        });
        console.log(`Total Rows: ${this.localData.length}`);
    }

    getLLPA(fico, ltv) {
        if (!this.localData) {
            console.error('Data not loaded yet');
            return null;
        }

        // Handle FICO scores below 639
        let adjustedFico = fico;
        if (adjustedFico < 639) {
            adjustedFico = 639;
        }

        // Get sorted unique FICO and LTV values
        const ficoScores = [...new Set(this.localData.map(row => row.FICO))].sort((a, b) => a - b);
        const ltvValues = [...new Set(this.localData.map(row => row.LTV))].sort((a, b) => a - b);

        // Find closest smaller or equal FICO score
        let closestFico = ficoScores[0]; // Default to lowest FICO
        for (let i = ficoScores.length - 1; i >= 0; i--) {
            if (ficoScores[i] <= adjustedFico) {
                closestFico = ficoScores[i];
                break;
            }
        }

        // Find closest smaller or equal LTV
        let closestLtv = ltvValues[0]; // Default to lowest LTV
        for (let i = ltvValues.length - 1; i >= 0; i--) {
            if (ltvValues[i] <= ltv) {
                closestLtv = ltvValues[i];
                break;
            }
        }

        // Find matching row with adjusted values
        const matchingRow = this.localData.find(row => 
            row.FICO === closestFico && row.LTV === closestLtv
        );

        if (matchingRow) {
            console.log(`Using FICO: ${closestFico}, LTV: ${closestLtv}`);
            return matchingRow.LLPA;
        }

        return null;
    }

    getAvailableFICOScores() {
        if (!this.localData) return [];
        return [...new Set(this.localData.map(row => row.FICO))].sort((a, b) => a - b);
    }

    getAvailableLTVs() {
        if (!this.localData) return [];
        return [...new Set(this.localData.map(row => row.LTV))].sort((a, b) => a - b);
    }
}

const ficoLtvService = new FicoLtvService();
export default ficoLtvService;