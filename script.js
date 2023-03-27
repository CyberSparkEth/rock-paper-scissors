const contractAddress = "0x23Fd3fA2A87Aa61Be53C6c87418D41417B5F70c1";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum RockPaperScissors.Outcome",
				"name": "outcome",
				"type": "uint8"
			}
		],
		"name": "GameCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bet",
				"type": "uint256"
			}
		],
		"name": "GameCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "choice",
				"type": "uint8"
			}
		],
		"name": "createGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "depositBalance",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "games",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bet",
				"type": "uint256"
			},
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "playerChoice",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "botChoice",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Outcome",
				"name": "outcome",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "_randomWords",
				"type": "uint256[]"
			}
		],
		"name": "rawFulfillRandomWords",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "s_requests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "paid",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "fulfilled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawBalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawLink",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

const provider = new ethers.providers.Web3Provider(window.ethereum, 97)//ChainID 97 BNBtestnet
let signer;
let contract;

const event = "createGame";

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then( (accounts) => {
        signer = provider.getSigner(accounts[0]); //account in metamask
        
        contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        )

    }
    )
}
)

function choiceToString(choice) {
    switch (choice) {
      case 1:
        return 'Rock 🗿';
      case 2:
        return 'Paper 📄';
      case 3:
        return 'Scissors ✂️';
      default:
        return 'None';
    }
  }

function outcomeToString(outcome) {
  switch (outcome) {
    case 0:
      return 'Tie';
    case 1:
      return 'You win 🎉';
    case 2:
      return 'You lose 😥';
    default:
      return 'None';
  }
}

async function gameCreate() {
    let choice = document.getElementById('choice').value;
    console.log(choice);
    let betInEth = document.getElementById('bet').value;
    let betInWei = ethers.utils.parseEther(betInEth.toString());
    console.log(betInWei);
    
    await contract.createGame(choice, {value: betInWei});
    await contract.on('GameCreated', (gameId) => {
        contract.games(gameId.toString()).then(result => {
            const [player, bet, playerChoice,
                 botChoice, outcome, completed] = result;

    let resultLogs = `
    bet: ${ethers.utils.formatEther(bet.toString())} BNB,
    player choice: ${choiceToString(playerChoice)},
    bot choice: ${choiceToString(botChoice)},
    result: ${outcomeToString(outcome)}`

    alert(resultLogs)
    });
    
    });
}