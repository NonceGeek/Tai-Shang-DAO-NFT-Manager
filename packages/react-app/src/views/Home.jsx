import { List } from "antd";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
import { Nft } from "../components";

function Home({ readContracts, writeContracts, tx, blockExplorer, subgraphUri }) {
  const totalSupply = useContractReader(readContracts, "Web3Dev", "totalSupply");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  const graphQLFetcher = async graphQLParams => {
    let res = await fetch(subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    });
    return res.json();
  };

  const getTokenUri = async (tokens, token) => {
    let uri = await readContracts.Web3Dev.tokenURI(token.tokenId);
    // console.log(uri)//, atob(uri));
    let nft = JSON.parse(atob(uri.split(",")[1]));
    token = { ...token, ...nft };
    tokens.push(token);
  };

  const getAllMintedNftsByGraph = async () => {
    setLoading(true);
    let res = await graphQLFetcher({
      query: `{tokens(first: 100, skip: 0, orderBy: createdAt, orderDirection: desc) {id tokenInfo owner createdAt modifiedAt}}`,
    });
    console.log(res.data.tokens);
    var tokens = [];
    var tasks = [];
    for (let i = 0; i < res.data.tokens.length; i++) {
      let token = res.data.tokens[i];
      token.tokenId = token.id;
      tasks.push(getTokenUri(tokens, token));
    }
    await Promise.all(tasks);
    setNfts(tokens);
    setLoading(false);
  };

  // const getNft = async (mintedNfts, i) => {
  //   try {
  //     let id = await readContracts.Web3Dev.tokenByIndex(i);
  //     let owner = await readContracts.Web3Dev.ownerOf(id);
  //     let uri = await readContracts.Web3Dev.tokenURI(id);
  //     // console.log(uri)//, atob(uri));
  //     let nft = JSON.parse(atob(uri.split(",")[1]));
  //     nft.owner = owner;
  //     nft.tokenId = id;
  //     let tokenInfo = await readContracts.Web3Dev.getTokenInfo(id);
  //     nft.tokenInfo = tokenInfo;
  //     // console.log(nft);
  //     mintedNfts.push(nft);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // TODO: add a cache to store the chain's nfts, no need to query every refresh
  // TODO: show 3 nfts each row
  // const getAllMintedNfts = async () => {
  //   setLoading(true);
  //   let tot = totalSupply.toNumber();
  //   var tasks = [];
  //   var mintedNfts = [];
  //   for (let i = 0; i < tot; i++) {
  //     tasks.push(getNft(mintedNfts, i));
  //   }
  //   await Promise.all(tasks);
  //   setNfts(mintedNfts);
  //   setLoading(false);
  // };

  // useEffect(() => {
  //   if (!totalSupply || nfts.length > 0) return;
  //   getAllMintedNfts();
  // }, [totalSupply]);

  useEffect(() => {
    if (!totalSupply || nfts.length > 0) return;
    console.error("totalSupply:", totalSupply, nfts);
    getAllMintedNftsByGraph();
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
