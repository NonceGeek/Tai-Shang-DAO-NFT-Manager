import { Input, Button, List } from "antd";
import { useState } from "react";
import { Nft } from "../components";
import Address from "../components/Address";

const Item = List.Item;

function Query({ readContracts, blockExplorer, writeContracts }) {
  const [nfts, setNfts] = useState([])
  const [tokenId, setTokenId] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryNftByTokenId = async () => {
    if (!tokenId) return;
    setLoading(true);
    try {
      let owner_ = await readContracts.Web3Dev.ownerOf(tokenId);
      let uri = await readContracts.Web3Dev.tokenURI(tokenId);
      let nft = JSON.parse(atob(uri.split(',')[1]));
      nft.owner = owner_;
      nft.tokneId = tokenId;
      let tokenInfo = await readContracts.Web3Dev.getTokenInfo(tokenId);
      nft.tokenInfo = tokenInfo;
      setNfts([nft]);
    } catch (e) {
      console.log(e);
      setNfts([]);
    }
    setLoading(false);
  }

  const queryNftsByOwner = async () => {
    if (!owner) return;
    setLoading(true);
    var nfts_ = []
    try {
      let balance = await readContracts.Web3Dev.balanceOf(owner);
      for (let i = 0; i < balance; i++) { // Promise.all?
        let id = await readContracts.Web3Dev.tokenOfOwnerByIndex(owner, i);
        let uri = await readContracts.Web3Dev.tokenURI(id);
        let nft = JSON.parse(atob(uri.split(',')[1]));
        nft.owner = owner;
        nft.tokenId = id;
        let tokenInfo = await readContracts.Web3Dev.getTokenInfo(id);
        nft.tokenInfo = tokenInfo;
        // setNfts(nfts => [...nfts, nft]);
        nfts_.push(nft);
      }
    } catch (e) {
      console.log(e);
      setNfts([]);
    }
    setNfts(nfts_);
    setLoading(false);
  }

  const handleTokenIdChange = (evt) => {
    setTokenId(evt.target.value);
  }

  const handleOwnerChange = (evt) => {
    setOwner(evt.target.value);
  }

  return (
    <div>
      <Input placeholder="input tokenid(uint256)" onChange={handleTokenIdChange} style={{margin: '3ex', width: '60%'}} />
      <Button type="primary" onClick={() => queryNftByTokenId()}>query</Button>
      <Input placeholder="input owner(address)" onChange={handleOwnerChange} style={{margin: '3ex', width: '60%'}} />
      <Button type="primary" onClick={() => queryNftsByOwner()}>query</Button>
      <br />
      {
        nfts.length > 0 ? (
          <div>
            Nft Queried:
            <List
              itemLayout="horizontal"
              dataSource={nfts}
              renderItem={item => (
                <Nft nft={item} blockExplorer={blockExplorer} writeContracts={writeContracts} />
              )}
            />
          </div>
        ) : null
      }
      {
        loading ? (
          <h1>loading...</h1>
        ) : null
      }
    </div>
  )
}

export default Query;