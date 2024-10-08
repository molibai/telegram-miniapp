import { TonClient4 ,Cell} from "@ton/ton";
import TonWeb from "tonweb";

const client = new TonClient4({
  endpoint: "https://testnet-v4.tonhubapi.com", // 你可以使用 testnet 或 mainnet 的 endpoint
});
export const handleBOC = async (boc:string) => {
  try {
      // 将 BOC 转换为字节数组
      const cell = TonWeb.utils.base64ToBytes(boc);
console.log("TonWeb.boc.Cell.fromBoc(cell)",)
      // 使用 tonweb 的 cell 解析工具解析 BOC
      const cell1 = TonWeb.boc.Cell.fromBoc(cell)[0] as any;
      const slice = cell1.beginParse();
    console.log("1. slice",slice.toString('hex'))
      // 获取解析出来的部分交易数据（例如内部交易 ID、存储费用、转账金额等）
      const parsedTransaction = {
          transaction_id: slice.loadUint(64), // 假设为 64 位的交易 ID
          from: slice.loadAddress, // 发送方地址
          to: slice.loadAddress, // 接收方地址
          value: slice.loadCoins(), // 转账金额
      };

      console.log('Parsed Transaction from BOC:', parsedTransaction);

  } catch (error) {
      console.error('Error parsing BOC:', error);
  }
};
// 解析 BOC
export const handleBOC2 = async (boc: string) => {
  try {
    // 将 BOC 转换为字节数组
    const bocBytes = TonWeb.utils.base64ToBytes(boc);
    console.log("第1 种解法：Transaction Hash:", bocBytes);

    // 创建 Cell 对象
    const cell3 = TonWeb.boc.Cell.fromBoc(bocBytes)[0];
    console.log("第2 种解法：Transaction Hash:", cell3);
    console.log('cell3 Bits:', cell3.bits.toString());

    
    // 打印 Cell 的内容
    const tsHast = await cell3.hash()
    console.log(tsHast,'tsHast');
    console.log("第 cell2种解法：Transaction Hash:", cell3);
    
    const cell2 = Cell.fromBase64(boc);

    const buffer = cell2.hash();
    const hashHex = buffer.toString("hex");
    console.log("第3333种解法：Transaction Hash:", hashHex);
  } catch (error) {
    console.error("Error parsing BOC:", error);
  }
};
