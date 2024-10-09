import React, { useCallback, useState } from "react";
import ReactJson, { InteractionProps } from "react-json-view";
import TonWeb, { JettonMinterOptions } from "tonweb";
import {
  SendTransactionRequest,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";

export function UsdtPayPage() {
  const [tx, setTx] = useState({});
  const [bocRes, setUsdtResult] = useState({});

  const wallet = useTonWallet();

  const [tonConnectUI] = useTonConnectUI();
  useEffect(
    () =>
      tonConnectUI.onStatusChange((wallet) => {
        console.log("链接状态：", wallet);
      }),
    []
  );
  const usdtSendTransaction = async () => {
    //USDT payment
    if (!wallet) {
      alert("链接未链接");
      return;
    }
    const resveAddrdss = "UQCzAYMhQnuDgv_E6mtsZdTr_wI6xxCX9KT_XXs1Ju4eVOjc"; //吴
    // const resveAddrdss ="UQA8vtbDbz68Uuz0hpA_GyrbbpskGu9GO54HoAHrZJy96QNL"//k
    const invoice = {
      _id: "6704978d604f9d96038a1132",
      id: "48776edce4ca3c0c5e64bb620def25e5",
      uid: "5474914365",
      payer: 0,
      amount: "100000",
      amountUsd: "1000",
      type: 0,
      token: 1,
      address: resveAddrdss,
      paymentLable: "TON USDT ",
      createTime: 1728354189111,
      expiredTime: 1728357789111,
      methodId: "2ijmeyllvmc5gf70",
      status: 0,
      comment: "TON USDT invoices to buy steam cd key .",
      callback: "https://demo.tonspay.top/callback/api",
      redirect: false,
      paymentResult: {},
      routerAddress: resveAddrdss,
      routerFeeRate: "0.001",
      routerFee: "534000",
      tokenAddress: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    };
    const { account } = wallet || {};
    console.log("🚧 Jetton payment");
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
      jettonAmount: "100000",
      amount: "100000",
      tokenAmount: "100000",
      toAddress: new TonWeb.utils.Address(invoice.address),
      responseAddress: new TonWeb.utils.Address(account.address),
    };

    console.log("🚧 jettonWallet.createTransferBody", jettonBody);
    const payload = await jettonWallet.createTransferBody(jettonBody);

    console.log("🚧 payload :", payload);
    //Invoice payment
    const invoicePayload = new TonWeb.boc.Cell();
    invoicePayload.bits.writeUint(0, 32);
    invoicePayload.bits.writeString(invoice.id);

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
        {
          address: invoice.routerAddress,
          amount: Number(invoice.routerFee).toFixed(0),
          payload: TonWeb.utils.bytesToBase64(await invoicePayload.toBoc()),
        },
      ],
    };
    // const transaction = {
    //   validUntil: Math.floor(Date.now() / 1000) + 6000, // 6000 sec
    //   messages: [
    //     {
    //       address: jettonMinterAddress.toString(true),
    //       amount: tonFee,
    //       payload: TonWeb.utils.bytesToBase64(payloadBoc),
    //     },
    //   ],
    // };
    console.log(transaction, "支付前");
    setTx(transaction);
    try {
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("result : ", result);
      setUsdtResult(result);
    } catch (e) {
      console.error(e);
      window.alert(e);
    }
  };

  return (
    <div className="send-tx-form">
      <h3>USDT 交易</h3>
      <ReactJson theme="ocean" src={tx} />
      {wallet ? (
        <button
          style={{ fontSize: "15px", marginTop: 15 }}
          onClick={usdtSendTransaction}
        >
          usd 交易
        </button>
      ) : (
        <button
          onClick={() => tonConnectUI.openSingleWalletModal("telegram-wallet")}
        >
          Connect wallet to send the transaction
        </button>
      )}
      <h4>交易结果：</h4>
      <ReactJson theme="ocean" src={bocRes} />
    </div>
  );
}
