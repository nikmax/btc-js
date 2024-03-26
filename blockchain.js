
class Transaction{
	constructor(fromAddress = null,toAddress = null, amount = 0){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block{
	constructor(data){
		this.lastHash = '';
		this.time = Date.now();
		this.data = data;
		this.nonce = 0;
		this.hash = this.calculateHash();
	}

	calculateHash(){
		return sha256(this.nonce + this.lastHash + this.time + JSON.stringify(this.data));
	}

	async mine(difficulty){
			while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
				this.nonce++;
				this.hash = this.calculateHash();
				await new Promise(resolve => setTimeout(resolve,0));
			}
	}


}

class Blockchain{
	constructor(){
		this.difficulty =2;
		this.miningReward = 50;
		this.mempool = [];
		this.chain = [];
		if(!localStorage.chain){
			this.chain = [new Block("GenesisBlock")];
			localStorage.setItem('chain', JSON.stringify(this.chain));
			localStorage.setItem('log','');
			log('Genesis block #0 created');
			log(this,1);
		}else{
			log('');
			let c = JSON.parse(localStorage.chain);
			c.forEach( (b,i) => {
				let block = new Block(b.data);
				block.lastHash = b.lastHash;
				block.time = b.time;
				block.nonce = b.nonce;
				block.hash = b.hash;
				this.chain.push(block);
			});
		}
		this.isChainValid();
	}

	getLatestBlock(){
		return this.chain[this.chain.length - 1];
	}

	pushMempool(transaction){
		this.mempool.push(transaction);
		log(this,1);
	}
	getMempool(){
		// one transaction per mining
		let mempool=[];
		if(this.mempool.length !== 0) mempool.push(this.mempool[0]);
		return mempool;
	}

	addBlock(block){
		if(!this.isChainValid()) {
			log('chain is invalid!');
			return false;
		}
		if(block.lastHash == this.getLatestBlock().hash){
			this.chain.push(block);
			block.data.forEach((trans)=>{
				let a= this.mempool.find((t,i) =>{
					return t == trans && this.mempool.splice(i,1);
				});
			});
			if(!this.isChainValid()) {
				log('chain is invalid!');
				return false;
			}	
			log(this,1);
			localStorage.setItem('chain', JSON.stringify(this.chain));
			return true;
		}else{
			return false;
		}
	}

	isChainValid(){

		let invalidBlock = false;
		const blocks = document.getElementById('blocks');
		blocks.innerHTML = '<h2>Blöcke</h2>';
		this.chain.forEach((currBlock, i) => {
			let prevBlock = this.chain[i - 1];
			const div = document.createElement('div');
			div.classList.add('card');
			div.classList.add('mb-16');
			
			if(prevBlock && prevBlock.calculateHash() !== currBlock.lastHash){
				invalidBlock = true;
				//currBlock.lastHash = prevBlock.calculateHash()
			}
			if(invalidBlock) div.style.background ='#361a2e';
			const date = new Date(currBlock.time);
			let t = ('0' + date.getHours()).slice(-2);
			t += ':' + ('0' + date.getMinutes()).slice(-2);
			t += ':' + ("0" + date.getSeconds()).slice(-2);

			div.innerHTML =      'Block # ' + i;
			div.innerHTML += '<br> Prev : ' + (currBlock.lastHash).slice(0,eval(this.difficulty+10)) + '...';
			div.innerHTML += '<br> Hash : ' + (currBlock.hash).slice(0,eval(this.difficulty+10)) + '...';
			div.innerHTML += '<br>Nonce : ' + currBlock.nonce;
			div.innerHTML += '<br> Time : ' + t;

			div.setAttribute('data',i);
			div.style.cursor = 'pointer';
			div.addEventListener("click", showBlock);
			blocks.appendChild(div);
		});

		return !invalidBlock;
	}

	getBalanceOfAddress(address){
		let balance = 0;

		for(const block of this.chain){
			for(const trans of block.data){
				if(trans.fromAddress === address) balance -= (trans.amount);
				if(trans.toAddress === address) balance += trans.amount;
			}
		}

		return balance;
	}

	async minePendingTransactions(miner,callback){
		if(this.isChainValid()) {
			let mempool = this.getMempool();
			mempool.push(new Transaction(null, miner, this.miningReward));
			let block = new Block(mempool);
			block.lastHash = this.getLatestBlock().hash;

			log("start block mining");

			await block.mine(this.difficulty);
			if(this.addBlock(block)){
				log('New block #' + (this.chain.length -1) + ' : ' + (block.hash).slice(0,eval(this.difficulty+5)) + '...');
			} else {
				log('Block from ' + miner + ' returned!');	
			}
		}else{
			log('chain is invalid!');
		}
		callback();
	}
}

function log(msg='',type=0){
		let m = document.getElementById("mempool");
		let l = document.getElementById("logs");
		let txt = '';
		if(msg == '') {
			l.innerHTML = localStorage.log;
			return;
		}
		switch (type){
			case 0: // print log msg
				txt = dt(Date.now()) + " " + msg;
				txt += "<br><hr>\n" + l.innerHTML;
				localStorage.log  = txt;
				l.innerHTML = txt;
			break;
			case 1:// update pending transactions list
				msg.mempool.find((trans, i) => {
					txt += '<hr><div class="card mb-16">';
					txt += trans.fromAddress +' > ';
					txt += trans.toAddress +' # ';
					txt += trans.amount + '</div>';
				});
				if(!txt) txt = '<div class="card mb-16">keine Transaktionen</div>';
				m.innerHTML = txt;
				break;
			default:
				break;
		}
	}

function dt (d) {
	const date = new Date(d);
	let t = "<i>";
	t += ('0' + date.getHours()).slice(-2);
	t += ':' + ('0' + date.getMinutes()).slice(-2);
	t += ':' + ("0" + date.getSeconds()).slice(-2) + "</i> ";
	return t;
}

function showBlock(){
	const i = this.getAttribute('data');
	const block = coin.chain[i];
	const date = new Date(block.time);
	let t = ('0' + date.getHours()).slice(-2);
	t += ':' + ('0' + date.getMinutes()).slice(-2);
	t += ':' + ("0" + date.getSeconds()).slice(-2);

	txt ='Prev&nbsp; : ' + block.lastHash;
	txt += '<br>Hash&nbsp; : ' + block.hash;
	txt += '<br>Nonce : ' + block.nonce;
	txt += '<br>Time&nbsp; : ' + t;
	txt += '<br>data : ' +JSON.stringify(block.data);

	popup.querySelector('.title').innerText = 'Block # ' + i;
	popup.querySelector('.body').innerHTML = txt;
	
	popup.classList.toggle('active');
}