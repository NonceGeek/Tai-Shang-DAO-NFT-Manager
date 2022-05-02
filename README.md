# Tai-Shang-DAO-NFT-Manager
该分支使用TheGraph完成一部分查询功能，以下对TheGraph的使用做介绍

## TheGraph在实战中的使用（以项目https://github.com/WeLightProject/Tai-Shang-DAO-NFT-Manager 为例
<b>由于The Graph不支持Moonbeam链，所以实际上是重新将合约部署到了Rinkeby测试链上</b>
## 0x00、合约部署
### 0. 编写合约，这里直接用的[Web3Dev合约](https://moonbeam.moonscan.io/address/0xb6FC950C4bC9D1e4652CbEDaB748E8Cdcfe5655F#code)
根据以上合约源码，由于需要使用到`tokenInfo`（**且测试网不支持`trace`，即无法通过监听合约中函数的调用进行处理，这个bug我问了discord里面的管理员才发现的 /哭哭** ），因此增加了一个事件`event TokenInfoUpdated`，如下：
```Solidity
event TokenInfoUpdated(uint256 indexed tokenId, string tokenInfo); // added
function setTokenInfo(uint256 _tokenId, string memory _tokenInfo) public onlyOwner {
    tokenInfo[_tokenId] = _tokenInfo;
    emit TokenInfoUpdated(_tokenId, _tokenInfo); // added
}
```

### 1. 使用Remix连接到MetaMask以部署合约到Rinkeby测试网络上（需领水

![image](https://user-images.githubusercontent.com/61953384/163506767-9315ca69-a6ad-4682-9775-8ec3f33e55f1.png)

### 2. 之前已经部署过合约了，所以直接编译完合约加载之前的合约地址`0x7333170f6a95c5ac190cd3884ec381cf65f50603`就可以在Remix中调用了，部署也是同样的，部署时选择Web3Dev合约而不是其他

![image](https://user-images.githubusercontent.com/61953384/163506941-273dc841-2609-4691-be38-1f979377ac21.png)

### 3. 部署后保存一下合约地址以及ABI即可

## 0x01、新建子图，安装Graph Cli并部署子图
### 0. 去到TheGraph的[hosted-service官网](https://thegraph.com/hosted-service/dashboard)新建子图：
使用这个很方便，比官网的方便一点点，区别就是这个需要github登录，然后依次填写就行了

![image](https://user-images.githubusercontent.com/61953384/163588037-8187bc71-cbbd-4597-bac2-5269e67d3ab3.png)

### 1. 随后按照页面的流程安装The Graph的客户端
```bash
$ npm install -g @graphprotocol/graph-cli
# or
$ yarn global add @graphprotocol/graph-cli
```

### 2. 、初始化然后授权并部署子图
#### a. 先整一个新的分支然后切换过来
`$ git checkout -b feat/thegraph`
#### b. 进入`scaffold-eth`的`packages`目录并把`subgraph`目录删了，再把合约的ABI放到这个目录下`Web3Dev.json`
#### c. 初始化我的子图（需事先配置好`github`的`user.email` 和`user.name`
```bash
$ graph init --product hosted-service itherunder/tai_shang_dao_nft_manager
√ Protocol · `ethereum`
√ Subgraph slug · `itherunder/tai-shang-dao-nft-manager`
√ Directory to create the subgraph in · `subgraph`
√ Ethereum network · `rinkeby`
√ Contract address · 填刚刚部署合约的地址 `0x7333170f6a95c5ac190cd3884ec381cf65f50603`
√ ABI file (path) · 填合约ABI的路径 ./Web3Dev.json
√ Contract Name · `Web3Dev`
———
  Generate subgraph
  Write subgraph to directory
√ Create subgraph scaffold
√ Initialize networks config
√ Initialize subgraph repository
√ Install dependencies with yarn
√ Generate ABI and schema types with `yarn codegen`

Subgraph tai_shang_dao_nft_manager created in subgraph

Next steps:

  1. Run `graph auth` to authenticate with your deploy key.

  2. Type `cd subgraph` to enter the subgraph.

  3. Run `yarn deploy` to deploy the subgraph.
`
Make sure to visit the documentation on https://thegraph.com/docs/ for further information.
```
#### d. 修改`subgraph.yaml`配置文件
该配置文件用于设置
- 需要索引的合约
- 监听的事件/函数/区块
- 被调用的映射函数(`./src/mapping.ts`)等

自动生成的yaml配置文件如下：
```yaml
specVersion: 0.0.2
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: Web3Dev
    network: rinkeby
    source:
      address: "0xdfe343b32da3ef2dd7034400c6e133e28b9220bb"
      abi: Web3Dev
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.5
      language: wasm/assemblyscript
      entities:
        - Approval
        - ApprovalForAll
        - OwnershipTransferred
        - Transfer
      abis:
        - name: Web3Dev
          file: ./abis/Web3Dev.json
      eventHandlers:
        - event: Approval(indexed address,indexed address,indexed uint256)
          handler: handleApproval
        - event: ApprovalForAll(indexed address,indexed address,bool)
          handler: handleApprovalForAll
        - event: OwnershipTransferred(indexed address,indexed address)
          handler: handleOwnershipTransferred
        - event: Transfer(indexed address,indexed address,indexed uint256)
          handler: handleTransfer
      file: ./src/mapping.ts
```
本项目中仅使用Transfer事件以及setTokenInfo函数，因此修改以下内容（具体语法见[官方文档](https://thegraph.com/docs/zh/developer/create-subgraph-hosted/)）：
```yaml
entities:
  - Token
  - Transfered
abis:
  - name: Web3Dev
    file: ./abis/Web3Dev.json
eventHandlers:
  - event: Transfer(indexed address,indexed address,indexed uint256) # 监听Transfer事件
    handler: handleTransfer # 处理函数，在./src/mapping.ts中定义
  - event: TokenInfoUpdated(indexed uint256,string) # 监听TokenInfoUpdated事件
    handler: handlerTokenInfoUpdated
file: ./src/mapping.ts
```
#### e. 修改`schema.graphql`模式文件
该文件用于编写自己的模式（详见[官方文档](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md)）
自动生成的模式如下（其中!表示必须字段）：
```graphql
type ExampleEntity @entity {
  id: ID!
  count: BigInt!
  owner: Bytes! # address
  approved: Bytes! # address
}
```
本项目需要对Token以及Transfer事件进行查询，因此修改如下：
```graphql
type Token @entity {
  id: ID!
  owner: Bytes! # address
  tokenInfo: String # token badges
  createdAt: Int # block number
  modifiedAt: Int # block number
}

type Transfered @entity {
  id: ID!
  from: Bytes! # address
  to: Bytes! # address
}
```
#### f. 修改`mapping.ts`映射文件
该文件用于编写监听发生时的函数，即当`subgraph.yaml`中定义的事件或函数发生时应该执行的函数
自动生成的映射文件如下：
```typescript
import {
  Web3Dev,
  Transfer,
  TokenInfoUpdated,
} from "../generated/Web3Dev/Web3Dev";
import { Token, Transfered } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.params.tokenId.toString())
  let transfered = Transfered.load(event.params.tokenId.toString())

  if (!token) {
    token = new Token(event.params.tokenId.toString())
    token.tokenInfo = ""
    token.createdAt = event.block.number.toI32()
  }
  if (!transfered) {
    transfered = new Transfered(event.params.tokenId.toString())
  }

  token.owner = event.params.to
  token.modifiedAt = event.block.number.toI32()
  transfered.from = event.params.from
  transfered.to = event.params.to

  token.save()
  transfered.save()
}

export function handlerTokenInfoUpdated(event: TokenInfoUpdated): void {
  let token = Token.load(event.params.tokenId.toString())
  if (!token) {
    return
  }
  token.tokenInfo = event.params.tokenInfo
  token.modifiedAt = event.block.number.toI32()
  token.save()
}

```
本项目要对Transfer事件以及setTokenInfo函数进行监听处理，因此修改如下（如何编写详见[官方文档](https://thegraph.com/docs/define-a-subgraph#writing-mappings)）：
```typescript
import {
  Web3Dev,
  Transfer,
  TokenInfoUpdated,
} from "../generated/Web3Dev/Web3Dev";
import { Token, Transfered } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.params.tokenId.toHex())
  let transfered = Transfered.load(event.params.tokenId.toHex())

  if (!token) {
    token = new Token(event.params.tokenId.toHex())
    token.tokenInfo = ""
  }
  if (!transfered) {
    transfered = new Transfered(event.params.tokenId.toHex())
  }

  token.owner = event.params.to
  transfered.from = event.params.from
  transfered.to = event.params.to

  token.save()
  transfered.save()
}

export function handlerTokenInfoUpdated(event: TokenInfoUpdated): void {
  let token = Token.load(event.params.tokenId.toHex())
  if (!token) {
    return
  }
  token.tokenInfo = event.params.tokenInfo
  token.save()
}
```
#### g. 生成代码并部署子图（*修改了subgraph的subgraph.yaml、schema.graphql和mapping.ts之后都需要重新部署！*）
```bash
$ graph codegen # 生成代码
$ graph build # 编译子图，后面deploy也会编译，可以不用
$ graph auth --product hosted-service 4eeaa6...6069fe
$ graph deploy --product hosted-service itherunder/tai_shang_dao_nft_manager
  Skip migration: Bump mapping apiVersion from 0.0.1 to 0.0.2                                                   
  Skip migration: Bump mapping apiVersion from 0.0.2 to 0.0.3
  Skip migration: Bump mapping apiVersion from 0.0.3 to 0.0.4
  Skip migration: Bump mapping apiVersion from 0.0.4 to 0.0.5
  Skip migration: Bump mapping specVersion from 0.0.1 to 0.0.2
√ Apply migrations
√ Load subgraph from subgraph.yaml
  Compile data source: Web3Dev => build\Web3Dev\Web3Dev.wasm
√ Compile subgraph
  Copy schema file build\schema.graphql
  Write subgraph file build\Web3Dev\abis\Web3Dev.json
  Write subgraph manifest build\subgraph.yaml
√ Write compiled subgraph to build\
  Add file to IPFS build\schema.graphql
                .. QmQNywHVA8uK53askCN2EYSJTNeBKP16QustXXRGfMBSjC
  Add file to IPFS build\Web3Dev\abis\Web3Dev.json
                .. Qmern2p52J6fNyxSzwTZ1ncShyDFkEagMKMocDZLUY2AsL
  Add file to IPFS build\Web3Dev\Web3Dev.wasm
                .. QmNYfGFRGwCKE9s5827r1ncZxoow8bdPskccwcT5dbAv9k
√ Upload subgraph to IPFS

Build completed: QmNoiQ...tU6aGM

Deployed to https://thegraph.com/explorer/subgraph/itherunder/tai_shang_dao_nft_manager

Subgraph endpoints:
Queries (HTTP):     https://api.thegraph.com/subgraphs/name/itherunder/tai_shang_dao_nft_manager
Subscriptions (WS): wss://api.thegraph.com/subgraphs/name/itherunder/tai_shang_dao_nft_manager
```

## 0x02、测试是否能够正常`query`
进入刚刚的网页，下方已经有一个`playground`了，直接用样例来查询一下就可以了：
可以看到，已经可以正常地查询到数据了，包括`Token`信息以及`Transfered`信息

![image](https://user-images.githubusercontent.com/61953384/163588727-d4a62f33-3f08-4c2c-805c-11754f0ce155.png)

## 0x03、在项目中使用`TheGraph`的数据
### 1. 编写`query`语句（可查看[官方文档](https://thegraph.com/docs/zh/developer/graphql-api/#)
为了在页面展示nft的内容，我们需要获得`token`的信息，因此编写一下`query`（表示获取根据创建时间递减的前100个`token`的信息）：
```javascript
{query: `{tokens(first: 100, skip: 0, orderBy: createdAt, orderDirection: desc) {id tokenInfo owner createdAt modifiedAt}}`
```

### 2. 编写`query`代码
#### a. 首先，在部署好的`subgraph`获得`uri`：`https://api.thegraph.com/subgraphs/name/itherunder/tai_shang_dao_nft_manager`，并将其放到`react-app/src/constant.js`中：
```js
  rinkeby: {
    name: "rinkeby",
    color: "#e0d068",
    chainId: 4,
    rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
    subgraphUri: "https://api.thegraph.com/subgraphs/name/itherunder/tai_shang_dao_nft_manager",
  },
```
#### b. 在`react-app/src/views/Home.jsx`中添加以下代码：
```javascript
  const graphQLFetcher = async (graphQLParams) => {
    let res = await fetch(subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    });
    return res.json();
  }
```
#### c. 随后编写获取所有token的函数：
```javascript
  const getAllMintedNftsByGraph = async () => {
    setLoading(true);
    let res = await graphQLFetcher({query: `{tokens(first: 100, skip: 0, orderBy: createdAt, orderDirection: desc) {id tokenInfo owner createdAt modifiedAt}}`});
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
  }
```
#### d. 由于项目的合约中`tokenUri`是硬编码的，因此只能通过调用合约的函数查看`token`对应的`uri`：
```js
  const getTokenUri = async (tokens, token) => {
      let uri = await readContracts.Web3Dev.tokenURI(token.tokenId);
      // console.log(uri)//, atob(uri));
      let nft = JSON.parse(atob(uri.split(",")[1]));
      token = { ...token, ...nft };
      tokens.push(token);
  }
```

### 3. 运行`yarn start`查看效果：
可以看到，和之前全部使用调用合约中的函数效果是一致的。就这样吧，浅尝辄止，基于实战的The Graph使用指南就到这里

![image](https://user-images.githubusercontent.com/61953384/163661324-ce846798-753c-45d8-a53a-3706cea0f3c4.png)

