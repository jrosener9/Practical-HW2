# Practical Homework 2: Programming in Solidity 

In this assignment you will learn to program smart contracts in Solidity.
### Learning Goals:
In this assignment you will learn..
1. The basic syntax and semantics of the Solidity language
2. Creating an application which accepts, holds, and transfers Ethereum
3. How to fork an Ethereum network
4. Navigating Hardhat framework

### Part 1 Instructions:
In this assignment you will write a smart contract, in Solidity, for an NFT auction. The auction will be for the course NFT you minted in the previous homework. 

1. Install Hardhat and create a project:
    - Overview of Hardhat and instructions here: https://hardhat.org/hardhat-runner/docs/getting-started#overview
    - Once you’re done, you should have a placeholder Lock project with the following directory structure:
        - ![Directory](https://web3-security-class.org/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F165f1ff1-d00e-4f18-b7c9-8b796c89e870%2FScreen_Shot_2022-08-31_at_11.26.24_PM.png?id=10ad4365-e8b4-4372-a5a9-0ace8c2bbb0e&table=block&spaceId=7cd12c89-e411-46e3-97a9-273e4b69dad1&width=320&userId=&cache=v2)

2. Replace the `Lock` placeholder files with our HW1 files:
`Auction.sol`(under `/contracts`) and `Auction.js`(under `/tests`) (These are provided in the repo folders above)

3. Write your NFT auction!
    The auction's sequence of events might be as follows:  
        1. **Owner** opens the auction   
        2. **Bidder1** makes a bid  
        3. **Bidder2** makes a bid higher than **Bidder1**'s bid  
        4. **Bidder3** makes a bid higher than **Bidder2**’s bid  
        5. **Bidder1** realizes they’ve been out bid and ups their bid   
        6. Auction continues like this with bidders competing for the highest bid…  
        7. **Owner** closes the auction  
        8. The winner (highest **bidder**) is transferred the NFT  
        9. The losers are refunded their bids  

    There will be two roles in this auction:   
        1. **Owner** - The owner is the account that deployed the smart contract. The owner, and only the owner, should be able to do the following:  
                a. Start the auction  
                b. End the auction  
                c. Payout the winner  

      2. **Bidder** - The bidders are competing to win the NFT. They should be able to do the following:  
                a. Make a bid  
                b. Up a bid if someone outbids them  
                c. Get their funds returned if they lost the auction  

     When your auction contract is deployed, it is neither open nor closed. It is in an idle state. When the auction begins, it is active. When it ends, it is closed.   
     Open the template code and follow the instructions to implement each function.



    1. When you've completed your code, 1. Run `npx hardhat test` to test your Auction.
     Every test should pass except one:
    
        ```jsx
        Auction
             Payout Winner
             The winner's balance should go to 0:
             Error: Transaction reverted: function call to a non-contract account
        ```

    This error is coming from a test of our `payoutWinner` function. This function, which we’ve implemented, transfers the course NFT to the winner. 

    ```solidity
    function payoutWinner() public /* MODIFIER(S) */ {
        fundsPerBidder[highestBidder] = 0;
        nft.enterAddressIntoBook("auction");
        nft.mintNFT();
        nft.transferFrom(address(this), highestBidder, 2);
    }
    ```

    The hardhat test is failing due to the calls on the `nft` object. 

    This error means that the NFT contract address we passed in the constructor doesn’t exist… Let’s see the address we sent to the constructor in line 17 of our hardhat test:

    ```jsx
    const auction = await Auction.deploy("0x978A328Cc24C0b50a0D9F97787938E67CF09F9A9", 1);
    ```
 
    If you check that address in the Etherscan Goerli test network, you’ll see it is our course NFT contract. So, why does Hardhat complain that the contract doesn’t exist?

    Hardhat has no knowledge of the Ethereum networks. The tests start with a blank slate blockchain with no contracts and only a small set of initial accounts.

    
### Part 2 Instructions:
In this part you will learn how to fork the test net so Hardhat has knowledge of our HW0 NFT contract.

In this part, you will need to interact with our existing course contract. To test this interaction, you will need to fork the Ethereum Georli test net.

As a warm-up for these learning goals, complete the following exercise: [Fork the F\*ing Ethereum Blockchain! Transfer tokens from Vitalik’s Account ;)](https://medium.com/uv-labs/fork-the-f-ing-ethereum-blockchain-transfer-tokens-from-vitaliks-account-46d408f7356c)

In the article, there is a line that says “there is literally 0 sense for you to fork a testnet.” Ignore that :) For this assignment, it does make sense to fork the testnet.

Once you’ve completed the warmup you should have the knowledge needed to fix the last failing test. Modify your hardhat config to fork the Georli testnet from block number `8335158`.

### Submission:
Submit your `Auction.sol` and `hardhat.config.js` on gradescope.
