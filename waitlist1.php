<?php
/**
 * TMAG Fintech — Waitlist API
 * POST /api/waitlist.php
 * Stores waitlist signups in SQLite database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ─── DATABASE SETUP ─────────────────────────
$db_path = __DIR__ . '/../db/tmag.db';
$db_dir  = dirname($db_path);

if (!is_dir($db_dir)) {
    mkdir($db_dir, 0755, true);
}

try {
    $db = new PDO('sqlite:' . $db_path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create table if not exists
    $db->exec("
        CREATE TABLE IF NOT EXISTS waitlist (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            email     TEXT    NOT NULL UNIQUE,
            role      TEXT    DEFAULT '',
            ip        TEXT    DEFAULT '',
            created   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

// ─── PARSE INPUT ────────────────────────────
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data) {
    // Try form data fallback
    $data = $_POST;
}

$name  = trim($data['name']  ?? '');
$email = trim($data['email'] ?? '');
$role  = trim($data['role']  ?? '');

// ─── VALIDATION ─────────────────────────────
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Please enter your full name.';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}
if (strlen($name) > 120 || strlen($email) > 255) {
    $errors[] = 'Input is too long.';
}

// Simple spam honeypot check
if (!empty($data['website'])) {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Sanitize
$name  = htmlspecialchars($name,  ENT_QUOTES, 'UTF-8');
$email = strtolower($email);
$role  = htmlspecialchars($role,  ENT_QUOTES, 'UTF-8');
$ip    = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';

// ─── INSERT ─────────────────────────────────
try {
    $stmt = $db->prepare("
        INSERT INTO waitlist (name, email, role, ip)
        VALUES (:name, :email, :role, :ip)
    ");
    $stmt->execute([
        ':name'  => $name,
        ':email' => $email,
        ':role'  => $role,
        ':ip'    => $ip,
    ]);

    $position = $db->query("SELECT COUNT(*) FROM waitlist")->fetchColumn();

    echo json_encode([
        'success'  => true,
        'message'  => 'You\'re on the list!',
        'position' => (int) $position,
    ]);

} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'UNIQUE constraint') !== false) {
        // Already signed up
        echo json_encode([
            'success' => true,
            'message' => 'You\'re already on the list!',
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Could not save your details. Please try again.']);
    }
}
