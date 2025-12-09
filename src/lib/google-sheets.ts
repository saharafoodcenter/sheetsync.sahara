import { google } from "googleapis";
import type { InventoryItem, BarcodeProduct } from "@/types";

const serviceAccountEmail = process.env.GCP_SA_EMAIL;
const serviceAccountPrivateKey = process.env.GCP_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
const sheetId = process.env.SHEET_ID;

const INVENTORY_SHEET_NAME = 'Inventory';
const BARCODES_SHEET_NAME = 'Barcodes';


const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: serviceAccountEmail,
        private_key: serviceAccountPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

function sheetRowToInventoryItem(row: any[]): InventoryItem | null {
    if (!row[0]) return null; // Skip empty rows
    return {
        id: row[0],
        name: row[1],
        expiryDate: new Date(row[2]),
        addedDate: new Date(row[3]),
        batch: row[4],
    };
}


export async function getInventoryFromSheet(): Promise<InventoryItem[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${INVENTORY_SHEET_NAME}!A2:E`,
        });

        const rows = response.data.values;
        if (rows) {
            return rows.map(sheetRowToInventoryItem).filter((item): item is InventoryItem => item !== null);
        }
        return [];
    } catch (error) {
        console.error('Error fetching inventory from Google Sheet:', error);
        throw new Error('Could not connect to the database sheet.');
    }
}

export async function getBarcodesFromSheet(): Promise<BarcodeProduct[]> {
     try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${BARCODES_SHEET_NAME}!A2:B`,
        });

        const rows = response.data.values;
        if (rows) {
            return rows.map(row => ({
                barcode: row[0],
                name: row[1],
            })).filter(p => p.barcode && p.name);
        }
        return [];
    } catch (error) {
        console.error('Error fetching barcodes from Google Sheet:', error);
        throw new Error('Could not connect to the database sheet.');
    }
}

export async function addInventoryItemToSheet(item: Omit<InventoryItem, 'id' | 'batch' | 'addedDate'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
        ...item,
        id: crypto.randomUUID(),
        batch: `B${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        addedDate: new Date(),
    };

    const newRow = [
        newItem.id,
        newItem.name,
        newItem.expiryDate.toISOString(),
        newItem.addedDate.toISOString(),
        newItem.batch,
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${INVENTORY_SHEET_NAME}!A:E`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newRow],
            },
        });
        return newItem;
    } catch (error) {
        console.error('Error adding item to Google Sheet:', error);
        throw new Error('Could not add item to the database sheet.');
    }
}

export async function deleteInventoryItemFromSheet(id: string): Promise<{ success: boolean; id: string; }> {
     try {
        // First, get all the data to find the row number
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${INVENTORY_SHEET_NAME}!A2:A`,
        });

        const rows = response.data.values;
        if (!rows) {
            throw new Error(`Item with id ${id} not found.`);
        }
        
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex === -1) {
            throw new Error(`Item with id ${id} not found.`);
        }

        const sheetResponse = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const sheetInfo = sheetResponse.data.sheets?.find(s => s.properties?.title === INVENTORY_SHEET_NAME);
        const sheetGid = sheetInfo?.properties?.sheetId;

        if (sheetGid === undefined) {
             throw new Error(`Could not find sheet with name ${INVENTORY_SHEET_NAME}`);
        }

        // The row index from the API is 0-based, and we started from A2, so we need to add 2 to get the actual sheet row number.
        const rowToDelete = rowIndex + 2;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetGid,
                            dimension: 'ROWS',
                            startIndex: rowToDelete - 1, // startIndex is 0-based
                            endIndex: rowToDelete,
                        }
                    }
                }]
            }
        });
        
        return { success: true, id };
    } catch (error) {
        console.error('Error deleting item from Google Sheet:', error);
        throw new Error('Could not delete item from the database sheet.');
    }
}
