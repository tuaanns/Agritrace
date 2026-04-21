// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Traceability
 * @dev Hệ thống lưu trữ lịch sử hành trình nông sản trên Blockchain Cronos
 */
contract Traceability {
    address public owner;

    struct Record {
        string action;      // Hành động (Thu hoạch, Đóng gói, Vận chuyển...)
        string location;    // Địa điểm thực hiện
        uint256 timestamp;  // Thời gian (Block timestamp)
    }

    // Mapping từ Mã Truy Xuất (Trace Code) sang danh sách các bản ghi hành trình
    mapping(string => Record[]) private traceRecords;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /**
     * @dev Thêm một bản ghi mới vào hành trình của nông sản
     */
    function addTraceRecord(string memory maTruyXuat, string memory action, string memory location) public onlyOwner {
        traceRecords[maTruyXuat].push(Record(action, location, block.timestamp));
    }

    /**
     * @dev Lấy tổng số lượng bản ghi hành trình của một mã sản phẩm
     */
    function getTraceCount(string memory maTruyXuat) public view returns (uint256) {
        return traceRecords[maTruyXuat].length;
    }

    /**
     * @dev Lấy thông tin chi tiết của một bản ghi dựa trên index
     */
    function getRecord(string memory maTruyXuat, uint256 index) public view returns (string memory, string memory, uint256) {
        require(index < traceRecords[maTruyXuat].length, "Index out of bounds");
        Record memory record = traceRecords[maTruyXuat][index];
        return (record.action, record.location, record.timestamp);
    }
}