import { List } from "antd";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
import { Nft } from "../components";

function Home({ readContracts, writeContracts, tx }) {
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
      let nft = JSON.parse(atob(uri.split(",")[1]));
      nft.owner = owner;
      nft.tokenId = id;
      let tokenInfo = await readContracts.Web3Dev.getTokenInfo(id);
      nft.tokenInfo = tokenInfo;
      // console.log(nft);
      mintedNfts.push(nft);
    } catch (e) {
      console.log(e);
    }
  };

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
            <Nft
              nft={item}
              blockExplorer={blockExplorer}
              readContracts={readContracts}
              writeContracts={writeContracts}
              tx={tx}
            />
          )}
        />
      </div>
    </div>
  );
}

export default Home;
