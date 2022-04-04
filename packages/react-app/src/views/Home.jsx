import { List } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Nft } from "../components";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts, writeContracts }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "Web3Dev", "purpose");
  const totalSupply = useContractReader(readContracts, "Web3Dev", "totalSupply");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const blockExplorer = "https://moonbeam.moonscan.io/";

  const getNft = async (mintedNfts, i) => {
    try {
      let id = await readContracts.Web3Dev.tokenByIndex(i);
      let owner = await readContracts.Web3Dev.ownerOf(id);
      let uri = await readContracts.Web3Dev.tokenURI(id);
      // console.log(uri)//, atob(uri));
      let nft = JSON.parse(atob(uri.split(',')[1]));
      nft.owner = owner;
      nft.tokenId = id;
      let tokenInfo = await readContracts.Web3Dev.getTokenInfo(id);
      nft.tokenInfo = tokenInfo;
      // console.log(nft);
      mintedNfts.push(nft);
    } catch (e) {
      console.log(e);
    }
  }

  // TODO: add a cache to store the chain's nfts, no need to query every refresh
  // TODO: show 3 nfts each row
  const getAllMintedNfts = async () => {
    setLoading(true);
    let tot = totalSupply.toNumber();
    var tasks = [];
    var mintedNfts = [];
    for (let i = 0; i < tot; i++) {
      tasks.push(getNft(mintedNfts, i));
    }
    await Promise.all(tasks);
    setNfts(mintedNfts);
    setLoading(false);
  };

  useEffect(() => {
    if (!totalSupply || nfts.length > 0) return;
    getAllMintedNfts();
  }, [totalSupply]);

  return (
    <div>
      <div>
        Nft Minted: {totalSupply?.toString()}
        <List
          itemLayout="horizontal"
          dataSource={nfts}
          loading={loading}
          renderItem={item => (
            <Nft nft={item} blockExplorer={blockExplorer} writeContracts={writeContracts} />
          )}
        />
      </div>
      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>📝</span>
        This Is Your App Home. You can start editing it in{" "}
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          packages/react-app/src/views/Home.jsx
        </span>
      </div>
      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>✏️</span>
        Edit your smart contract{" "}
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          YourContract.sol
        </span>{" "}
        in{" "}
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          packages/hardhat/contracts
        </span>
      </div>
      {!purpose ? (
        <div style={{ margin: 32 }}>
          <span style={{ marginRight: 8 }}>👷‍♀️</span>
          You haven't deployed your contract yet, run
          <span
            className="highlight"
            style={{
              marginLeft: 4,
              /* backgroundColor: "#f9f9f9", */ padding: 4,
              borderRadius: 4,
              fontWeight: "bolder",
            }}
          >
            yarn chain
          </span>{" "}
          and{" "}
          <span
            className="highlight"
            style={{
              marginLeft: 4,
              /* backgroundColor: "#f9f9f9", */ padding: 4,
              borderRadius: 4,
              fontWeight: "bolder",
            }}
          >
            yarn deploy
          </span>{" "}
          to deploy your first contract!
        </div>
      ) : (
        <div style={{ margin: 32 }}>
          <span style={{ marginRight: 8 }}>🤓</span>
          The "purpose" variable from your contract is{" "}
          <span
            className="highlight"
            style={{
              marginLeft: 4,
              /* backgroundColor: "#f9f9f9", */ padding: 4,
              borderRadius: 4,
              fontWeight: "bolder",
            }}
          >
            {purpose}
          </span>
        </div>
      )}

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🤖</span>
        An example prop of your balance{" "}
        <span style={{ fontWeight: "bold", color: "green" }}>({ethers.utils.formatEther(yourLocalBalance)})</span> was
        passed into the
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          Home.jsx
        </span>{" "}
        component from
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          App.jsx
        </span>
      </div>
      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>💭</span>
        Check out the <Link to="/hints">"Hints"</Link> tab for more tips.
      </div>
      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🛠</span>
        Tinker with your smart contract using the <Link to="/debug">"Debug Contract"</Link> tab.
      </div>
    </div>
  );
}

export default Home;
