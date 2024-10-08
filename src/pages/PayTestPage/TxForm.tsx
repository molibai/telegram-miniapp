import React, { useCallback, useState } from "react";
import ReactJson, { InteractionProps } from "react-json-view";
import { checkTransactionStatus } from "../../utils/tonweb-pay";
import "../../utils/ton-boc-result";
import {
  SendTransactionRequest,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import TonWeb from "tonweb";

//老吴：UQCzAYMhQnuDgv_E6mtsZdTr_wI6xxCX9KT_XXs1Ju4eVOjc
const receiverAddress = "UQCzAYMhQnuDgv_E6mtsZdTr_wI6xxCX9KT_XXs1Ju4eVOjc";
// In this example, we are using a predefined smart contract state initialization (`stateInit`)
// to interact with an "EchoContract". This contract is designed to send the value back to the sender,
// serving as a testing tool to prevent users from accidentally spending money.
const defaultTx: SendTransactionRequest = {
  // The transaction is valid for 10 minutes from now, in unix epoch seconds.
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      // The receiver's address.
      address: receiverAddress,
      // Amount to send in nanoTON. For example, 0.005 TON is 5000000 nanoTON.
      amount: "10000",
      // (optional) State initialization in boc base64 format.
      // stateInit:
      // "te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==",

      // (optional) Payload in boc base64 format.
      payload: "te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g==",
    },

    // Uncomment the following message to send two messages in one transaction.
    /*
    {
      // Note: Funds sent to this address will not be returned back to the sender.
      address: 'UQAuz15H1ZHrZ_psVrAra7HealMIVeFq0wguqlmFno1f3B-m',
      amount: toNano('0.01').toString(),
    }
    */
  ],
};

export function TonPayPage() {
  const [tx, setTx] = useState(defaultTx);

  const wallet = useTonWallet();
  const [bocRes, setUsdtResult] = useState({});
  const [tonConnectUi] = useTonConnectUI();

  const onChange = useCallback((value: InteractionProps) => {
    setTx(value.updated_src as SendTransactionRequest);
  }, []);
  const testBtn = async () => {
    const res = await checkTransactionStatus("");
    console.log("测试结果：", res);
  };
  const sendTonTransaction = async () => {
    //USDT payment
    if (!wallet) {
      alert("链接未链接");
      return;
    }

    const seqno = Date.now();
    const jettonBody = {
      queryId: seqno,
      jettonAmount: "100000",
    };

    const invoicePayload = new TonWeb.boc.Cell();
    invoicePayload.bits.writeUint(0, 32);
    invoicePayload.bits.writeString(JSON.stringify(jettonBody));

    //Invoice payment
    const payloadBoc = await invoicePayload.toBoc();
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 6000, // 6000 sec
      messages: [
        {
          // The receiver's address.
          address: receiverAddress,
          // Amount to send in nanoTON. For example, 0.005 TON is 5000000 nanoTON.
          amount: "10000",
          payload: TonWeb.utils.bytesToBase64(payloadBoc),
        },
      ],
    };

    console.log(transaction, "支付前");
    setTx(transaction);
    try {
      const result = await tonConnectUi.sendTransaction(transaction);
      console.log("result : ", result);
      setUsdtResult(result);
    } catch (e) {
      console.error(e);
      window.alert(e);
    }
  };

  return (
    <div className="send-tx-form">
      <h3>Configure and send transaction</h3>
      <button onClick={testBtn}>测试boc</button>
      <ReactJson
        theme="ocean"
        src={tx}
        onEdit={onChange}
        onAdd={onChange}
        onDelete={onChange}
      />

      {wallet ? (
        <button onClick={() => sendTonTransaction()}>ton 发送交易</button>
      ) : (
        <button
          onClick={() => tonConnectUi.openSingleWalletModal("telegram-wallet")}
        >
          Connect wallet to send the transaction
        </button>
      )}
      <h4>交易结果：</h4>
      <ReactJson theme="ocean" src={bocRes} />
    </div>
  );
}
