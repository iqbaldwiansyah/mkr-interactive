document.addEventListener('DOMContentLoaded', () => {
    loadAdminGames();
    loadAdminReviews();
});

// ==========================================
// 🎮 MANAJEMEN GAME
// ==========================================
async function loadAdminGames() {
    const res = await fetch('/api/data');
    const data = await res.json();
    const container = document.getElementById('admin-games-list');
    if (!container) return;

    if (!data.games || data.games.length === 0) {
        container.innerHTML = '<p style="color: #888;">Belum ada game.</p>'; return;
    }

    container.innerHTML = data.games.map(game => `
        <div class="game-list-item">
            <div><strong style="color: var(--text-light);">${game.name}</strong></div>
            <div class="action-btns">
                <button class="btn" onclick="openEditModal(${game.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteGame(${game.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

async function addGame() {
    const gameData = {
        name: document.getElementById('g-name').value,
        desc: document.getElementById('g-desc').value,
        thumb: document.getElementById('g-thumb').value,
        link: document.getElementById('g-link').value
    };
    if (!gameData.name || !gameData.desc) return alert("Nama dan Deskripsi wajib diisi!");
    await fetch('/api/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gameData) });
    alert('Game ditambahkan!'); window.location.reload();
}

async function deleteGame(id) {
    if (confirm('Hapus game ini?')) { await fetch(`/api/games/${id}`, { method: 'DELETE' }); loadAdminGames(); }
}

async function openEditModal(id) {
    const res = await fetch('/api/data'); const data = await res.json();
    const game = data.games.find(g => g.id === id);
    if (game) {
        document.getElementById('edit-id').value = game.id;
        document.getElementById('edit-name').value = game.name;
        document.getElementById('edit-desc').value = game.desc;
        document.getElementById('edit-thumb').value = game.thumb;
        document.getElementById('edit-link').value = game.link;
        document.getElementById('edit-modal').style.display = 'block';
    }
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const updatedData = {
        name: document.getElementById('edit-name').value,
        desc: document.getElementById('edit-desc').value,
        thumb: document.getElementById('edit-thumb').value,
        link: document.getElementById('edit-link').value
    };
    await fetch(`/api/games/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
    closeEditModal(); loadAdminGames();
}
function closeEditModal() { document.getElementById('edit-modal').style.display = 'none'; }


// ==========================================
// ⭐ MANAJEMEN REVIEW
// ==========================================
function generateStarHtml(count) {
    const safeCount = parseInt(count) || 5;
    return '★'.repeat(safeCount) + '☆'.repeat(5 - safeCount);
}

async function loadAdminReviews() {
    const res = await fetch('/api/data');
    const data = await res.json();
    const container = document.getElementById('admin-reviews-list');
    if (!container) return;

    if (!data.reviews || data.reviews.length === 0) {
        container.innerHTML = '<p style="color: #888;">Belum ada review.</p>'; return;
    }

    container.innerHTML = data.reviews.map(review => `
        <div class="game-list-item" style="border-color: rgba(241, 196, 15, 0.2)">
            <div style="display:flex; align-items:center; gap: 10px;">
                <img src="${review.image || 'https://i.pravatar.cc/150'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div>
                    <strong style="color: var(--text-light);">${review.name}</strong> <span style="font-size: 0.8rem; color: #ff0050;">${review.username || ''}</span>
                    <div style="color: #f1c40f; font-size: 0.8rem;">${generateStarHtml(review.stars)}</div>
                </div>
            </div>
            <div class="action-btns">
                <button class="btn" style="border-color: #f1c40f; color: #f1c40f;" onclick="openEditReviewModal(${review.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteReview(${review.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

async function addReview() {
    const reviewData = {
        name: document.getElementById('r-name').value,
        username: document.getElementById('r-username').value,
        text: document.getElementById('r-text').value,
        image: document.getElementById('r-image').value,
        stars: document.getElementById('r-stars').value
    };
    if (!reviewData.name || !reviewData.text) return alert("Nama dan Isi Review wajib diisi!");
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewData) });
    alert('Review ditambahkan!'); window.location.reload();
}

async function deleteReview(id) {
    if (confirm('Hapus review ini?')) { await fetch(`/api/reviews/${id}`, { method: 'DELETE' }); loadAdminReviews(); }
}

async function openEditReviewModal(id) {
    const res = await fetch('/api/data'); const data = await res.json();
    const review = data.reviews.find(r => r.id === id);
    if (review) {
        document.getElementById('edit-r-id').value = review.id;
        document.getElementById('edit-r-name').value = review.name;
        document.getElementById('edit-r-username').value = review.username || '';
        document.getElementById('edit-r-text').value = review.text;
        document.getElementById('edit-r-image').value = review.image || '';
        document.getElementById('edit-r-stars').value = review.stars;
        document.getElementById('edit-review-modal').style.display = 'block';
    }
}

async function saveEditReview() {
    const id = document.getElementById('edit-r-id').value;
    const updatedData = {
        name: document.getElementById('edit-r-name').value,
        username: document.getElementById('edit-r-username').value,
        text: document.getElementById('edit-r-text').value,
        image: document.getElementById('edit-r-image').value,
        stars: parseInt(document.getElementById('edit-r-stars').value)
    };
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
    closeEditReviewModal(); loadAdminReviews();
}
function closeEditReviewModal() { document.getElementById('edit-review-modal').style.display = 'none'; }

function logout() { document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = '/mkr-admin'; }