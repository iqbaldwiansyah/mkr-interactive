document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();

        // 1. Render Games
        const renderGames = (containerId, limit = null) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            let games = data.games || [];
            if (limit) games = games.slice(0, limit);

            container.innerHTML = games.map(game => {
                const safeKey = game.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                return `
                <div class="card">
                    <img src="${game.thumb}" alt="${game.name}">
                    <h3 data-i18n="game_${safeKey}_title">${game.name}</h3>
                    <p data-i18n="game_${safeKey}_desc">${game.desc}</p>
                    <a href="${game.link}" class="btn" target="_blank" data-i18n="btn_more_info">More Info / Buy</a>
                </div>
                `;
            }).join('');
        };

        renderGames('featured-games', 3);
        renderGames('all-games');

        // 2. Render Customer Reviews
        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsContainer) {
            if (data.reviews && data.reviews.length > 0) {
                const getStars = (count) => {
                    const safeCount = parseInt(count) || 5;
                    return '★'.repeat(safeCount) + '☆'.repeat(5 - safeCount);
                };

                reviewsContainer.innerHTML = data.reviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <img src="${review.image || 'https://i.pravatar.cc/150'}" alt="${review.name}" class="review-avatar">
                            <div class="review-info">
                                <h4>${review.name || 'Anonymous'}</h4>
                                <span class="review-tiktok">${review.username || ''}</span>
                                <div class="star-rating">${getStars(review.stars)}</div>
                            </div>
                        </div>
                        <p class="review-text">${review.text}</p>
                    </div>
                `).join('');
            } else {
                reviewsContainer.innerHTML = '<p style="text-align:center; color:#888; grid-column: 1 / -1;">Belum ada review.</p>';
            }
        }

        // 3. Render Footer Logos
        const poweredContainer = document.getElementById('powered-by');
        if (poweredContainer && data.poweredBy) {
            poweredContainer.innerHTML = data.poweredBy.map(p => `
                <a href="${p.link}" target="_blank"><img src="${p.logo}" alt="${p.name}"></a>
            `).join('');
        }
        
        const supportedContainer = document.getElementById('supported-by');
        if (supportedContainer && data.supportedBy) {
            supportedContainer.innerHTML = data.supportedBy.map(s => `
                <a href="${s.link}" target="_blank"><img src="${s.logo}" alt="${s.name}"></a>
            `).join('');
        }

        // 4. Terapkan Bahasa Tersimpan
        const savedLang = localStorage.getItem('mkr_language');
        if (savedLang) {
            applyTranslations(JSON.parse(savedLang).code);
        } else {
            applyTranslations('id');
        }

    } catch (err) {
        console.error("Gagal memuat data utama:", err);
    }
});

// --- KAMUS TRANSLASI ---
const translations = {
    id: {
        nav_home: "BERANDA", nav_game: "GAME", nav_how: "CARA BELI", nav_discord: "GABUNG DISCORD",
        hero_title: "Game Interaktif Livestream TikTok",
        hero_desc: "Tingkatkan engagement penontonmu dengan game interaktif paling modern.",
        btn_see_all: "Lihat Semua Game", title_featured: "Game Unggulan",
        btn_more_info: "Info Lanjut / Beli",
        
        game_mario_interactive_title: "Mario Interactive",
        game_mario_interactive_desc: "Biarkan penonton TikTok-mu mengontrol dan membuat chaos di game Mario favoritmu secara real-time!",
        game_pvz_livestream_mod_title: "PVZ Livestream Mod",
        game_pvz_livestream_mod_desc: "Penonton bisa menanam zombie atau tanaman menggunakan gift dan komentar.",
        game_nfs_most_wanted_title: "NFS Most Wanted",
        game_nfs_most_wanted_desc: "Buat balapanmu semakin kacau.",

        how_title: "Langkah Pembelian",
        step1_title: "Join Discord",
        step1_desc: "Langkah pertama adalah bergabung dengan server Discord komunitas kami untuk melihat update terbaru, berinteraksi dengan member lain, dan mendapatkan support.",
        step2_title: "Pilih Game",
        step2_desc: "Cari dan pilih game interaktif yang paling cocok untuk gaya livestream TikTok kamu di halaman GAME. Cek deskripsi dan fiturnya.",
        step3_title: "Contact Admin",
        step3_desc: "Buka tiket (Open Ticket) atau chat langsung dengan Admin di Discord untuk melakukan pemesanan dan instruksi pembayaran.",
        step4_title: "Setup Livestream",
        step4_desc: "Setelah pembayaran dikonfirmasi, kamu akan menerima file game beserta tutorial lengkap cara setup ke TikTok Live Studio atau OBS."
    },
    en: {
        nav_home: "HOME", nav_game: "GAMES", nav_how: "HOW TO BUY", nav_discord: "JOIN DISCORD",
        hero_title: "Interactive TikTok Livestream Games",
        hero_desc: "Boost your viewer engagement with the most modern interactive games.",
        btn_see_all: "View All Games", title_featured: "Featured Games",
        btn_more_info: "More Info / Buy",
        
        game_mario_interactive_title: "Mario Interactive",
        game_mario_interactive_desc: "Let your TikTok viewers control and cause chaos in your favorite Mario game in real-time!",
        game_pvz_livestream_mod_title: "PVZ Livestream Mod",
        game_pvz_livestream_mod_desc: "Viewers can plant zombies or plants using gifts and comments.",
        game_nfs_most_wanted_title: "NFS Most Wanted",
        game_nfs_most_wanted_desc: "Make your races even more chaotic.",

        how_title: "How to Buy",
        step1_title: "Join Discord",
        step1_desc: "The first step is to join our community Discord server to see the latest updates, interact with other members, and get support.",
        step2_title: "Choose a Game",
        step2_desc: "Find and select the interactive game that best suits your TikTok livestream style on the GAMES page.",
        step3_title: "Contact Admin",
        step3_desc: "Open a ticket or chat directly with the Admin on Discord to place an order and get payment instructions.",
        step4_title: "Setup Livestream",
        step4_desc: "Once payment is confirmed, you will receive the game files along with a complete tutorial."
    },
    ja: {
        nav_home: "ホーム", nav_game: "ゲーム", nav_how: "購入方法", nav_discord: "DISCORDに参加",
        hero_title: "TikTok インタラクティブ ライブ ゲーム",
        hero_desc: "最新のインタラクティブゲームで視聴者のエンゲージメントを高めましょう。",
        btn_see_all: "すべてのゲームを見る", title_featured: "おすすめゲーム",
        btn_more_info: "詳細 / 購入",

        game_mario_interactive_title: "マリオ インタラクティブ",
        game_mario_interactive_desc: "視聴者がコメントでマリオのゲームプレイをコントロールしてカオスを起こせます！",
        game_pvz_livestream_mod_title: "PVZ ライブストリーム Mod",
        game_pvz_livestream_mod_desc: "視聴者がギフトやコメントを使ってゾンビや植物を配置できます。",
        game_nfs_most_wanted_title: "NFS モストウォンテッド",
        game_nfs_most_wanted_desc: "あなたのレースをさらにカオスにしよう。",

        how_title: "購入方法",
        step1_title: "Discordに参加",
        step1_desc: "コミュニティに参加して最新情報を確認してください。",
        step2_title: "ゲームを選ぶ",
        step2_desc: "最適なゲームを探して選択します。",
        step3_title: "管理者に連絡",
        step3_desc: "Discordで管理者に連絡して注文します。",
        step4_title: "セットアップ",
        step4_desc: "チュートリアルに従って配信を設定します。"
    },
    es: {
        nav_home: "INICIO", nav_game: "JUEGOS", nav_how: "CÓMO COMPRAR", nav_discord: "ÚNETE A DISCORD",
        hero_title: "Juegos Interactivos para TikTok",
        hero_desc: "Aumenta la participación de tus espectadores.",
        btn_see_all: "Ver Todos los Juegos", title_featured: "Juegos Destacados",
        btn_more_info: "Más Info / Comprar",
        game_mario_interactive_title: "Mario Interactivo",
        game_mario_interactive_desc: "¡Causa caos en tu juego favorito de Mario en tiempo real!",
        game_pvz_livestream_mod_title: "Mod de PVZ",
        game_pvz_livestream_mod_desc: "Los espectadores pueden plantar zombis usando regalos.",
        game_nfs_most_wanted_title: "NFS Most Wanted",
        game_nfs_most_wanted_desc: "Haz que tus carreras sean aún más caóticas.",
        
        // Terjemahan How To Buy - Spanyol
        how_title: "Cómo Comprar",
        step1_title: "Únete a Discord",
        step1_desc: "El primer paso es unirte a nuestro servidor de Discord para ver actualizaciones y obtener soporte.",
        step2_title: "Elige un Juego",
        step2_desc: "Busca y selecciona el juego interactivo en la página de JUEGOS.",
        step3_title: "Contacta al Admin",
        step3_desc: "Abre un ticket o chatea con el administrador en Discord para realizar un pedido.",
        step4_title: "Configura el Directo",
        step4_desc: "Una vez confirmado el pago, recibirás los archivos junto con un tutorial completo."
    },
    zh: {
        nav_home: "首页", nav_game: "游戏", nav_how: "如何购买", nav_discord: "加入 DISCORD",
        hero_title: "TikTok 互动直播游戏",
        hero_desc: "用最现代的互动游戏提升观众参与度。",
        btn_see_all: "查看所有游戏", title_featured: "精选游戏",
        btn_more_info: "更多信息 / 购买",
        game_mario_interactive_title: "互动马里奥",
        game_mario_interactive_desc: "在实时中控制并在你最爱的马里奥游戏中制造混乱！",
        game_pvz_livestream_mod_title: "PVZ 直播模组",
        game_pvz_livestream_mod_desc: "观众可以通过礼物来种植僵尸。",
        game_nfs_most_wanted_title: "极品飞车",
        game_nfs_most_wanted_desc: "让你的赛车比赛更加混乱。",

        // Terjemahan How To Buy - Mandarin
        how_title: "购买步骤",
        step1_title: "加入 Discord",
        step1_desc: "第一步是加入我们的社区 Discord 服务器，查看最新动态并获得支持。",
        step2_title: "选择游戏",
        step2_desc: "在游戏页面寻找并选择最适合您直播风格的互动游戏。",
        step3_title: "联系管理员",
        step3_desc: "在 Discord 上开票或直接与管理员聊天以进行预订并获取付款说明。",
        step4_title: "设置直播",
        step4_desc: "付款确认后，您将收到游戏文件以及完整的设置教程。"
    }
};

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

function setLanguage(langCode, langText, flagUrl) {
    const langBtn = document.getElementById('current-lang');
    if (langBtn) {
        langBtn.innerHTML = `<img src="${flagUrl}" alt="${langCode}"> ${langText}`;
    }
    const langData = { code: langCode, text: langText, flag: flagUrl };
    localStorage.setItem('mkr_language', JSON.stringify(langData));
    applyTranslations(langCode);
}