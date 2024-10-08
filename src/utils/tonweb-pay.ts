import { Address } from "tonweb";
import TonWeb from "tonweb";
import { handleBOC, handleBOC2 } from "./boc-analyze";
// 设置 TONWeb 客户端
const tonweb = new TonWeb(
  new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
    apiKey: "b6fd49f4162628e09dec3c2835c4a9ea3f2c941cc7e1c807296ac73ed0bcfde2",
  })
);
const bocstr =
  "te6cckEBBAEAtQAB5YgASGJP94IfcUtuseHKZ1oYGshVjB/4PnQPO8Euqk58I84Dm0s7c///+Is30mFIAAAAFWrG7NsXeCP0W7V3Ox4zekSJnTUZBv0/E+N4TkXMIIfW933rTwOV6sDiTYRXRrmekl3fTB4AzwlmHDw3QpVr8hMBAgoOw8htAwIDAAAAZEIAHl9rYbefXil2ekNIH42VbbdNkg13ox3PA9AA9bJOXvSROIAAAAAAAAAAAAAAAAAAsfAFEw==";
export const checkTransactionStatus = async (txHash: string) => {
  const bocRes = await handleBOC(bocstr);
  const bocRes2 = await handleBOC2(bocstr);
  console.log("boc解析结果01：", bocRes);
  console.log("boc解析结果0002：", bocRes2);
  const address = new Address(
    "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL"
  );

  // 使用交易哈希查询支付状态
  const transactionInfo = await tonweb.provider.getTransactions(
    "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL",
    20,
    undefined,
    txHash
  );

  if (transactionInfo) {
    console.log("Transaction found:", transactionInfo);
    if (transactionInfo.isSuccess) {
      console.log("Payment succeeded!");
    } else {
      console.log("Payment failed.");
    }
  } else {
    console.log("Transaction not found.");
  }
};
