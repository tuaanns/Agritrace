<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $conn = getConnection();
    $stmt = $conn->prepare("SELECT * FROM nguoi_dung WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['mat_khau'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['ho_ten'] = $user['ho_ten'];
        $_SESSION['vai_tro'] = $user['vai_tro'];
        
        echo json_encode([
            'success' => true, 
            'user' => [
                'id' => $user['id'],
                'ho_ten' => $user['ho_ten'],
                'vai_tro' => $user['vai_tro']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email hoặc mật khẩu không chính xác.']);
    }
} elseif ($action === 'check') {
    if (isLoggedIn()) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'ho_ten' => $_SESSION['ho_ten'],
                'vai_tro' => $_SESSION['vai_tro']
            ]
        ]);
    } else {
        echo json_encode(['success' => false]);
    }
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}
