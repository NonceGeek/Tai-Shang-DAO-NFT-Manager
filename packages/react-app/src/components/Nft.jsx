import { SmileOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, List, Dropdown, Menu, notification } from "antd";
import { useEffect, useState } from "react";
import Address from "./Address";
const Item = List.Item;

function Nft({ nft, blockExplorer, readContracts, writeContracts, tx }) {
  // const badgeNames = ["noncegeeker", "learner", "workshoper", "partner", "buidler", "writer", "camper", "puzzler"];
  const [badgeNames, setBadgeNames] = useState([]);
  const [edit, setEdit] = useState(false);
  const [badges, setBadges] = useState({});
  const [tokenInfo, setTokenInfo] = useState("");
  const [curNft, setCurNft] = useState(nft);
  const [loading, setLoading] = useState(false);

  const getBadgeNames = async () => {
    let response = await fetch("https://api.github.com/gists/9c765cdeb324685d0d0c0099ba433a19", {
      method: "GET",
    });
    let data = await response.json();
    setBadgeNames(eval(data?.files["badges.json"].content));
  };

  const parseTokenInfo = tokenInfo_ => {
    if (!tokenInfo_ || tokenInfo_ === "") {
      setBadges({});
      return;
    }
    var badges_ = {};
    const tokenInfoArr = tokenInfo_.substr(1, tokenInfo_.length - 2).split(", ");
    for (let i = 0; i < tokenInfoArr.length; i++) {
      var badgeName = tokenInfoArr[i].split(" * ")[0];
      if (badgeName[0] === '"') badgeName = badgeName.substr(1, badgeName.length - 1);
      if (badgeName[badgeName.length - 1] === '"') badgeName = badgeName.substr(0, badgeName.length - 1);
      var badgeCount = "1";
      if (tokenInfoArr[i].split(" * ").length === 2) {
        badgeCount = tokenInfoArr[i].split(" * ")[1];
      }
      badges_[badgeName] = badgeCount;
    }
    setBadges(badges_);
  };

  const formatTokenInfo = () => {
    console.log("formatTokenInfo", badges);
    var tokenInfo_ = "[";
    for (let badgeName in badges) {
      if (badges[badgeName] === "1") {
        tokenInfo_ += `"${badgeName}", `;
      } else {
        tokenInfo_ += `"${badgeName} * ${badges[badgeName]}", `;
      }
    }
    if (tokenInfo_.length > 2) tokenInfo_ = tokenInfo_.substr(0, tokenInfo_.length - 2) + "]";
    else tokenInfo_ = "";
    setTokenInfo(tokenInfo_);
  };

  const handleBadges = () => {
    console.log("handleBadges", nft, badges, tokenInfo);
    setEdit(true);
  };

  const cancelBadges = () => {
    setEdit(false);
    setTokenInfo(curNft.tokenInfo);
    parseTokenInfo(curNft.tokenInfo);
  };

  const getNft = async () => {
    if (!curNft) return;
    let uri = await readContracts.Web3Dev.tokenURI(curNft.tokenId.toString());
    let nft_ = JSON.parse(atob(uri.split(",")[1]));
    console.log("getNft", curNft, nft_);
    let tokenInfo_ = await readContracts.Web3Dev.getTokenInfo(curNft.tokenId);
    setCurNft({ ...curNft, image: nft_.image, tokenInfo: tokenInfo_ });
  };

  const notify = (message, description, icon) => {
    notification.open({
      message: message,
      description: description,
      icon: icon,
    });
  };

  const confirmBadges = async () => {
    if (tokenInfo === curNft.tokenInfo) {
      setEdit(false);
      return;
    }
    console.log("confirmBadges", curNft);
    setLoading(true);
    try {
      const result = tx(writeContracts.Web3Dev.setTokenInfo(curNft.tokenId, tokenInfo), update => {
        setEdit(false);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          notify(
            "Success!",
            "set badges of nft " + curNft.tokenId.toString() + " success",
            <SmileOutlined style={{ color: "#108ee9" }} />,
          );
        }
      });
      await result;
    } catch (e) {
      console.log("error: ", e);
      notify(
        "Failed!",
        "set badges of nft " + curNft.tokenId.toString() + " failed",
        <ExclamationCircleOutlined style={{ color: "#ee1111" }} />,
      );
    }
    await getNft(); // refresh nft info
    setLoading(false);
  };

  useEffect(() => {
    if (!nft) return;
    setCurNft(nft);
  }, [nft]);

  useEffect(() => {
    if (!curNft) return;
    getBadgeNames();
    // console.log("useEffect curNft", curNft);
    setTokenInfo(curNft.tokenInfo);
    parseTokenInfo(curNft.tokenInfo);
  }, [curNft]);

  const addBadgesMenu = (
    <Menu>
      {badgeNames.map((badgeName, i) => {
        return (
          <Menu.Item key={badgeName}>
            <Button
              type="link"
              onClick={() => {
                setBadges(badges => {
                  if (badgeName in badges) {
                    let count = parseInt(badges[badgeName]);
                    count++;
                    badges[badgeName] = count.toString();
                  } else {
                    badges[badgeName] = "1";
                  }
                  return badges;
                });
                formatTokenInfo();
              }}
            >
              {badgeName}
            </Button>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const removeBadgesMenu = (
    <Menu>
      {Object.keys(badges).map((badgeName, i) => {
        return (
          <Menu.Item key={badgeName}>
            <Button
              type="link"
              onClick={() => {
                setBadges(badges => {
                  let count = parseInt(badges[badgeName]);
                  count--;
                  if (count === 0) {
                    delete badges[badgeName];
                  } else {
                    badges[badgeName] = count.toString();
                  }
                  return badges;
                });
                formatTokenInfo();
              }}
            >
              {badgeName}
            </Button>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div>
      <Item>
        <Item.Meta
          title={
            <div>
              <a href={curNft.description}>{curNft.name + " owner: "}</a>
              <Address value={curNft.owner} blockExplorer={blockExplorer} />
            </div>
          }
          description={
            loading ? "loading" : <img src={curNft.image} width="200" height="200" onClick={handleBadges} alt="" />
          }
        />
      </Item>
      <Modal
        title="Badges"
        visible={edit}
        onCancel={cancelBadges}
        onOk={confirmBadges}
        destroyOnClose={true}
        loading={loading}
      >
        <Dropdown overlay={addBadgesMenu}>
          <Button type="primary">Add</Button>
        </Dropdown>
        &nbsp;
        <Dropdown overlay={removeBadgesMenu}>
          <Button type="primary">Remove</Button>
        </Dropdown>
        &nbsp; &nbsp; &nbsp;
        <span>badges: {tokenInfo}</span>
      </Modal>
    </div>
  );
}

export default Nft;
