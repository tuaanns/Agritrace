<?php
/**
 * Đăng xuất
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

$auth = new Auth();
$auth->logout();

// Restart session for flash message
session_start();
setFlash('success', 'Đăng xuất thành công!');
redirect('/pages/login.php');
