const contractAddress = "0x23Fd3fA2A87Aa61Be53C6c87418D41417B5F70c1";
const contractABI = [
  {
    inputs: [],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum RockPaperScissors.Outcome",
        name: "outcome",
        type: "uint8",
      },
    ],
    name: "GameCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bet",
        type: "uint256",
      },
    ],
    name: "GameCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum RockPaperScissors.Choice",
        name: "choice",
        type: "uint8",
      },
    ],
    name: "createGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositBalance",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "games",
    outputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bet",
        type: "uint256",
      },
      {
        internalType: "enum RockPaperScissors.Choice",
        name: "playerChoice",
        type: "uint8",
      },
      {
        internalType: "enum RockPaperScissors.Choice",
        name: "botChoice",
        type: "uint8",
      },
      {
        internalType: "enum RockPaperScissors.Outcome",
        name: "outcome",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "completed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "_randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "s_requests",
    outputs: [
      {
        internalType: "uint256",
        name: "paid",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const provider = new ethers.providers.Web3Provider(window.ethereum, 97);
let signer;
let contract;

const event = "createGame";

function connectWallet() {
  provider.send("eth_requestAccounts", []).then(() => {
    provider.listAccounts().then((accounts) => {
      signer = provider.getSigner(accounts[0]);

      contract = new ethers.Contract(contractAddress, contractABI, signer);
    });
  });
  document.querySelector(".connect-wallet").style.display = "none";
}

window.onload = () => {
  const buttons = document.querySelectorAll(".choice-buttons");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach((button) => {
        button.classList.remove("choice-active");
      });
      this.classList.add("choice-active");
    });
  });
};

function showLastGame() {
  document.querySelector(".popup-container").style.display = "block";
}

function closePopup() {
  document.querySelector(".popup-container").style.display = "none";
}

function choiceToNum(choice) {
  switch (choice) {
    case "Rock":
      return 1;
    case "Paper":
      return 2;
    case "Scissors":
      return 3;
    default:
      return "None";
  }
}

function choiceToString(choice) {
  switch (choice) {
    case 1:
      return "Rock";
    case 2:
      return "Paper";
    case 3:
      return "Scissors";
    default:
      return "None";
  }
}

function outcomeToString(outcome) {
  switch (outcome) {
    case 0:
      return "Tie";
    case 1:
      return "You win 🎉";
    case 2:
      return "You lose 😥";
    default:
      return "None";
  }
}

async function gameCreate() {
  try {
    const activeChoice = document.querySelector(".choice-active");
    const choice = activeChoice ? choiceToNum(activeChoice.innerText) : null;
    const betInEth = document.querySelector(".bet").value;

    if (!choice) throw new Error("Choose your weapon!");
    if (!betInEth) throw new Error("Set your bet!");

    const betInWei = ethers.utils.parseEther(betInEth.toString());

    await contract.createGame(choice, { value: betInWei });
    await contract.on("GameCreated", async (gameId) => {
      const result = await contract.games(gameId.toString());
      const [player, bet, playerChoice, botChoice, outcome, completed] = result;
      await resultTable(bet, playerChoice, botChoice, outcome);
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function resultTable(bet, playerChoice, botChoice, outcome) {
  const tableBody = document.getElementById("statistics-data");
  let tableHTML = `
        <tr>
            <td>${ethers.utils.formatEther(bet.toString())}</td>
            <td>${choiceToString(playerChoice)}</td>
            <td>${choiceToString(botChoice)}</td>
            <td>${outcomeToString(outcome)}</td>
        </tr>
        `;

  tableBody.innerHTML = tableHTML;
  document.querySelector(".popup-container").style.display = "block";
}
