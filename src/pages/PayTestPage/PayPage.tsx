import { Section, Cell, List, Title, Image } from "@telegram-apps/telegram-ui";
import { useInvoice,initMainButton } from "@telegram-apps/sdk-react";

import { useEffect, type FC } from "react";
import tonSvg from "../IndexPage/ton.svg";

import { Link } from "@/components/Link/Link.tsx";
export const PayPage: FC = () => {

  const invoice = useInvoice();
  const [mainButton] = initMainButton();
  useEffect(()=>{
    mainButton.setText(':purse: Wallet Pay');
    mainButton.show();
    mainButton.on('click',()=>{
      console.log("点击主按钮？")
    })
    console.log(mainButton.isVisible); // true  
    console.log('invoice',invoice); // true  
    return ()=>mainButton.hide();
  },[])
  return (
    <List>
      <Title style={{ padding: "20px 5px 10px", textAlign: "center" }}>
        支付页（测试）
      </Title>
      <Section
        header="支付功能"
        footer="test 支付 help developer to learn more about current launch information"
      >
        <Link to="/ton-connect">
          <Cell
            before={
              <Image src={tonSvg} style={{ backgroundColor: "#007AFF" }} />
            }
            subtitle="Connect your TON wallet"
          >
            TON Connect1
          </Cell>
        </Link>
      
        <Link to="/launch-params">
          <Cell subtitle="Platform identifier, Mini Apps version, etc.">
            Launch Parameters
          </Cell>
        </Link>
        <Link to="/theme-params">
          <Cell subtitle="Telegram application palette information">
            Theme Parameters
          </Cell>
        </Link>
        <a href="https://t.me/TgTestMiniapp1005Bot">
          <Cell subtitle="Telegram application palette information">
            去Bot窗口支付
          </Cell>
        </a>
      </Section>
    </List>
  );
};
