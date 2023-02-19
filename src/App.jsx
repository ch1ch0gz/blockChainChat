import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./WavePortal.json";
import _ from "lodash"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [numberWaves, setNumberWaves] = useState("");
  const contractAddress = "0xf0b283357933DB3847D963C4daC51a5995461854";
  const [allWaves, setAllWaves] = useState([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");
  const [value, setValue] = useState(true);
  
  const groupedWaves = _.groupBy(allWaves, wave => {
    return _.sortBy([wave.address, wave.receiver], o => o) ;
  });

  console.log("groupedWaves",JSON.stringify(groupedWaves));

  const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            alert(JSON.stringify(error))
            console.log(error);
        }
    };
    /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;


  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        //const waveTxn = await wavePortalContract.wave();
        //const waveTxn = await wavePortalContract.wave(input)
        const waveTxn = await wavePortalContract.wave(input, receiver,{ gasLimit: 300000 })
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setValue(!value)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            receiver: wave.receiver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

    /*
   * Create a method that gets all waves from your contract for a specific user
   */
  const getAllWavesUser = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.wavesPerUser();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            receiver: wave.receiver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }




  const waveCount = async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          setNumberWaves(count.toNumber()) ;
          
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
  }  

  const displayChat = {
    
  }
  /*
   * The passed callback function will be run when the page loads.
   * More technically, when the App component "mounts".
   */
  useEffect(() => {
        checkIfWalletIsConnected();
        if(setCurrentAccount) {
          waveCount();
          getAllWavesUser();
        }
  }, [value]);

  useEffect(() => {
    const timeOutId = setTimeout(() => setDisplayMessage(input), 500);
    return () => clearTimeout(timeOutId);
  }, [input]);

    
  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, to, timestamp, message) => {
      console.log("NewWave", from, to, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          receiver: to,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <img src="https://dl.openseauserdata.com/cache/originImage/files/f87bdaaa8136429bf3a800281c1b2401.jpg"width="100%" 
     height="100%" />
        <div className="bio">
        Welcome to your decentralize chat
        </div>

       <button className="waveButton" >
         Total number of waves from all users {numberWaves}!
        </button>
        
         
      <div>
        <input type="text" placeholder="receiver" size="100%" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
        <input type="text" placeholder="text" size="50"  value={input} onChange={(e) => setInput(e.target.value)} />        
          <label>
            <button className="waveButton" onClick={wave}>
              Let's chat!
            </button>
         </label>
      </div>
              

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        
        {_.map(groupedWaves, (groupOfWaves, index) => {
           return (
            <div key={index}>
             <div className="waveButton">
               <div className="chatContainer">Contact Address : {index.slice(index.lastIndexOf(',') + 1)}
               {_.map(groupOfWaves, (wave, index2) => {
               return (
                 <div key={index2}>
                  <div className={ wave.receiver.toLowerCase() === currentAccount ? "colourOwner" : "colourReceiver"}>{wave.message}</div>
                    <div className={ wave.receiver.toLowerCase() === currentAccount ? "timeOwner" : "timeReceiver"}>{(new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(wave.timestamp))}</div>
                 </div>
               )
             })}
              </div>
             </div>
            </div>
           ) 
        }) }
        
      </div>
    </div>
  );
};

export default App;