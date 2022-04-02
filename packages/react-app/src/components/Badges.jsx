import { Button } from 'antd';

function Badges({ nft }) {
  const badgeNames = ['noncegeeker', 'learner', 'workshoper', 'partner', 'buidler', 'writer', 'camper', 'puzzler'];

  const addBadges = async () => {

  }

  const removeBadges = () => {

  }

  const confirmBadges = () => {

  }

  return (
    <div>
        <Button type="primary" onClick={addBadges}>add</Button>
        <Button type="primary" onClick={removeBadges}>remove</Button>
        <Button type="confirm" onClick={confirmBadges}>confirm</Button>
        <></>
    </div>
  );
}

export default Badges;