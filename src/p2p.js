const WebSockets = require("ws");
  Blockchain = require("./blockchain");
  

const {getLastBlock, isBlockStructureValid, addBlockToChain, replaceChain, getBlockchain} = Blockchain;

const sockets = [];

//Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_REPONSE = "BLOCKCHAIN_RESPONSE";

// Message Creators
const getLatest = () => {
    return {
        type: GET_LATEST,
        data: null
    };
};

const getAll = () => {
    return {
        type: GET_ALL,
        data: null
    };
};

//여기 블록체인 리스폰스에 데이타를 리턴함. 소켓에게 어떻게 메시지를 관리하는지 알아줘여 함.
const blockchainResponse = data => {
    return {
        type:BLOCKCHAIN_REPONSE,
        data
    };
};

const getSockets = () => sockets;

const startP2PServer = server =>{
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        console.log(`Hello ${ws}`);
        initSocketConnection(ws); //연결을 한 socket도 연결대상 socket에 대하여 똑같은 작업.
    });
    console.log(`BasicCoin P2P Server Running!`);
};
//누군가가 접할때 이렇게 되는거고 startP2Pserver를 export 시키는 거임.

const initSocketConnection = ws => {
    sockets.push(ws); //연결된 곳에 sockets을 추가하기 위해서 array에
    handleSocketError(ws);
    handleSocketMessage(ws);
    sendMessage(ws,getLatest()); // 접속하면 가장 최근 블록을 보내게 되는거임. 둘이 서로에게. 이떄 누구를 교체해야하는지 확인해야함.
    socket.on("message", (data) => {
        console.log(data);
    });
    setTimeout(() => { ws.send("welcome");
}, 5000);
}; // 새로운 소켓이 나에게 연결될때마다 불릴꺼임.

const parseData = data => {
    try{
        return JSON.parse(data); //받은 데이터를 JSON으로 parsing가능한지 체크하는거
    }catch(e){
        console.log(e);
        return null;
    }
}


const handleSocketMessage = ws =>{
    ws.on("message", data => {
        const message = parseData(data);
        if (message === null) {
            return;
        }
        console.log(message);
        switch(message.type){
            case GET_LATEST:
             sendMessage(ws, responseLatest()); // 가장 최근 블록을 보내는거
             break;
            case GET_ALL:
             sendMessage(ws, responseAll());
             send 
            case BLOCKCHAIN_REPONSE:
             const receivedBlocks = message.data;
             if(receivedBlocks === null){ 
                 break;
             }
             handleBlockchainResponse(receivedBlocks);
             break; 

        }
    });
    
};

const handleBlockchainResponse = receivedBlocks => {
    if(receivedBlocks.length === 0){
        console.log("received blocks have a length of 0");
        return;
    } //얻은 블록체인이 비어있는지 확인
    const latestBlockReceived = receivedBlocks[receivedBlocks.legnth-1]; //받은 블록중 가장 마지막 꺼
    if(!isBlockStructureValid(latestBlockReceived)){
        console.log("The block structure of the block received is not valid");
        return;
    }    
    const newstBlock = getLastBlock();
    if(latestBlockReceived.index > newstBlock.index){//노드의 가장최근블록이 블록체인보다 더 최신인지 확인
        if(newstBlock.hash ===latestBlockReceived.previosHash){//블록들을 가져왔는데 딱 한개만 앞서있음. 바로전 해쉬가 우리 블록 최신일아 같음.
            if(addBlockToChain(latestBlockReceived)){
                broadcastNewBlock();
            } 
        }else if(receivedBlocks.length ===1){ //우리가 가진게 블록 하나밖에 없음.
            //to do, get all the blocks, we are waaay behind
            // 모든 node에게 블록체인 달라고 메시지 보내야함
            sendMessageToAll(getAll()); //full blockchain을 얻을 수있음
        }else{
            replaceChain(receivedBlocks);
        }

    }
};

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const sendMessageToAll = message => sockets.forEach(ws => sendMessage(ws,message));

const responseLatest = () => blockchainResponse([getLastBlock()]); // 블록이 여러개일수 있으니 배열로

const responseAll = () => blockchainResponse(getBlockchain);

const broadcastNewBlock = () => sendMessageToAll(responseLatest())// 블록에 새로 추가하면 다른애들한태 boradcast해서 알려줌.

//p2p socket 연결에 관한 에러를 핸들링하기 위한거
const handleSocketError = ws => { //죽거나 뭔 에러있는 소켓을 가져옴
    const closeSocketConnection = ws => {
        ws.close(); //소켓 닫고 array에서 지움.
        sockets.splice(sockets.indexOf(ws), 1); //array에서 지움
    };
    ws.on("close", () => closeSocketConnection(ws));
    ws.on("error", () => closeSocketConnection(ws));
};

const connectToPeers = newPeer => {
    const ws = new WebSockets(newPeer); // 새로운 소켓을 만듬 (newPeer이랑 url로)
    ws.on("open", ()=> { //커넥션을 열때
        initSocketConnection(ws);
    });
};

module.exports = {
    startP2PServer,
    connectToPeers
};