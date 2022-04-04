import { Button, Modal, List, Form, Space, Card, Dropdown, Menu } from 'antd';
import { useEffect, useState } from 'react';
import Address from './Address';
const Item = List.Item;
const { Meta } = Card;

/**
  description: "https://web3dev.nft.doge.university?token_id=1306495467"
  image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAzNTAgMzUwIj48c3R5bGU+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPkJhZGdlczogPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI0MCIgY2xhc3M9ImJhc2UiPlsibm9uY2VnZWVrZXIiLCAiYnVpZGxlciIgKiAzLCAid3JpdGVyIiAqIDJdPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI2MCIgY2xhc3M9ImJhc2UiPlNlZSBORlQgcmVuZGVyZWQgaW46IDwvdGV4dD48dGV4dCB4PSIxMCIgeT0iODAiIGNsYXNzPSJiYXNlIj5odHRwczovL3dlYjNkZXYubmZ0LmRvZ2UudW5pdmVyc2l0eT90b2tlbl9pZD02MjE8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjEwMCIgY2xhc3M9ImJhc2UiPjE8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjEyMCIgY2xhc3M9ImJhc2UiPjE8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjE0MCIgY2xhc3M9ImJhc2UiPjEwPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxNjAiIGNsYXNzPSJiYXNlIj4xPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxODAiIGNsYXNzPSJiYXNlIj43PC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIyMDAiIGNsYXNzPSJiYXNlIj40PC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIyMjAiIGNsYXNzPSJiYXNlIj48L3RleHQ+PC9zdmc+"
  name: "web3dev #1306495467"
  owner: "0xAbbcD9A203f2Ca423777dFbb915cb3fC66dCe5B8"
  tokenId: "1306495467(BigNumber)"
  tokenInfo: "[\"noncegeeker\", \"buidler\" * 3, \"writer\" * 2]"
  */
function Nft({ nft, blockExplorer, writeContracts}) {
  const badgeNames = ['noncegeeker', 'learner', 'workshoper', 'partner', 'buidler', 'writer', 'camper', 'puzzler'];
  const [edit, setEdit] = useState(false);
  const [badges, setBadges] = useState({});
  const [tokenInfo, setTokenInfo] = useState('');

  const parseTokenInfo = () => {
    if (tokenInfo === '') return;
    var badges_ = {};
    const tokenInfoArr = tokenInfo.substr(1, tokenInfo.length - 2).split(', ');
    for (let i = 0; i < tokenInfoArr.length; i++) {
      const badgeName = tokenInfoArr[i].split(' * ')[0];
      var badgeCount = '1';
      if (tokenInfoArr[i].split(' * ').length === 2) {
        badgeCount = tokenInfoArr[i].split(' * ')[1];
      }
      badges_[badgeName] = badgeCount;
    }
    // console.log('badges: ', badges_);
    setBadges(badges_);
  }

  const formatTokenInfo = () => {
    if (Object.keys(badges).length === 0) return;
    var tokenInfo_ = '[';
    for (let badgeName in badges) {
      if (badges[badgeName] === '1') {
        tokenInfo_ += `"${badgeName}", `;
      } else {
        tokenInfo_ += `"${badgeName} * ${badges[badgeName]}", `;
      }
    }
    tokenInfo_ = tokenInfo_.substr(0, tokenInfo_.length - 2) + ']';
    setTokenInfo(tokenInfo_);
  }

  const handleBadges = () => {
    console.log('handleBadges', nft, badges, tokenInfo);
    setEdit(true);
  }

  const addBadges = async () => {
  }

  const removeBadges = () => {
  }

  const confirmBadges = () => {
  }

  useEffect(() => {
    if (!nft) return;
    setTokenInfo(nft.tokenInfo);
    parseTokenInfo();
  }, [nft]);

  const addBadgesMenu = (
    <Menu>
      {
        badgeNames.map((badgeName, i) => {
          return (
            <Menu.Item key={badgeName}>
              <Button type="link" onClick={() => {
                setBadges(badges => {
                  if (badgeName in badges) {
                    let count = parseInt(badges[badgeName]);
                    count++;
                    badges[badgeName] = count.toString();
                  } else {
                    badges[badgeName] = '1';
                  }
                  return badges;
                });
                formatTokenInfo();
              }}>
                {badgeName}
              </Button>
            </Menu.Item>
          );
        })
      }
    </Menu>
  );

  const removeBadgesMenu = (
    <Menu>
      {
        Object.keys(badges).map((badgeName, i) => {
          return (
            <Menu.Item key={badgeName}>
              <Button type="link" onClick={() => {
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
              }}>
                {badgeName}
              </Button>
            </Menu.Item>
          );
        })
      }
    </Menu>
  );

  return (
    <div>
      <Item onClick={handleBadges}>
        <Item.Meta
          // avatar={<Avatar size="small" src={nft.image} />}
          title={
            <div>
            <a href={nft.description}>{nft.name + " owner: "}</a>
            <Address value={nft.owner} blockExplorer={blockExplorer} />}
            </div>
          }
          description={<img src={nft.image} width='200' height='200' />}
        />
      </Item>
      {/* <Card
        // hoverable
        // style={{ width: 240 }}
        cover={<img src={nft.image} width='200' height='200' />}
      >
        <Meta
          title={<div>
            <a href={nft.description}>{nft.name + "owner: "}</a>
            <Address value={nft.owner} blockExplorer={blockExplorer} />
          </div>}
          // description=
        />
      </Card> */}
      <Modal
        title="Badges"
        visible={edit}
        onCancel={() => setEdit(false)}
        onOk={confirmBadges}
        destroyOnClose={true}
      >
        <Dropdown
          overlay={addBadgesMenu}
        >
          <Button type="primary">Add</Button>
        </Dropdown>
        &nbsp;
        <Dropdown
          overlay={removeBadgesMenu}
        >
          <Button type="primary">Remove</Button>
        </Dropdown>
        {/* <Button type="primary" onClick={addBadges}>add</Button>
        &nbsp;
        <Button type="primary" onClick={removeBadges}>remove</Button> */}
        &nbsp;
        &nbsp;
        &nbsp;
        <span>badges: {tokenInfo}</span>
        {/* <Button type="confirm" onClick={confirmBadges}>confirm</Button> */}
      </Modal>
    </div>
  );
}

export default Nft;