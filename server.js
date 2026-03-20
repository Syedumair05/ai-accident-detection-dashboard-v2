
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const LOCK_FILE = path.join(__dirname, 'logins.xlsx.lock');
const LOG_FILE = path.join(__dirname, 'logins.xlsx');

// Helper to check if file is locked
const isLocked = () => fs.existsSync(LOCK_FILE);

// Helper to lock file
const lockFile = () => fs.writeFileSync(LOCK_FILE, 'LOCKED');

// Helper to unlock file
const unlockFile = () => {
    if (fs.existsSync(LOCK_FILE)) {
        fs.unlinkSync(LOCK_FILE);
    }
};

app.post('/api/log-login', (req, res) => {
    const { name, email, googleId, picture } = req.body;
    const timestamp = new Date().toISOString();

    if (isLocked()) {
        return res.status(503).json({ error: 'File is currently in use, please try again later' });
    }

    try {
        lockFile();

        let workbook;
        if (fs.existsSync(LOG_FILE)) {
            workbook = xlsx.readFile(LOG_FILE);
        } else {
            workbook = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet([]);
            xlsx.utils.book_append_sheet(workbook, ws, 'Logins');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = xlsx.utils.sheet_to_json(worksheet);
        data.push({
            Timestamp: timestamp,
            Name: name,
            Email: email,
            GoogleID: googleId,
            Picture: picture
        });

        const newWorksheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName] = newWorksheet;

        xlsx.writeFile(workbook, LOG_FILE);

        res.json({ success: true, message: 'Login logged successfully' });
    } catch (error) {
        console.error('Error writing to Excel file:', error);
        res.status(500).json({ error: 'Failed to log login' });
    } finally {
        unlockFile();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
