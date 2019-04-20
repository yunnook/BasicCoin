const express = require("express"),
 bodyParser = require("body-parser"),
 morgan = require("morgan"),
 BlockChain = require("./blockchain");
 P2P = require("./p2p");
 
const { getBlockChain, createNewBlock } = BlockChain;
const { startP2PServer, connectToPeers } = P2P;
const PORT = process.env.HTTP_PORT || 3000;
//port라는 이름의 environment variable을 찾아보고 못찾으면 port 300에서 시작하는거임.
//yarn으로 실행할때 environment variable을 셋팅할 수 있음.
//set HTTP_PORT=4000 일케

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));

//route 를 만드는거
//누군가 블록체인을 요청하면 현재의 블록채인을 getblockchain을 통해 리턴하는거
app.get("/blocks", (req,res) => {
    res.send(getBlockChain());
});       

//Post로 data 받아서 새로운 블록을 생성함.
app.post("/blocks", (req,res) => {
    const { body : {data} } = req;
    const newBlock = createNewBlock(data); // 새로운 블록 생성
    res.send(newBlock);
});

app.post("/peers", (req, res) => {
    const { body : { peer } } = req;
    connectToPeers(peer);
    res.send();
});


const server = app.listen(PORT, () =>
 console.log("BasicCoin Server running on",PORT)
 );

startP2PServer(server);
//HTTP 서버위에 webSocket 서버를 올렸음 같은 포트 사용하는거.
//express 위에 websocket을 올렸음.

