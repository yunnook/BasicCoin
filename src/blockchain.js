const CryptoJS = require("crypto-js");
const hexToBinary = require("hex-to-binary");
class Block{
    constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data; //여기에 transaction을 저장함(가상화폐에서).
    }
}

//ES2015에 추가된 변수타입 const, let
//const는 c++의 const와 동일한 개념임

const genesisblock = new Block(
    0,
    "5FECEB66FFC86F38D952786C6D696C79C2DBC239DD4E91B46729D73A27FB57E9", // 0에 대한 hash 값
    null,
    1555759031737,//console 창에서 현재 시간 구함 new Date().getTime() -> 1555759031737
    "this is genesis",
    0,
    0
    );

let blockchain = [genesisblock];

console.log(blockchain);

const getLastBlock = () => blockchain[blockchain.length - 1];
/* 위에 getLastBlock은 ES6에 추가된 arrow function을 사용한거
   기존에는 아래와 같이 사용함. paramter를 추가할려면 () 이거 지우고 넣으면 됨.
function getLastBlock(){
    return blockchain[blockchain.length - 1];
}
*/

const getTimeStamp = () => new Date().getTime( )/ 1000;

const getBlockChain = () => blockchain;

const createHash = (index,previousHash,timestamp,data, difficulty, nonce) => 
    CryptoJS.SHA256(
        index + previousHash + timestamp + JSON.stringify(data)//data를 string으로 바꿔주는거 int나 이런것도 TODO: .toString이랑 뭐가 다름?
    ).toString();


const createNewBlock = data => {
    const previousBlock = getLastBlock();
    const newBlockIndex = previousBlock.index + 1;
    const newTimeStamp = getTimeStamp()
    //const newHash = createHash(newBlockIndex, previousBlock.hash, newTimeStamp, data);
    console.log(newHash);
    const newBlock = new findBlock(
        newBlockIndex,
        previousBlock.hash,
        newTimeStamp,
        data,
        5
    );
    addBlockToChain(newBlock);
    require("./p2p").broadcastNewBlock(); // 블록 생성하면 브로드캐스팅해서 알려주는거임.
    return newBlock;
};
// 여기까지 새로운 블록을 생성하는거고 블록채인 안에서 블록이 생성되는거는 아님.

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    while(true){
        const hash = createHash{
            index,
            previousHash,
            timestamp,
            data,
            difficulty,
            nonce
        };
        //to do: check amount of zeros(hashMatchesDifficulty)
        if(){

        }else{
            nonce++;
        }
    }
};

const hashMatchesDifficulty = (hash,difficulty) =>{
    const hashInBinary = hexToBinary(hash);
    const requiredZeros = "0".repeat(difficulty);
}

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

//새로 추가되는 블록의 값들이 유효한 값들인지 확인하는 함수임
const isBlockValid = (candidateBlock, latestBlock) => {
    if(!isBlockStructureValid(candidateBlock)){
        console.log("The candidate block structure is not valid");
        return false;
    }else if(latestBlock.index + 1 !== candidateBlock.index){
        console.log('The candidate block doesnt have a valid index');
        return false;
    }else if(latestBlock.hash !== candidateBlock.previousHash){
        console.log(
            "The previousHash of the candidate bloock is not the hash of the latest block"
        );
        return false;
    }else if(getBlockHash(candidateBlock) !== candidateBlock.hash){
        console.log("The hash of this block is invalid");
        return false;
    }
    return true;
};

// 블록의 구조가 유효한지 확인하는거
//TODO: // === 이거의 의미를 확인해야함
const isBlockStructureValid = block => {
    return (
        typeof block.index === "number" &&
        typeof block.hash === "string" &&
        typeof block.previousHash === "string" &&
        typeof block.timestamp === "number" &&
        typeof block.data === "string"
    );
};

    //console 창에서 현재 시간 구함 new Date().getTime() -> 1555759031737

//block chain이 유효한가 더 긴 채인인가를 확인하는 거
const isChainValid = (candidateChain) => {
    const isGenesisValid = block =>{
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if(!isGenesisValid(candidateChain[0])){
        console.log("The candidateChains's genesisBlock is not the smae as our genesisBlock");
        return false;
    }
    for(let i = 1; i < candidateChain.length; i++){ // genesis 빼고 검증하기 위해서 1부터 시작함.
        if(!isBlockValid(candidateChain[i], candidateChain[i-1])) // 가장 최근의 블록과 바로 그직전 블록을 가져와서 검증함
        {
            return false;
        }
    }
    return true;
};



//만약 블록채인이 휴효하다며 교채하는 기능
// 새로운 채인이 우리 채인보다 길다면 교채함.
//즉 블록검증, 제네시스 블록검증, 채인이 유효하고, 채인 길이가 길면 교채한다는 것
// 새로운 block을 candidateBlock이라 한거처럼 새로운 chain도 candidate chain이라고 표기했음.
const replaceChain = candidateChain => {
    if(isChainValid(candidateChain) && candidateChain.length > getBlockChain().length){
        blockchain = candidateChain;
        return true;
    } else {
        return false;
    }
};

// 채인을 교체할떄 쓰는 기능
const addBlockToChain = candidateBlock => {
    if(isBlockValid(candidateBlock, getLastBlock())){
        getBlockChain().push(candidateBlock);
        return true;
    }else{
        return false;
    }
};

//서버를 생성하기위해 export 하는거
module.exports = {
    getBlockChain,
    createNewBlock,
    getLastBlock,
    isBlockStructureValid,
    addBlockToChain,
    replaceChain
};