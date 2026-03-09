const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// --- Helper Database ---
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- Auth Middleware ---
const checkAuth = (req, res, next) => {
    if (req.cookies.auth === 'mkr_admin_token') {
        next();
    } else {
        res.redirect('/mkr-admin');
    }
};

// --- Frontend Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'home.html')));
app.get('/games', (req, res) => res.sendFile(path.join(__dirname, 'views', 'games.html')));
app.get('/how-to-buy', (req, res) => res.sendFile(path.join(__dirname, 'views', 'how-to-buy.html')));

// --- Admin Routes ---
app.get('/mkr-admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));
app.get('/mkr-admin/dashboard', checkAuth, (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === 'NgentotAnjingBangsad69') { // Ganti password di sini
        res.cookie('auth', 'mkr_admin_token', { httpOnly: true });
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Password salah' });
    }
});

// --- API Routes (Public Data) ---
app.get('/api/data', (req, res) => res.json(readDB()));

// --- API Routes (Admin Modify) ---
app.post('/api/games', checkAuth, (req, res) => {
    const db = readDB();
    const newGame = { id: Date.now(), ...req.body };
    db.games.push(newGame);
    writeDB(db);
    res.json({ success: true });
});

// Implementasi delete game
app.delete('/api/games/:id', checkAuth, (req, res) => {
    const db = readDB();
    db.games = db.games.filter(g => g.id !== parseInt(req.params.id));
    writeDB(db);
    res.json({ success: true });
});

// --- API Routes (Admin Modify) ---

// (Kode POST dan DELETE yang sudah ada sebelumnya biarkan saja)

// Implementasi Edit Game
app.put('/api/games/:id', checkAuth, (req, res) => {
    const db = readDB();
    const gameId = parseInt(req.params.id);
    const gameIndex = db.games.findIndex(g => g.id === gameId);
    
    if (gameIndex !== -1) {
        // Gabungkan data lama dengan data baru yang diedit
        db.games[gameIndex] = { ...db.games[gameIndex], ...req.body };
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Game tidak ditemukan' });
    }
});

// --- BARU: Tambah Review Pelanggan ---
app.post('/api/reviews', checkAuth, (req, res) => {
    const db = readDB();
    
    // Validasi skor bintang (harus 1-5)
    let stars = parseInt(req.body.stars) || 5;
    if (stars < 1) stars = 1;
    if (stars > 5) stars = 5;

    const newReview = { 
        id: Date.now(), 
        name: req.body.name,
        username: req.body.username || '', // Simpan username TikTok
        text: req.body.text,
        image: req.body.image || `https://ui-avatars.com/api/?name=${req.body.name}&background=random`, 
        stars: stars
    };
    
    db.reviews.unshift(newReview); // Masukkan ke urutan paling atas
    writeDB(db);
    res.json({ success: true });
});

// --- BARU: Hapus Review ---
app.delete('/api/reviews/:id', checkAuth, (req, res) => {
    const db = readDB();
    const reviewId = parseInt(req.params.id);
    db.reviews = db.reviews.filter(r => r.id !== reviewId);
    writeDB(db);
    res.json({ success: true });
});

// --- BARU: Edit Review ---
app.put('/api/reviews/:id', checkAuth, (req, res) => {
    const db = readDB();
    const reviewId = parseInt(req.params.id);
    const reviewIndex = db.reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex !== -1) {
        let stars = parseInt(req.body.stars) || 5;
        if (stars < 1) stars = 1;
        if (stars > 5) stars = 5;

        // Update data lama dengan data baru
        db.reviews[reviewIndex] = { ...db.reviews[reviewIndex], ...req.body, stars };
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 MKR Server running on http://localhost:${PORT}`);
});