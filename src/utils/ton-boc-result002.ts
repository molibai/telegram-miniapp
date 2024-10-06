import { Cell, Address, loadMessage, storeMessage, TonClient } from "@ton/ton";

import TonWeb from "tonweb";

// TONWeb 客户端配置
const tonweb = new TonWeb(
  new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
    apiKey: "b6fd49f4162628e09dec3c2835c4a9ea3f2c941cc7e1c807296ac73ed0bcfde2",
  })
);

const client = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
  apiKey: "b6fd49f4162628e09dec3c2835c4a9ea3f2c941cc7e1c807296ac73ed0bcfde2",
});

// Helper to compare BOC and transaction
function compareBOCWithTransaction(boc, transaction) {
  const bocCell = Cell.fromBase64(boc);
  const bocHash = bocCell.hash().toString("hex");

  const hash = Cell.fromBase64(boc).hash().toString("base64");

  const message = loadMessage(Cell.fromBase64(boc).asSlice());
  console.log("重点 hash:", hash);
  console.log("重点 Message:", message.body.hash().toString("hex"));
  console.log(`Comparing BOC hash ${bocHash}  `);
  console.log(`Comparing BOC hash222`, transaction);

  // 比对交易哈希值与 BOC 哈希值
  if (transaction.hash === bocHash) {
    console.log("BOC matches with transaction hash!");
    return true;
  }

  // 检查交易的输入和输出消息
  const inMsg = transaction.inMessage;
  if (inMsg?.body) {
    const inBOCHash = inMsg.body.hash().toString("hex");
    if (bocHash === inBOCHash) {
      console.log("BOC matches with inMessage body hash!");
      return true;
    }
  }

  // 检查所有输出消息
  for (const outMsg of transaction.outMessages) {
    const outBOCHash = outMsg.body.hash().toString("hex");
    if (bocHash === outBOCHash) {
      console.log("BOC matches with outMessage body hash!");
      return true;
    }
  }

  return false;
}

// 解析 BOC 并找到相应交易
export async function getTxByBOC(exBoc: string): Promise<string> {
  try {
    const myAddress = Address.parse(
      "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL"
    );

    // 获取交易记录
    const transactionInfo = await tonweb.provider.getTransactions(
      "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL",
      20
    );
    console.log("Fetched Transactions:", transactionInfo);

    // 遍历交易列表并进行 BOC 比对
    for (const tx of transactionInfo) {
      const isMatch = compareBOCWithTransaction(exBoc, tx);

      if (isMatch) {
        console.log("Matching transaction found!");
        return tx.hash;
      }
    }

    throw new Error("Matching transaction not found");
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}

// BOC 示例
const bocstr =
  "te6cckEBBAEAtQAB5YgASGJP94IfcUtuseHKZ1oYGshVjB/4PnQPO8Euqk58I84Dm0s7c///+Is30mFIAAAAFWrG7NsXeCP0W7V3Ox4zekSJnTUZBv0/E+N4TkXMIIfW933rTwOV6sDiTYRXRrmekl3fTB4AzwlmHDw3QpVr8hMBAgoOw8htAwIDAAAAZEIAHl9rYbefXil2ekNIH42VbbdNkg13ox3PA9AA9bJOXvSROIAAAAAAAAAAAAAAAAAAsfAFEw==";

getTxByBOC(bocstr)
  .then((res) => console.log("Matching transaction found:", res))
  .catch((err) => console.error("Error:", err));
