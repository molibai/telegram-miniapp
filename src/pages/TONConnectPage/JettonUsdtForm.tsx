import React, { useCallback, useState } from "react";
import ReactJson, { InteractionProps } from "react-json-view";
import TonWeb, { JettonMinterOptions } from "tonweb";
import {
  SendTransactionRequest,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";

// In this example, we are using a predefined smart contract state initialization (`stateInit`)
// to interact with an "EchoContract". This contract is designed to send the value back to the sender,
// serving as a testing tool to prevent users from accidentally spending money.
const defaultTx: SendTransactionRequest = {
  // The transaction is valid for 10 minutes from now, in unix epoch seconds.
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      // The receiver's address.
      address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M",
      // Amount to send in nanoTON. For example, 0.005 TON is 5000000 nanoTON.
      amount: "5000000",
      // (optional) State initialization in boc base64 format.
      stateInit:
        "te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==",

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

export function JettonUsdtForm() {
  const [tx, setTx] = useState(defaultTx);
  const [bocRes, setUsdtResult] = useState({});

  const wallet = useTonWallet();
  const { sender, walletAddress, tonClient } = useTonConnect();

  const [tonConnectUi] = useTonConnectUI();

  const onChange = useCallback((value: InteractionProps) => {
    setTx(value.updated_src as SendTransactionRequest);
  }, []);
  const usdtSendTransaction = async () => {
    //USDT payment
    if (!wallet) {
      alert("链接未链接");
      return;
    }
    const { account } = wallet || {};
    console.log("🚧 Jetton payment");
    const tonweb = new TonWeb();
    const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
      address: new TonWeb.utils.Address(
        "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
      ),
    } as JettonMinterOptions);
    console.log(jettonMinter);
    const jettonMinterAddress = await jettonMinter.getJettonWalletAddress(
      new TonWeb.utils.Address(account.address)
    );
    console.log(jettonMinterAddress.toString(true));
    const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, {
      address: jettonMinterAddress,
    });
    const tonFee = "50000000";
    const seqno = Date.now();
    const jettonBody = {
      queryId: seqno,
      jettonAmount: 1000,
      amount: 1000,
      tokenAmount: 1000,
      toAddress: new TonWeb.utils.Address(
        "UQAI9ack-mbNMw2oQEuiB6899ZZ1gdDAZXWzv_oIz_N7j9-0"
      ),
      responseAddress: new TonWeb.utils.Address(account.address),
    };

    console.log("🚧 jettonWallet.createTransferBody", jettonBody);
    const payload = await jettonWallet.createTransferBody(jettonBody);

    console.log("🚧 payload :", payload);

    //Invoice payment
    const payloadBoc = await payload.toBoc();
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 6000, // 6000 sec
      messages: [
        {
          address: jettonMinterAddress.toString(true),
          amount: tonFee,
          payload: TonWeb.utils.bytesToBase64(payloadBoc),
        },
      ],
    };
    console.log(transaction, "支付前");
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
      <h3>Jetton USDT 交易</h3>
      {wallet ? (
        <button
          style={{ fontSize: "15px", marginTop: 15 }}
          onClick={usdtSendTransaction}
        >
          发送 Jetton usd 交易
        </button>
      ) : (
        <button onClick={() => tonConnectUi.openModal()}>
          Connect wallet to send the transaction
        </button>
      )}

      <h4>Jetton 交易结果：</h4>
      <ReactJson theme="ocean" src={bocRes} onDelete={onChange} />
    </div>
  );
}
