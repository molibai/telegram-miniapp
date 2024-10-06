import { Cell, toNano, Address, beginCell } from "@ton/ton";
import { SendTransactionRequest } from "@tonconnect/ui-react";

const amountStr = "0.01";
const usdtAddress = "UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL";
export const usdtTransactionTx = () => {
  const body = beginCell()
    .storeUint(0xf8a7ea5, 32) // op transfer
    .storeUint(0, 64) // queryId
    .storeCoins(toNano(amountStr)) // deposit_amount
    .storeAddress(Address.parse(usdtAddress)) // receiver address
    .storeAddress(Address.parse(usdtAddress)) //response_adress - address nhận phí GD thừa
    .storeMaybeRef(null) // custom_payload
    .storeCoins(toNano("0.05")) // forward_ton_amount
    .storeMaybeRef(beginCell().storeStringTail("something").endCell()) // forward_payload_amount if receiver is a smart contract
    .endCell();

  const myTransaction: SendTransactionRequest = {
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: usdtAddress.toString(), // Your USDT jetton wallet address
        amount: toNano(0.1).toString(), // feee
        payload: body.toBoc().toString("base64"), // payload with jetton transfer and comment body
      },
    ],
  };
  return myTransaction;
};
