import Head from "next/head";
import styles from "../styles/Home.module.css";
import { providers, Contract, utils } from "ethers";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "../constants";
import { useRef, useState, useEffect } from "react";
import Web3Modal from "web3modal";

export default function Home() {
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numTokenMinted , setNumTokenMinted]= useState("");
  const web3ModalRef = useRef();

  const getNumMintedTokens = async () =>{
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const numTokenIds = await nftContract.tokenIds();
      setNumTokenMinted(numTokenIds.toString());
      
    } catch (error) {
      console.error(error);
      
    }
  }
  // for presale started

  const presaleMint = async () => {
    
    try {
      const signer = await getProviderOrSigner(true);

      // get an instance of your NFT contract58
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("you succesfully minted ");
    } catch (error) {
      console.error(error);
    }
   
  };

  // publicMint: Mint an NFT after the presale
  const publicMint = async () => {
    
    try {
      const signer = await getProviderOrSigner(true);

      // get an instance of your NFT contract58
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("you succesfully minted  a cryptodev");
    } catch (error) {
        console.error(error);
    }
 
  };


  const startPresale = async () => {
    
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      // const tx = await nftContract.presaleStarted();
      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
    
  };
  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );
      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
      // get an instance of your nft contract
      return isPresaleStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner(true);

      // get an instance of your NFT contract58
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const owner = await nftContract.owner();
      const signer = await getProviderOrSigner(true);
      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    //need provide or signer from metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    //updte wallat connected to be true
    // tell user to use rinkeby
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change to rinkeby");
      throw new Error("change to rinkeby");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
    await getNumMintedTokens();
    // Track in real time the number of minted NFTs
    setInterval( async  () =>{
      await getNumMintedTokens();

    } ,5 * 1000); 

    //Track in real time the status of presale {started ,ended}

    setInterval( async  () =>{
      const presaleStarted = await checkIfPresaleStarted();
      if(presaleStarted){
        await checkIfPresaleEnded();
      }
    } ,5 * 1000); 

  };
  useEffect(() => {
    if (!walletConnected)
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        ProviderOptions: {},
        disabledInjectedProvider: false,
      });

    onPageLoad();
  }, [walletConnected]);


  function renderButton() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect wallat
        </button>
      );
    }

    if (loading) {
      return( <span className={styles.description}> Loading...</span>
      );
    }
    if (isOwner && !presaleStarted) {
      //render to a button to start the preasale
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale!
        </button>
      );
    }
    if (!presaleStarted) {
      // presale is't started yet come back latter
      return (
        <div>
          <span className={styles.description}>
            presale has not strted yet , come back latter
          </span>
        </div>
      );
    } 
    if (presaleStarted && !presaleEnded) {
      // allow users to mint in presale
      // they need to be in whitelist for this to work
      return (
        <div>
          <div className={styles.description} onClick={publicMint}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto now
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>Presale Mint 🚀</button>
        </div>
      );
    }
    if (presaleEnded) {
      //allow users to tale part in public sale
      return (
        <div>
          <span className={styles.description}>
            presale has ended you can mint a cryptodev in public sale , if any
            remain
          </span>
          <button className={styles.button}> Public Mint 🚀</button>
        </div>
      );
    }
  }
  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>
      {/* <div className={styles.main}>{renderBody}</div> */}
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numTokenMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
