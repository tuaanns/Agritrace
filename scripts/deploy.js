import hre from "hardhat";

async function main() {
  console.log("Đang bắt đầu deploy contract Traceability...");

  const Traceability = await hre.ethers.deployContract("Traceability");

  await Traceability.waitForDeployment();

  console.log("--------------------------------------------------");
  console.log("CONTRACT ĐÃ ĐƯỢC DEPLOY THÀNH CÔNG!");
  console.log("Địa chỉ Contract:", await Traceability.getAddress());
  console.log("--------------------------------------------------");
  console.log("Hãy copy địa chỉ này và cập nhật vào frontend của bạn.");
}

main().catch((error) => {
  console.error("Lỗi khi deploy:", error);
  process.exitCode = 1;
});
