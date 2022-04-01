import { List, Avatar } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Address from "../../src/components/Address";

const Item = List.Item;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "Web3Dev", "purpose");
  const totalSupply = useContractReader(readContracts, "Web3Dev", "totalSupply");
  const [ nfts, setNfts ] = useState([]);
  const blockExplorer = "https://moonbeam.moonscan.io/";

  const getNft = async (mintedNfts, i) => {
    let id = await readContracts.Web3Dev.tokenByIndex(i);
    let owner = await readContracts.Web3Dev.ownerOf(id);
    let uri = await readContracts.Web3Dev.tokenURI(id);
    // console.log(uri)//, atob(uri));
    let nft = JSON.parse(atob(uri.split(',')[1]));
    nft.owner = owner;
    // console.log(nft);
    mintedNfts.push(nft);
  }

  // TODO: add a cache to store the chain's nfts, no need to query every refresh
  const getAllMintedNfts = async () => {
    let tot = totalSupply.toNumber();
    var tasks = [];
    var mintedNfts = [];
    for (let i = 0; i < tot; i++) {
      tasks.push(getNft(mintedNfts, i));
    }
    await Promise.all(tasks);
    setNfts(mintedNfts);
  };

  useEffect(() => {
    if (!totalSupply || nfts.length > 0) return;
    getAllMintedNfts();
  }, [totalSupply]);

  /**
   * description: "https://web3dev.nft.doge.university?token_id=1306495467"
image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAzNTAgMzUwIj48c3R5bGU+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPkJhZGdlczogPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI0MCIgY2xhc3M9ImJhc2UiPjwvdGV4dD48dGV4dCB4PSIxMCIgeT0iNjAiIGNsYXNzPSJiYXNlIj5TZWUgTkZUIHJlbmRlcmVkIGluOiA8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjgwIiBjbGFzcz0iYmFzZSI+aHR0cHM6Ly93ZWIzZGV2Lm5mdC5kb2dlLnVuaXZlcnNpdHk/dG9rZW5faWQ9MTMwNjQ5NTQ2NzwvdGV4dD48dGV4dCB4PSIxMCIgeT0iMTAwIiBjbGFzcz0iYmFzZSI+MTA8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjEyMCIgY2xhc3M9ImJhc2UiPjg8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjE0MCIgY2xhc3M9ImJhc2UiPjU8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjE2MCIgY2xhc3M9ImJhc2UiPjU8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjE4MCIgY2xhc3M9ImJhc2UiPjc8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjIwMCIgY2xhc3M9ImJhc2UiPjM8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjIyMCIgY2xhc3M9ImJhc2UiPjwvdGV4dD48L3N2Zz4="
name: "web3dev #1306495467"
owner: "0xAbbcD9A203f2Ca423777dFbb915cb3fC66dCe5B8"
   * 
   */
  return (
    <div>
      <div>
        Nft Minted: {totalSupply?.toString()}
        <List
          itemLayout="horizontal"
          dataSource={nfts}
          renderItem={item => (
            <Item>
              <Item.Meta
                // avatar={<Avatar size="small" src={item.image} />}
                title={
                  <div>
                  <a href={item.description}>{item.name + " owner: "}</a>
                  <Address value={item.owner} blockExplorer={blockExplorer} />}
                  </div>
                }
                description={<img src={item.image} width='200' height='200' />}
              />
            </Item>
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
