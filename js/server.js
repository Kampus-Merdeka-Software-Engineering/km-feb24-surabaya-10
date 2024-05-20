const express = require('express');
const fs = require('fs');
const path = require('path'); // Import modul path untuk bekerja dengan path file
const app = express();
const port = 1000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Definisikan endpoint untuk menyajikan data JSON
app.get('/data', (req, res) => {
    // Path file JSON yang benar sesuai dengan struktur proyek Anda
    const filePath = path.join(__dirname, '../assets/data/dwellings.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
