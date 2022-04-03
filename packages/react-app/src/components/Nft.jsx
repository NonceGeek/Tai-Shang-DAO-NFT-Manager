import { Button, Modal, List, Form, Space, Card } from 'antd';
import { useState } from 'react';
import Address from './Address';
const Item = List.Item;
const { Meta } = Card;

function Nft({ nft, blockExplorer }) {
  const badgeNames = ['noncegeeker', 'learner', 'workshoper', 'partner', 'buidler', 'writer', 'camper', 'puzzler'];
  const [edit, setEdit] = useState(false);

  const handleBadges = () => {
    console.log('handleBadges');
    setEdit(true);
  }

  const addBadges = async () => {

  }

  const removeBadges = () => {

  }

  const confirmBadges = () => {

  }

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
      >
        <Button type="primary" onClick={addBadges}>add</Button>
        &nbsp;
        <Button type="primary" onClick={removeBadges}>remove</Button>
        {/* <Button type="confirm" onClick={confirmBadges}>confirm</Button> */}
      </Modal>
    </div>
  );
}

export default Nft;