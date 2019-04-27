const  CryptoJS = reequire("crypto-js");
  elliptic = require("elliptic");

const ec = new elliptic.ec("secp256k1");

const COINBASE_AMOUNT = 50;//비트코인은 시간이 지나감에 따라 반으로 줄임

class TxOut{
    constructor(address, amount){
        this.address = address;
        this.amount = amount;
    }
}

class TxIn{
    // uTxOutId 2
    // uTxOutIndex 1
    // Signature

}

class Transaction{
    // ID
    // txIns{5, 5}
    // txOuts{10}
}

class uTxOut{
    constructor(txOutId, txOutIndex, address, amount){
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

//unspent 트랜잭션 아웃풋을다 넣어야함
const uTxOuts = [];


const getTxId = tx =>{ //모든 input을 가지고오고 싶다
    const txInsContent = tx.txIns
      .map(txIn => txIn.uTxOutId = txIn.uTxOutIndex)
      .reduce((a, b) => a + b,"");// [uTxoutId+uTxoutIndex] 일케만들어짐//transaction input content//모든 input을 가지고오고 싶다
      // a+b혹은 a-b 할수있음.

    const txOutContent = tx.txOuts
      .map(txOut => txOut.address + txOut.amount)
      .reduce((a,b) => a + b,""); // [adress+amout+adress+amout...]인  스트링임.
      return CryptoJS.SHA256(txInsContent + txOutContent).toString();
};

const findUTxOut = (uTxOutId, uTxOutIndex, uTxOutList) => {
    return uTxOutList.find(uTxOut => uTxOut.txOutId === txOutId && uTxOut.txOutIndex == txOutIndex);
}

//id를 사인해야함 그전에 트랜잭션 인풋을 찾아야하고, 그다음에 트랜젝션 아웃풋을 찾아야함. 왜냐하면 인풋이 인용하고잇는 값이기때문
const signTxIn = (tx, txInIndex, privateKey, uTxOut) => {
    const txIn = tx.txIns[txIndex];
    const dataToSign = tx.id; // txid임
    //To Do: Find Tx
    // 우리의 transaction input이 레퍼런스하는 unspent transaction이 유효한것을 알면 사인을 함.
    const referencedUTxOut = findUTxOut(txIn.txOutId, tx.txOutIndex, uTxOuts); // utxOutList에서 utxOut을 찾는거임
    if(referencedUTxOut == null){ //쓸돈이 없다는거
        return;
    }
    const key = ec.keyFromPrivate(privateKey, "hex");
    const Signature = utils.toHexStirng(key.sign(dataToSign).toDER()); //인풋이 존재하고 유요한 것을 안 후에, 그 후에 트랜젝션 id를 사인할거임.
    return Signature;
};

//uTxoutput이 가지고잇는 돈임
//만약 내가 인풋 50이 있고, 너에게 50을 주고 싶다면, 이뜻은 내가 2개의 아웃풋이 있다는거임 하나는 0, 하나는 50.
//이때 나의 transaction output을 비워줘여하는거
// transacting output을 가져와서 uTxout을 만들어주는거임.
const updateUTxOuts = (newTxs,uTxoutList) => {
    const newUTxOuts = newTxs.map(tx => {
        tx.txOuts.map(
            (txOut,index) =>{
                new uTxOut(tx.id, index, txOut.address, txOut.amount);
            });
    }).reduce((a,b) => a.contact(b), []);
    
    const spentTxOuts = newTxs // txinput에서 사용된 txOut을 지움
    .map(tx => tx.txins)
    .reduce((a,b) => a.contact(b),[])
    .map(txIn => new uTxOut(txIn, txOutId,txIn.txOutIndex,"",0 ));  //트랜젝션 인풋으로 사용된 트랜젝션 아웃풋을 가져다가 다 비워버려야함.

    const resultingUTxOuts = uTxoutList
    .filter(uTxO => !findUTxOut(uTxO.txOutId, uTxO.txOutIndex, spentTxOuts))
    .concat(mewUTxOuts);
    
    return resultingUTxOuts;
};

/*
[A(40),B,C,D,E,F,G]  //uTxOutList가 있다고 가정하자
A(40) --->TRANSCATION -------> ZZ(10) //준거
                      -------> MM(30) //이게 나임
// newUtxOuts 가져다가 새로 나온 2개를 넣어준거임.
// 그리고 uTXOutList에서 기존에 있던 A를 지우고 ZZ,MM을 넣어주면 됨.
*/

const isTxInStructureValid = (txIn) => {
    //To Do 
    if(txIn ===null){
        return false;
    }else if(typeof txIn.Signature !== "string"){
        return false;
    }else if(typeof txIn.txOutId !== "number"){ //Hash 임.
        return false;
    }else if (typeof txIn.txOutIndex !== "number"){
        return false;
    }else{
        return true;
    }
}

const isAddressValid = (address) => { //address가 public key임. HEX임.
    if(address.length !== 300){ //public key는 길이가 300임.
        return 
    }else{
        return true;
    }
}

const isTxOutStructureValid = (txOut) => {
    if(txOut === null){
        return false;
    }else if(typeof txOut.address !== "string"){
        return false;
    }else if(!isAddressValid(txOut.address)){
        return false;
    }else if(typeof txOut.amount !== "number"){
        return false;
    }else{
        return true;
    }
}

const isTxStructureValid = (tx) => {
    if(typeof tx.id !== "string"){
        console.log("Tx ID is not valid");
        return false;
    }else if(!(tx.txIns instanceof Array)){
        console.log("The txIns are not an array");
        return false;
    }else if(!tx.txIns.map(isTxInStructureValid).reduce((a,b) => a&b, true)){
        console.log("the structure of one of the txIn is not valid");
        return false;
    }else if(!tx.txOuts instanceof Array){
        console.log("The txOuts are not an array");
        return false;
    }else if(!tx.txOut.map(isTxOutStructureValid).reduce((a,b) => a && b, true)
    ){
        console.log("the structure of one of the txIn is not valid");
        return false;
    }else {
        return true;
    }
}
/*
[true, true, false, true , false].reduce((a,b) a)

true $$ true => true

true && true => true
*/

const validateTxin = (txIn, tx, uTxOutList) =>{
    const wantedTxOut =uTxOutList.find(uTxOut => uTxOut.txOutId === txIn.txOutId && uTxOut.txOutIndex === txIn.txOutIndex);
    if(wantedTxOut === null){
        return false; // 인풋이 레퍼런스하는 uTxOut이 없다는 뜻
    }else{
        const address = wantedTxOut.address;
        const key = ec.keyFromPrivate(address, "hex");
        return key.verify(tx.id, txin.signature); // 트렌젝션 아이디는 돈을 사용할 사람에 의하여 사인되었음을 체크하는거. 따라서 내가 주인이라는것을 알 수있다.
                                                  //내가 트렌젝션 인풋을 사인할 수있고, 나의 주소가 트랜젝션 iD로 사인을 증멸할 수잇음.
    }                                          
}

const getAmountInTxIn = (txIn, uTxOutList) => findUTxOut(txIn.txOutId, txIn.txOutIndex, uTxOutList).amount; //output에 있는 amount랑 똑같기 때문에 가져다가 씀

const validateTx = (tx, uTxOutList) => {
    if(getTxId(tx) !== tx.id){
        return false;
    }


    const hasValidTxIns = tx.txIns.map(txIn => validateTxin(txIn, tx, uTxOutList)); //valid한 txInput을 가지고 있는 경우. // Tosdo

    if(!hasValidTxIns){
        return false;
    }

    const amountInTxIns = tx.txIns
       .map(txIn => getAmountInTxIn(txIn, uTxOutList))
       .reduce((a,b) => a + b, 0);

    const amountInTxOuts = tx.txOuts.map(txOut => txOut.amout).reduce((a,b) => a + b, 0);// todo

    if(amountInTxIns !== amountInTxOuts){ //인풋값이랑 아웃풋값은 항상 같아야함.
        return false;
    }else{
        return true;
    }
};

//채굴해서 얻는 코인은 inTx는 없고 outTx만 있음.
//첨번은 트랜젝션 생성 안햇고 그냥 검증하는 거임.

const validateCoinbaseTx = (tx, blockIndex) => {
    
}