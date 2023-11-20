import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  ProgressBar
} from 'react-bootstrap';

import {
  refreshAccount,
  sendTransactions,
  useGetAccountInfo
} from '@elrondnetwork/dapp-core';
import { Balance } from '@elrondnetwork/erdjs/out';

import { dAppName } from 'config';
import { routeNames } from 'routes';
import './index.scss';
import Time from './Time';

import {
  ContractContext,
  SaleStatusContext,
} from '../../ContextWrapper';
import {
  Status,
  ISaleStatusProvider,
  IAccountStateProvider
} from '../../utils/state';
import {
  calculatePercentage,
  precisionRound
} from '../../utils/convert';
import {
  ONE_DAY_IN_SECONDS,
  SECOND_IN_MILLI
} from '../../utils/const';
import {
  EXCHANGE_RATE,
  CONTRACT_ADDRESS,
  TOKEN_NAME
} from '../../config';

const Presale = () => {
  const { account } = useGetAccountInfo();

  const tokenSaleTargetRef = React.useRef(null);

  const saleStatus = React.useContext<ISaleStatusProvider | undefined>(SaleStatusContext);

  const [buyAmountInEgld, setBuyAmountInEgld] = React.useState<number>(0);
  const [buyAmountInEsdt, setBuyAmountInEsdt] = React.useState<number>(0);

  const [buyButtonDisabled, setBuyButtonDisabled] = React.useState<boolean>(true);

  const [buyStateInfo, setBuyStateInfo] = React.useState<string>('');

  const onChangeBuyAmountInEgld = (e: any) => {
    e.preventDefault();
    setBuyAmountInEgld(e.target.value);
    setBuyAmountInEsdt(precisionRound(e.target.value / EXCHANGE_RATE));
  };

  React.useEffect(() => {
    let disabled = true;
    let stateInfo = '';
    if (saleStatus && saleStatus.status == Status.Started) {
      if (account?.address){
        if (saleStatus.minBuyLimit <= buyAmountInEgld && buyAmountInEgld <= saleStatus.maxBuyLimit) {
          disabled = false;
        }
        else {
          stateInfo = 'You can only buy tokens between min and max amount.';  
        }
      }
      else {
        stateInfo = 'You should login to buy tokens.';
      }
    }

    setBuyButtonDisabled(disabled);
    setBuyStateInfo(stateInfo);
  }, [saleStatus, buyAmountInEgld]);

  async function buyToken(e: any) {
    e.preventDefault();
    const tx = {
      value: Balance.egld(buyAmountInEgld),
      data: 'buy',
      receiver: CONTRACT_ADDRESS,
      gasLimit: 10000000,
    };
    await refreshAccount();
    await sendTransactions({
      transactions: tx
    });
  }

  return (
    <>
      <Container className='custom-presale-container'>
        <Row>
          <Col md={12} className='custom-presale-top'>
            <div className='custom-presale-left'>
              <h1 className='custom-presale-header color-white'>Token Sale Is {saleStatus?.status == Status.NotStarted ? 'Coming' : (saleStatus?.status == Status.Started ? 'Live' : 'Ended')}!</h1>
              {/* <div className='custom-presale-info'>Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.</div>

              <div className='custom-timer-header'>Last Moment To Grab The Tokens</div> */}
              
              <Time />

              <div className='custom-progress-container'>
                <div className='custome-progress-number color-white'>{saleStatus ? saleStatus.totalBoughtAmountOfEsdt : '-'} / {saleStatus ? saleStatus.goal : '-'} {TOKEN_NAME}</div>
                <ProgressBar now={saleStatus ? (saleStatus.totalBoughtAmountOfEsdt / saleStatus.goal * 100) : 0} ref={tokenSaleTargetRef} />
                <div></div>
              </div>
              <div className='custom-presale-left-description'>CAB is utility token of Convert Carbon</div>
            </div>
          </Col>
          <Col md={12} className='custom-presale-mid'>
            <div className='custom-buy-card'>
              <div className='custom-buy-card-body'>
                <h3 className='custom-buy-card-header color-white'>BUY TOKENS HERE</h3>
                <div className='custom-buy-card-amount'>
                  <div className='custom-buy-card-amount-header'>AMOUNT TO PAY</div>
                  <div className='custom-buy-card-amount-container'>
                    <input className='custom-buy-card-amount-input' type='number' onChange={onChangeBuyAmountInEgld} defaultValue={buyAmountInEgld} />
                    <span className='custom-buy-card-amount-unit color-white'>EGLD</span>
                  </div>
                </div>
                <div className='custom-buy-card-amount'>
                  <div className='custom-buy-card-amount-header'>AMOUNT TO GET</div>
                  <div className='custom-buy-card-amount-container'>
                    <input className='custom-buy-card-amount-input' type='number' disabled={true} value={buyAmountInEsdt} />
                    <span className='custom-buy-card-amount-unit color-white'>{TOKEN_NAME}</span>
                  </div>
                </div>
                <div className='custom-buy-card-info'>Minimum Buy Amount:&nbsp;&nbsp;<b>{saleStatus ? saleStatus.minBuyLimit : '-'} EGLD</b></div>
                <div className='custom-buy-card-info'>Maximum Buy Amount:&nbsp;&nbsp;<b>{saleStatus ? saleStatus.maxBuyLimit : '-'} EGLD</b></div>
                <div className='custom-buy-card-info'>User Level:&nbsp;&nbsp;<b>{saleStatus ? saleStatus.userLevel  : '-'}</b></div>
              </div>
              <div className='custom-buy-card-footer'>
                <button className='custom-buy-card-buy-button' onClick={buyToken} disabled={buyButtonDisabled}>Buy {TOKEN_NAME}</button>
                {/* <button className='custom-buy-card-buy-button' onClick={buyToken}>Buy {TOKEN_NAME}</button> */}
                <div className='custom-buy-card-buy-state-info'>{buyStateInfo}</div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Presale;
