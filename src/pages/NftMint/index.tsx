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
  useGetAccountInfo,
  useGetPendingTransactions,
  useGetNetworkConfig
} from '@elrondnetwork/dapp-core';
import {
  Balance,
  Interaction,
  QueryResponseBundle,
  ProxyProvider,
  GasLimit,
  ContractFunction,
  U32Value,
  ArgSerializer
} from '@elrondnetwork/erdjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import { dAppName } from 'config';
import { routeNames } from 'routes';
import './index.scss';
import Time from './Time';
import NftSample1 from '../../assets/img/nature-1.jpg';
import NftSample2 from '../../assets/img/nature-2.jpg';

import {
  NftContractContext,
  SaleStatusContext,
} from '../../ContextWrapper';
import {
  Status,
  INftMintStateProvider,
  convertToStatus
} from '../../utils/state';
import {
  calculatePercentage,
  precisionRound,
  convertWeiToEgld,
} from '../../utils/convert';
import {
  ONE_DAY_IN_SECONDS,
  SECOND_IN_MILLI,
  TIMEOUT
} from '../../utils/const';
import {
  NFT_CONTRACT_ADDRESS,
} from '../../config';
import { sendQuery } from '../../utils/transaction';


const NftMint = () => {
  const tokenSaleTargetRef = React.useRef(null);

  const { network } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { account } = useGetAccountInfo();
  const proxy = new ProxyProvider(network.apiAddress, { timeout: TIMEOUT });

  const nftContract = React.useContext(NftContractContext);
  
  const [nftMintStatus, setNftMintStatus] = React.useState<INftMintStateProvider | undefined>();
  React.useEffect(() => {
    (async () => {
      if (!nftContract) return;
      const interaction: Interaction = nftContract.methods.getStatus();
      const res: QueryResponseBundle | undefined = await sendQuery(nftContract, proxy, interaction);
      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue.valueOf();

      const status = convertToStatus(value.field0.valueOf().name);
      const nextTime = value.field1.toNumber() * SECOND_IN_MILLI;
      const mintedCount = value.field2.toNumber();
      const maxSupply = value.field3.toNumber();
      const nftPrice = convertWeiToEgld(value.field4.valueOf());
      console.log('value.field4', value.field4);
      console.log('nftPrice', nftPrice);

      const mintableCount = maxSupply - mintedCount;

      setNftMintStatus({status, nextTime, mintedCount, maxSupply, nftPrice, mintableCount});
    })();
  }, [nftContract, hasPendingTransactions]);
  console.log('>>>nftMintStatus', nftMintStatus);

  const [mintCount, setMintCount] = React.useState<number>(1);
  const onChangeMintCount = (e: any) => {
    e.preventDefault();
    setMintCount(e.target.value);
  };
  const onDecrease = (e: any) => {
    e.preventDefault();
    if (mintCount - 1 > 0) setMintCount(mintCount - 1);
  };
  const onIncrease = (e: any) => {
    e.preventDefault();
    if (nftMintStatus) {
      console.log('nftMintStatus', nftMintStatus);
      if (mintCount + 1 <= nftMintStatus.mintableCount) setMintCount(mintCount + 1);
    }
  };

  const [title, setTitle] = React.useState<string>('');
  const [mintButtonDisabled, setMintButtonDisabled] = React.useState<boolean>(true);
  const [mintStateInfo, setMintStateInfo] = React.useState<string>('');
  React.useEffect(() => {
    let disabled = true;
    let title = '';
    let mintStateInfo = '';
    if (nftMintStatus){
      if (nftMintStatus.status == Status.NotIssued) {
        title = 'Nft Collection Is Not Issued!';
      } else if (nftMintStatus.status == Status.NotStarted) {
        title = 'Nft Minting Is Not Started!';
      } else if (nftMintStatus.status == Status.Started) {
        title = 'Mint Your Carbon NFT Now!';
        if (account?.address){
          if (0 < mintCount && mintCount <= nftMintStatus.mintableCount) {
            disabled = false;
          }
          else if (mintCount > nftMintStatus.mintableCount){
            mintStateInfo = 'Cannot mint more than max supply!';
          }
          else {
            mintStateInfo = 'Should mint more than one NFT!';
          }
        }
      } else {
        title = 'NFT Minting Is Ended!';
      }
    }

    if (!account?.address) {
      mintStateInfo = 'You should connect your wallet!';
    }

    setMintButtonDisabled(disabled);
    setTitle(title);
    setMintStateInfo(mintStateInfo);
  }, [nftMintStatus, mintCount]);

  async function mintNFTs(e: any) {
    e.preventDefault();
    if (!nftMintStatus) return;

    const args = [
      new U32Value(mintCount)
    ];
    const { argumentsString } = (new ArgSerializer()).valuesToString(args);
    const data = 'mint@' + argumentsString;

    console.log('nftMintStatus.nftPrice', nftMintStatus.nftPrice);
    console.log('>>', nftMintStatus.nftPrice * mintCount);
    const tx = {
      receiver: NFT_CONTRACT_ADDRESS,
      data: data,
      gasLimit: new GasLimit(10000000 * mintCount),
      value: Balance.egld(nftMintStatus.nftPrice * mintCount)
    };
    await refreshAccount();
    await sendTransactions({
      transactions: tx
    });
  }

  return (
    <>
      <Container className='custom-nft-container' fluid>
        <Row>
          <Col lg={3} xl={4} className='custom-nft-sample left'>
            <img src={NftSample1} />
          </Col>
          <Col lg={6} xl={4} className='custom-nft-mid'>
            <div className='custom-nft-mid-div'>
              <div className='custom-nft-mid-header'>You can mint Carbon NFT now!</div>
              
              <Time />

              <div className='custom-progress-container'>
                <div className='custome-progress-number color-white'>{nftMintStatus?.mintedCount} / {nftMintStatus?.maxSupply}</div>
                <ProgressBar now={nftMintStatus && (nftMintStatus.mintedCount / nftMintStatus.maxSupply * 100)} ref={tokenSaleTargetRef} />
                <div></div>
              </div>

              <div className='custom-nft-mint-amount-container'>
                <span className='custom-nft-mint-decrease-spin' onClick={onDecrease}>
                  <FontAwesomeIcon icon={faMinus} />
                </span>
                <input className='custom-nft-mint-amount' type='number' value={mintCount} onChange={onChangeMintCount} />
                <span className='custom-nft-mint-increase-spin' onClick={onIncrease}>
                  <FontAwesomeIcon icon={faPlus} />
                </span>
              </div>
              <button className='custom-nft-mint-button' disabled={mintButtonDisabled} onClick={mintNFTs}>MINT</button>
              <div className='custom-nft-mint-state-info'>{mintStateInfo}</div>
            </div>
          </Col>
          <Col lg={3} xl={4} className='custom-nft-sample right'>
            <img src={NftSample2} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NftMint;
