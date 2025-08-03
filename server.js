const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// --- Multer Setup for Image Uploads ---
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded
app.use(express.static('public'));


// --- Helper Functions ---
const readDb = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { news: [], events: [] };
    }
};

const writeDb = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};


// --- News API Endpoints ---
app.get('/api/news', async (req, res) => {
    const db = await readDb();
    const sortedNews = db.news.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedNews);
});

app.get('/api/news/:id', async (req, res) => {
    const db = await readDb();
    const newsItem = db.news.find(item => item.id === req.params.id);
    if (newsItem) res.json(newsItem);
    else res.status(404).json({ message: 'News item not found' });
});

app.post('/api/news', async (req, res) => {
    const { title, category, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }
    const db = await readDb();
    const newNews = {
        id: Date.now().toString(),
        title,
        category: category || '未分類',
        content,
        date: new Date().toISOString(),
    };
    db.news.push(newNews);
    await writeDb(db);
    res.status(201).json(newNews);
});

app.delete('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    const db = await readDb();
    const initialLength = db.news.length;
    db.news = db.news.filter(item => item.id !== id);
    if (db.news.length === initialLength) {
        return res.status(404).json({ message: 'News item not found.' });
    }
    await writeDb(db);
    res.status(200).json({ message: 'News item deleted successfully.' });
});


// --- Event API Endpoints ---
app.get('/api/events', async (req, res) => {
    const db = await readDb();
    res.json(db.events);
});

app.get('/api/events/:id', async (req, res) => {
    const db = await readDb();
    const eventItem = db.events.find(item => item.id === req.params.id);
    if (eventItem) res.json(eventItem);
    else res.status(404).json({ message: 'Event not found' });
});

app.post('/api/events', upload.single('image'), async (req, res) => {
    const { title, category, location, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
    }
    const db = await readDb();
    const newEvent = {
        id: Date.now().toString(),
        title,
        category: category || '未分類',
        location: location || '未定',
        description,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    db.events.push(newEvent);
    await writeDb(db);
    res.status(201).json(newEvent);
});

app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const db = await readDb();
    const eventToDelete = db.events.find(item => item.id === id);
    if (!eventToDelete) {
        return res.status(404).json({ message: 'Event not found.' });
    }

    // Delete image file if it exists
    if (eventToDelete.imageUrl) {
        try {
            await fs.unlink(path.join(__dirname, 'public', eventToDelete.imageUrl));
        } catch (err) {
            console.error("Failed to delete image file:", err);
        }
    }

    db.events = db.events.filter(item => item.id !== id);
    await writeDb(db);
    res.status(200).json({ message: 'Event deleted successfully.' });
});


// --- Admin Page ---
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel is available at http://localhost:${PORT}/admin`);
});