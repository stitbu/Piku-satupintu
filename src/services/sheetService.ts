
import { Student, Transaction } from '../types/schema';
import { StorageService } from './storageService';

// Mock delay to simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SheetService = {
    
    /**
     * Syncs a new student record to the "Master Data" Google Sheet.
     */
    syncStudentToSheet: async (studentData: Partial<Student>): Promise<{ success: boolean; rowId?: number }> => {
        console.log("☁️ [SheetService] Syncing Student to Master Sheet...", studentData.full_name);
        
        await delay(1500); // Simulate network request

        // In a real app, this would be a fetch() call to a Google Apps Script Web App URL
        // const response = await fetch('https://script.google.com/...', { method: 'POST', body: JSON.stringify(studentData) });
        
        const isSuccess = Math.random() > 0.1; // 90% success rate simulation

        if (isSuccess) {
            console.log("✅ [SheetService] Student Synced Successfully.");
            StorageService.logActivity('Data Sync', `Synced student ${studentData.full_name} to Master Sheet`);
            return { success: true, rowId: Math.floor(Math.random() * 1000) };
        } else {
            console.error("❌ [SheetService] Sync Failed (Network Error). Data queued locally.");
            StorageService.logActivity('Data Sync Error', `Failed to sync ${studentData.full_name}`);
            return { success: false };
        }
    },

    /**
     * Syncs a financial transaction to the "Finance Report" Google Sheet.
     */
    syncTransactionToSheet: async (trxData: Transaction): Promise<{ success: boolean }> => {
        console.log(`☁️ [SheetService] Syncing Transaction [${trxData.id}] to Finance Sheet...`);
        console.log(`Payload: ${trxData.type} - Rp ${trxData.amount} (${trxData.category})`);

        await delay(1200);

        console.log("✅ [SheetService] Transaction Recorded in Cloud.");
        StorageService.logActivity('Finance Sync', `Recorded ${trxData.type} Rp ${trxData.amount}`);
        return { success: true };
    },

    /**
     * Batch sync for offline recovery
     */
    syncBatch: async (items: any[]): Promise<number> => {
        console.log(`☁️ [SheetService] Batch syncing ${items.length} items...`);
        await delay(3000);
        StorageService.logActivity('Batch Sync', `Recovered ${items.length} items to cloud`);
        return items.length;
    }
};
