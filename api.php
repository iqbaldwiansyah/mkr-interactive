<?php
// Set header agar output berupa JSON
header('Content-Type: application/json');

$db_file = 'database.json';

// --- Helper Functions ---
function readDB() {
    global $db_file;
    if (!file_exists($db_file)) {
        return ['games' => [], 'reviews' => [], 'poweredBy' => [], 'supportedBy' => []];
    }
    return json_decode(file_get_contents($db_file), true);
}

function writeDB($data) {
    global $db_file;
    // Simpan data kembali ke file JSON dengan format rapi
    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
}

function checkAuth() {
    if (!isset($_COOKIE['auth']) || $_COOKIE['auth'] !== 'mkr_admin_token') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
}

// Ambil metode request dan data dari frontend
$method = $_SERVER['REQUEST_METHOD'];
$route = isset($_GET['route']) ? $_GET['route'] : '';
$input = json_decode(file_get_contents('php://input'), true);

// --- 1. ROUTE PUBLIC (GET DATA) ---
if ($method === 'GET' && $route === 'data') {
    echo json_encode(readDB());
    exit;
}

// --- 2. ROUTE LOGIN ADMIN ---
if ($method === 'POST' && $route === 'login') {
    if (isset($input['password']) && $input['password'] === 'NgentotAnjingBangsad69') { // GANTI PASSWORD DI SINI
        // Set cookie berlaku 30 hari untuk seluruh path website ("/")
        setcookie('auth', 'mkr_admin_token', time() + (86400 * 30), "/"); 
        echo json_encode(['success' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Password salah']);
    }
    exit;
}

// --- 3. ROUTE ADMIN (GAMES) ---
if ($method === 'POST' && $route === 'games') {
    checkAuth();
    $db = readDB();
    $newGame = $input;
    $newGame['id'] = round(microtime(true) * 1000); // Generate ID unik mirip Date.now() JS
    array_unshift($db['games'], $newGame);
    writeDB($db);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'PUT' && preg_match('/^games\/(\d+)$/', $route, $matches)) {
    checkAuth();
    $id = (int)$matches[1];
    $db = readDB();
    foreach ($db['games'] as $key => $game) {
        if ($game['id'] == $id) {
            $db['games'][$key] = array_merge($game, $input);
            writeDB($db);
            echo json_encode(['success' => true]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['success' => false]);
    exit;
}

if ($method === 'DELETE' && preg_match('/^games\/(\d+)$/', $route, $matches)) {
    checkAuth();
    $id = (int)$matches[1];
    $db = readDB();
    $db['games'] = array_filter($db['games'], function($g) use ($id) { return $g['id'] != $id; });
    $db['games'] = array_values($db['games']); // Reset urutan index array
    writeDB($db);
    echo json_encode(['success' => true]);
    exit;
}

// --- 4. ROUTE ADMIN (REVIEWS) ---
if ($method === 'POST' && $route === 'reviews') {
    checkAuth();
    $db = readDB();
    $stars = isset($input['stars']) ? (int)$input['stars'] : 5;
    if ($stars < 1) $stars = 1;
    if ($stars > 5) $stars = 5;

    $newReview = [
        'id' => round(microtime(true) * 1000),
        'name' => $input['name'],
        'username' => isset($input['username']) ? $input['username'] : '',
        'text' => $input['text'],
        'image' => !empty($input['image']) ? $input['image'] : 'https://ui-avatars.com/api/?name=' . urlencode($input['name']) . '&background=random',
        'stars' => $stars
    ];
    array_unshift($db['reviews'], $newReview);
    writeDB($db);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'PUT' && preg_match('/^reviews\/(\d+)$/', $route, $matches)) {
    checkAuth();
    $id = (int)$matches[1];
    $db = readDB();
    foreach ($db['reviews'] as $key => $review) {
        if ($review['id'] == $id) {
            $stars = isset($input['stars']) ? (int)$input['stars'] : 5;
            $db['reviews'][$key] = array_merge($review, $input);
            $db['reviews'][$key]['stars'] = $stars;
            writeDB($db);
            echo json_encode(['success' => true]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['success' => false]);
    exit;
}

if ($method === 'DELETE' && preg_match('/^reviews\/(\d+)$/', $route, $matches)) {
    checkAuth();
    $id = (int)$matches[1];
    $db = readDB();
    $db['reviews'] = array_filter($db['reviews'], function($r) use ($id) { return $r['id'] != $id; });
    $db['reviews'] = array_values($db['reviews']);
    writeDB($db);
    echo json_encode(['success' => true]);
    exit;
}

// --- 5. ROUTE REORDER (GAMES & REVIEWS) ---
if ($method === 'PUT' && $route === 'reorder') {
    checkAuth();
    $db = readDB();
    $type = $input['type']; // 'games' atau 'reviews'
    $id = (int)$input['id'];
    $direction = $input['direction']; // 'up' atau 'down'

    if (isset($db[$type])) {
        $index = -1;
        // Cari posisi index data saat ini
        foreach ($db[$type] as $key => $item) {
            if ($item['id'] == $id) {
                $index = $key;
                break;
            }
        }

        if ($index !== -1) {
            if ($direction === 'up' && $index > 0) {
                // Tukar dengan data di atasnya
                $temp = $db[$type][$index];
                $db[$type][$index] = $db[$type][$index - 1];
                $db[$type][$index - 1] = $temp;
            } else if ($direction === 'down' && $index < count($db[$type]) - 1) {
                // Tukar dengan data di bawahnya
                $temp = $db[$type][$index];
                $db[$type][$index] = $db[$type][$index + 1];
                $db[$type][$index + 1] = $temp;
            }
            writeDB($db);
            echo json_encode(['success' => true]);
            exit;
        }
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Gagal merubah urutan']);
    exit;
}

// Jika route tidak ditemukan
http_response_code(404);
echo json_encode(['error' => 'Route not found']);
?>