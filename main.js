let coin = new Blockchain();

let ctx = document.getElementById('myChart');
const members = ['Anton', 'Nikita', 'Maxim', 'Andrej', 'Valentina'];

	let chart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: members,
			datasets: [{
				label: '# of Coins',
				data: [0, 0, 0, 0, 0, 0],
				backgroundColor: [
					'rgba(255,99,132,0.2)'
				],
				borderColor: [
					'rgba(54,162,235,0.5)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	});

function updateChart(){
	members.forEach((m,i)=>{
		chart.data.datasets[0].data[i] = coin.getBalanceOfAddress(m);
	});
	chart.update();
}

updateChart();

members.forEach(function(member) {
		const txt = document.createTextNode('Miner - ' + member);
		const div1 = document.createElement('div');
		const div2 = document.createElement('div');
		div1.classList.add('row');
		div1.classList.add('mb-16');
		div2.classList.add('play-btn');
		div2.classList.add('node');
		div2.setAttribute('data',member);
		div2.onclick = async function() {
			div2.classList.toggle('pause-btn');
			while (div2.classList.contains('pause-btn')){
				if(!coin.activeMiner.find( m => m == member)){
					coin.minePendingTransactions(member,()=>{
						//div2.classList.toggle('pause-btn');
						updateChart();						
					});
				}
				await new Promise(resolve => setTimeout(resolve,0));
			}
		};
		
		div1.appendChild(div2);
		div1.appendChild(txt);
		miners.appendChild(div1);
});

	members.forEach(function(member,i) {
		const div1 = document.createElement('option');
		div1.setAttribute('value',member);
		div1.innerText = member;
		const div2 = document.createElement('option');
		div2.setAttribute('value',member);
		div2.innerText = member;
		from.appendChild(div1);
		if(i == 1) div2.setAttribute('selected','selected');
		to.appendChild(div2);
	});

	toMempool.addEventListener('click', ()=>{
		const from = document.querySelector("select#from").value;
		const to = document.querySelector("select#to").value;
		const amount = parseInt(document.querySelector("input#amount").value);
		let balance = coin.getBalanceOfAddress(from);
		for(const trans of coin.mempool){
			if(trans.fromAddress === from) balance -= (trans.amount);
		}
		if(balance >= amount){
			const tx = new Transaction(from,to,amount);
			coin.pushMempool(tx);
		}else{
			log("invalid transaction: " + from + " has no enought equity");
		}
	});

