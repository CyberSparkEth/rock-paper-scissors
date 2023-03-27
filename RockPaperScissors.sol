// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

contract RockPaperScissors is VRFV2WrapperConsumerBase {
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    address owner;

    enum Choice {
        None,
        Rock,
        Paper,
        Scissors
    }
    enum Outcome {
        Tie,
        PlayerWins,
        BotWins
    }

    event GameCreated(uint256 gameId, address player, uint256 bet);
    event GameCompleted(uint256 gameId, Outcome outcome);

    struct RequestStatus {
        uint256 paid;
        bool fulfilled;
        uint256[] randomWords;
    }

    struct Game {
        address player;
        uint256 bet;
        Choice playerChoice;
        Choice botChoice;
        Outcome outcome;
        bool completed;
    }

    mapping(address => uint256) public balances;
    mapping(uint256 => Game) public games;
    mapping(uint256 => RequestStatus) public s_requests;

    uint32 callbackGasLimit = 400000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    address linkAddress = 0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06;
    address wrapperAddress = 0x699d428ee890d55D56d5FC6e26290f3247A762bd;

    constructor()
        payable
        VRFV2WrapperConsumerBase(linkAddress, wrapperAddress)
    {
        owner = msg.sender;
    }

    function createGame(Choice choice) public payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(choice != Choice.None, "Invalid choice");
        uint256 gameId = requestRandomness(
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
        games[gameId] = Game(
            msg.sender,
            msg.value,
            Choice.None,
            Choice.None,
            Outcome.Tie,
            false
        );
        games[gameId].playerChoice = choice;
        Choice botChoice = Choice((uint256(gameId) % 3) + 1);
        games[gameId].botChoice = botChoice;
        completeGame(gameId);
        emit GameCreated(gameId, msg.sender, msg.value);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].paid > 0, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
    }

    function completeGame(uint256 gameId) internal {
        require(gameId != 0, "Game ID not found");
        Game storage game = games[gameId];
        require(!game.completed, "Game is already completed");

        if (game.playerChoice == game.botChoice) {
            game.outcome = Outcome.Tie;
            payable(msg.sender).transfer(game.bet);
        } else if (
            (game.playerChoice == Choice.Rock &&
                game.botChoice == Choice.Scissors) ||
            (game.playerChoice == Choice.Paper &&
                game.botChoice == Choice.Rock) ||
            (game.playerChoice == Choice.Scissors &&
                game.botChoice == Choice.Paper)
        ) {
            game.outcome = Outcome.PlayerWins;
            payable(msg.sender).transfer(game.bet * 2);
        } else {
            game.outcome = Outcome.BotWins;
        }

        game.completed = true;
        emit GameCompleted(gameId, game.outcome);
    }

    function depositBalance() public payable {
        balances[address(this)] += msg.value;
    }

    function withdrawBalance() public onlyOwner {
        require(address(this).balance > 0, "Insufficient balance");
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
