<?php
/**
 * Blockchain Simulation Module
 * Mô phỏng blockchain bằng cách tạo hash SHA-256
 */

require_once __DIR__ . '/../config/database.php';

class BlockchainSimulator {
    private $conn;

    public function __construct() {
        $this->conn = getConnection();
    }

    /**
     * Tạo hash SHA-256 từ dữ liệu
     */
    public function createHash($data) {
        if (is_array($data)) {
            $data = json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        return hash('sha256', $data);
    }

    /**
     * Lấy hash cuối cùng của lô sản phẩm (previous hash)
     */
    public function getLastHash($loSanPhamId) {
        $stmt = $this->conn->prepare(
            "SELECT current_hash FROM blockchain 
             WHERE lo_san_pham_id = ? 
             ORDER BY block_index DESC LIMIT 1"
        );
        $stmt->execute([$loSanPhamId]);
        $result = $stmt->fetch();
        return $result ? $result['current_hash'] : '0000000000000000000000000000000000000000000000000000000000000000';
    }

    /**
     * Lấy block index tiếp theo
     */
    public function getNextBlockIndex($loSanPhamId) {
        $stmt = $this->conn->prepare(
            "SELECT MAX(block_index) as max_index FROM blockchain WHERE lo_san_pham_id = ?"
        );
        $stmt->execute([$loSanPhamId]);
        $result = $stmt->fetch();
        return ($result['max_index'] ?? -1) + 1;
    }

    /**
     * Thêm block mới vào blockchain
     */
    public function addBlock($loSanPhamId, $data) {
        $previousHash = $this->getLastHash($loSanPhamId);
        $blockIndex = $this->getNextBlockIndex($loSanPhamId);
        $timestamp = date('Y-m-d H:i:s');
        
        // Tạo data hash từ dữ liệu gốc
        $dataJson = json_encode($data, JSON_UNESCAPED_UNICODE);
        $dataHash = $this->createHash($dataJson);
        
        // Tạo current hash từ block data (index + timestamp + data_hash + previous_hash)
        $blockData = $blockIndex . $timestamp . $dataHash . $previousHash;
        $currentHash = $this->createHash($blockData);

        // Lưu vào database
        $stmt = $this->conn->prepare(
            "INSERT INTO blockchain (lo_san_pham_id, block_index, timestamp, data_hash, previous_hash, current_hash, du_lieu) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $loSanPhamId, $blockIndex, $timestamp, 
            $dataHash, $previousHash, $currentHash, $dataJson
        ]);

        return [
            'block_index' => $blockIndex,
            'timestamp' => $timestamp,
            'data_hash' => $dataHash,
            'previous_hash' => $previousHash,
            'current_hash' => $currentHash
        ];
    }

    /**
     * Xác minh tính toàn vẹn của blockchain cho một lô sản phẩm
     */
    public function verifyChain($loSanPhamId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM blockchain WHERE lo_san_pham_id = ? ORDER BY block_index ASC"
        );
        $stmt->execute([$loSanPhamId]);
        $blocks = $stmt->fetchAll();

        if (empty($blocks)) return ['valid' => false, 'message' => 'Không có dữ liệu blockchain'];

        $isValid = true;
        $errors = [];

        for ($i = 0; $i < count($blocks); $i++) {
            $block = $blocks[$i];
            
            // Kiểm tra data hash
            $expectedDataHash = $this->createHash($block['du_lieu']);
            if ($expectedDataHash !== $block['data_hash']) {
                $isValid = false;
                $errors[] = "Block #{$block['block_index']}: Data hash không khớp - dữ liệu đã bị thay đổi!";
            }

            // Kiểm tra liên kết previous hash (từ block thứ 2 trở đi)
            if ($i > 0) {
                $previousBlock = $blocks[$i - 1];
                if ($block['previous_hash'] !== $previousBlock['current_hash']) {
                    $isValid = false;
                    $errors[] = "Block #{$block['block_index']}: Previous hash không khớp - chuỗi blockchain bị phá vỡ!";
                }
            }
        }

        return [
            'valid' => $isValid,
            'blocks' => $blocks,
            'total_blocks' => count($blocks),
            'errors' => $errors,
            'message' => $isValid ? 'Blockchain hợp lệ - Dữ liệu chưa bị thay đổi' : 'Blockchain KHÔNG hợp lệ - Phát hiện thay đổi dữ liệu!'
        ];
    }

    /**
     * Lấy toàn bộ blockchain của lô sản phẩm
     */
    public function getChain($loSanPhamId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM blockchain WHERE lo_san_pham_id = ? ORDER BY block_index ASC"
        );
        $stmt->execute([$loSanPhamId]);
        return $stmt->fetchAll();
    }
}
