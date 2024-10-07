import {
  Cell,
  Address,
  beginCell,
  loadMessage,
  storeMessage,
  TonClient,
} from "@ton/ton";
import TonWeb from "tonweb";
import { handleBOC } from "./boc-analyze";

export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number }
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Error) {
        lastError = e;
      }
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
  }
  throw lastError;
}

// 设置 TONWeb 客户端
const tonweb = new TonWeb(
  new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
    apiKey: "b6fd49f4162628e09dec3c2835c4a9ea3f2c941cc7e1c807296ac73ed0bcfde2",
  })
);
const client = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
  apiKey: "b6fd49f4162628e09dec3c2835c4a9ea3f2c941cc7e1c807296ac73ed0bcfde2", // https://t.me/tonapibot
});
export async function getTxByBOC(exBoc: string): Promise<string> {
  // handleBOC(exBoc)
  const myAddress = Address.parse(
    "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL"
  ); // Address to fetch transactions from
  const payExtHash = Cell.fromBase64(exBoc).hash().toString("hex"); //支付完成返回的boc解析，与inMsg下的body比较
  console.log(payExtHash, "payExtHash");

  const bocBytes = TonWeb.utils.base64ToBytes(exBoc);
  const cell = TonWeb.boc.Cell.oneFromBoc(bocBytes);

  // 计算哈希
  const calculatedHash = await cell.hash();
  // 开始解析
  const base64Res = Cell.fromBase64(exBoc);
  const bocHashs = base64Res.hash();
  const _boss = base64Res.beginParse();
  /*------*/
  const bocHash = base64Res.hash().toString("hex");

  const _hash = Cell.fromBase64(exBoc).hash().toString("base64");

  const message = loadMessage(Cell.fromBase64(exBoc).asSlice());
  console.log("重点 _boss:", _boss);
  console.log("重点 bocHash:", bocHash);
  console.log("重点 hash:", _hash);
  console.log("重点 message:", message);
  console.log("重点 Message:", message.body.hash().toString("hex"));
  /*----*/
  console.log("00 messageBody：", calculatedHash);
  console.log("00 -1：", base64Res.toString());
  console.log("00 - boc结果 bocHashs：", bocHashs);
  console.log("0022 - boc结果：", base64Res.bits.toString());

  const extHash = bocHashs.toString("hex");
  const base64Hash = bocHashs.toString("base64");
  console.log("boc结果 base64：", base64Hash, extHash);

  /*start */
  const addressinfo = await tonweb.provider.getAddressInfo(
    "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL"
  );
  console.log("账号信息：", addressinfo);

  /*end*/
  const transactionInfo = await tonweb.provider.getTransactions(
    "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL",
    20,
    undefined
  );
  try {
    const transactionInfo22 = await tonweb.provider.sendBoc(exBoc);
    console.log("message222 message222", transactionInfo22);
  } catch (error) {
    console.error("message222 error:", error);
  }

  console.log("001 transactionInfo 结果：", transactionInfo);
  //1. 使用 TonWeb.HttpProvider方式获取交易记录;已经是转换过的字符串；
  for (const tx of transactionInfo) {
    const recipientAddress = tx.address.account_address;
    const inAddress = tx.in_msg.source;
    // 使用 TonWeb.utils.Address 将 Base64 地址解析为标准格式
    //还原 收款地址的原始值
    const originalAddress = new TonWeb.utils.Address(recipientAddress).toString(
      true,
      true,
      false
    );
    const originalInAddress = new TonWeb.utils.Address(inAddress).toString(
      true,
      true,
      false
    );
    // const workchain = parsedAddress.workChain; // workchain ID
    // const hexAddress = parsedAddress.hashPart.toString('hex'); // 地址的 hex 部分

    console.log("原始收款地址:", originalAddress);
    console.log("原始发起转账地址:", originalInAddress);
  }

  return retry(
    async () => {
      const transactions = await client.getTransactions(myAddress, {
        limit: 20,
      });
      console.log("交易列表：", transactions);
      for (const tx of transactions) {
        const inMsg = tx.inMessage;
        console.log("1. 每行hash", tx.hash().toString("hex"));
        if (inMsg?.info.type === "internal") {
          const inBOC = inMsg?.body;
          if (typeof inBOC === "undefined") {
            Promise.reject(new Error("Invalid external"));
            continue;
          }
          let hexAddress = tx.address.toString(16).padStart(64, "0"); // 保证 hex 字符串是 64 个字符长度
          hexAddress = "0:" + hexAddress; // 添加 workchain ID，假设是 workchain 0
          //还原 收款地址的原始值
          const originalAddress = new TonWeb.utils.Address(hexAddress).toString(
            true,
            true,
            false
          );
          //还原 转账进入地址原始值
          const adssss = await inMsg?.info.src?.hash.toString("hex");
          const hashs = beginCell().store(storeMessage(inMsg)).endCell().hash();
          const inHash = hashs.toString("hex");
          const originalInAddress = new TonWeb.utils.Address("0:" + adssss);
          const base64Address = originalInAddress.toString(true, true, false);
          console.log("0. inMsg _waddress !!!", originalAddress, base64Address);

          const base64Hash = hashs.toString("base64");

          console.log("1. inMsg hash", inHash, base64Hash);
          console.log("2. checking the tx", tx, tx.hash().toString("hex"));
          console.log(
            "3. base64 checking the tx",
            tx.hash().toString("base64")
          );
          console.log("4. inBOC.hash", inBOC.hash());

          // Assuming `inBOC.hash()` is synchronous and returns a hash object with a `toString` method
          if (extHash === inHash) {
            console.log("有想等的 Tx match");
            const txHash = tx.hash().toString("hex");
            console.log(`Transaction Hash: ${txHash}`);
            console.log(`Transaction LT: ${tx.lt}`);
            return txHash;
          }
        }
      }
      throw new Error("Transaction not found");
    },
    { retries: 2, delay: 1000 }
  );
}
const bocstr =
  "te6cckEBBAEAtQAB5YgASGJP94IfcUtuseHKZ1oYGshVjB/4PnQPO8Euqk58I84Dm0s7c///+Is30uJ4AAAAJeUkyZuTt7ukNRmV9uJ06+p1WA5PSgHcSFP6hTU99No4MGxVAG4RKtifwY+OzeXZNnuPhGQqk1c3S4NEB1Ul0A0BAgoOw8htAwIDAAAAZEIAHl9rYbefXil2ekNIH42VbbdNkg13ox3PA9AA9bJOXvSROIAAAAAAAAAAAAAAAAAAOl3Wpg==";
const txRes = getTxByBOC(bocstr);
txRes.then((res) => {
  console.log("txRes 结果：", res);
});
console.log("txRes 结果：000");
