const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Auction", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployAuction() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2, _] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy("0x345565c62EFB2859769b6Ee887577123C550a6Ff", 100);

    return { auction, owner, otherAccount1, otherAccount2 };
  }

  describe("Deployment", function () {
    it("Should start with auction closed", async function () {
        const { auction, owner } = await deployAuction();

        await expect(auction.makeBid({value: 1})).to.be.revertedWith("Auction not yet active");
    });

    it("Should set the right owner", async function () {
      const { auction, owner } = await deployAuction();

      expect(await auction.owner()).to.equal(owner.address);
    });
  });

  describe("Opening the auction", function () {
    it("Should only allow the owner to start the auction", async function () {
      const { auction, owner, otherAccount1 } = await deployAuction();

      await expect(auction.connect(otherAccount1).startAuction()).to.be.reverted;
    });

    it("Should allow bidding to start once it is open", async function () {
      const { auction, owner, otherAccount1 } = await deployAuction();

      await auction.startAuction();

      await expect(auction.connect(otherAccount1).makeBid({value: 1})).not.to.be.reverted;

    });
  });


  describe("Bidding", function () {
    it("Should set the highest bidder accordingly", async function () {
      const { auction, owner, otherAccount1 } = await deployAuction();

      let bidAmount = 1;

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: bidAmount});

      await expect(auction.highestBidder() == otherAccount1.address);
      await expect(auction.highestBid() == bidAmount);
      await expect(auction.fundsPerBidder(otherAccount1.address) == bidAmount);
    });


    it("Should not allow a bid lower than the highest", async function () {
      const { auction, owner, otherAccount1, otherAccount2 } = await deployAuction();

      let bidAmount = 2;

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: bidAmount});

      bidAmount = 1;

      await expect(auction.connect(otherAccount2).makeBid({value: bidAmount})).to.be.reverted;

    });

    it("Should not allow more than one bid per sender", async function () {
      const { auction, owner, otherAccount1 } = await deployAuction();

      let bidAmount = 1;

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: bidAmount});

      bidAmount = 2;

      await expect(auction.connect(otherAccount1).makeBid({value: bidAmount})).to.be.reverted;

    });


  });

  describe("Up Bidding", function () {
    it("Should set the highest bidder accordingly", async function () {
      const { auction, owner, otherAccount1, otherAccount2 } = await deployAuction();

      let acc1_bidAmount = 1;

      await auction.startAuction();

      await auction.connect(otherAccount1).makeBid({value: acc1_bidAmount});

      let acc2_bidAmount = 2;

      await auction.connect(otherAccount2).makeBid({value: acc2_bidAmount});

      let acc1_upAmount = 2;

      await auction.connect(otherAccount1).upBid({value: acc1_upAmount});

      await expect(auction.highestBidder == otherAccount1.address);
      await expect(auction.fundsPerBidder(otherAccount1.address) == acc1_bidAmount + acc1_upAmount);
  });

    it("Should not allow senders who have not yet bid", async function () {
      const { auction, owner, otherAccount1 } = await deployAuction();

      let bidAmount = 1;

      await auction.startAuction();

      await expect(auction.connect(otherAccount1).upBid({value: bidAmount})).to.be.reverted;
  });

    it("Should not allow a bid lower than the highest", async function () {
      const { auction, owner, otherAccount1, otherAccount2 } = await deployAuction();

      let acc1_bidAmount = 1;

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: acc1_bidAmount});

      let acc2_bidAmount = 3;

      await auction.connect(otherAccount2).makeBid({value: acc2_bidAmount});

      let acc1_upAmount = 1;

      await expect(auction.connect(otherAccount1).upBid({value: acc1_upAmount})).to.be.reverted;
    });
  });


 describe("Close auction", function () {
    it("Only the owner can close the auction", async function () {
      const { auction, owner, otherAccount1 } = await deployAuction();

      let acc1_bidAmount = 1;

      await auction.startAuction();
      await expect(auction.connect(otherAccount1).endAuction()).to.be.reverted;


    });

    it("Should not allow bidding once the auction is closed", async function () {

      const { auction, owner, otherAccount1 } = await deployAuction();

      await auction.startAuction();
      await auction.endAuction();
      await expect(auction.connect(otherAccount1).makeBid({value: 1})).to.be.reverted;

    });

    it("Should not allow up bidding once the auction is closed", async function () {
       const { auction, owner, otherAccount1 } = await deployAuction();

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: 1});
      await auction.endAuction();
      await expect(auction.connect(otherAccount1).upBid({value: 1})).to.be.reverted;

    });

    it("Should not close if the auction has not been started", async function () {
      const { auction, owner } = await deployAuction();

      await expect(auction.endAuction()).to.be.reverted;
             
    });

  });


  describe("Refund", function () {

    it("Should only refund if the auction is closed", async function () {
          const { auction, owner, otherAccount1, otherAccount2 } = await deployAuction();

          await auction.startAuction();
          await auction.connect(otherAccount1).makeBid({value: 1});

          await auction.connect(otherAccount2).makeBid({value: 2});

          await expect(auction.connect(otherAccount1).refund()).to.be.reverted;
    });


      it("Should not refund the highest bidder", async function () {
          const { auction, owner, otherAccount1 } = await deployAuction();

          await auction.startAuction();
          await auction.connect(otherAccount1).makeBid({value: 1});

          await auction.endAuction();

          await expect(auction.connect(otherAccount1).refund()).to.be.reverted;
    });

    it("Should empty the funds accordingly", async function () {
          const { auction, owner, otherAccount1, otherAccount2 } = await deployAuction();

          await auction.startAuction();
          await auction.connect(otherAccount1).makeBid({value: 1});
          await auction.connect(otherAccount2).makeBid({value: 2});

          await auction.endAuction();

          await auction.connect(otherAccount1).refund();

          await expect(auction.fundsPerBidder(otherAccount1.address) == 0);
    });

    it("Should only withdraw once per sender", async function () {
          const { auction, owner, otherAccount1 } = await deployAuction();

          await auction.startAuction();
          await auction.connect(otherAccount1).makeBid({value: 1});
          await auction.endAuction();

          await expect(auction.connect(otherAccount1).refund()).to.be.reverted;
    });

  });


  describe("Payout Winner", function () {
    it("Only the owner can payout the winner", async function () {
            
      const { auction, owner, otherAccount1 } = await deployAuction();

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: 1});
      await auction.endAuction();

      await expect(auction.connect(otherAccount1).payoutWinner()).to.be.reverted;
    });

    it("The winner's balance should go to 0", async function () {
            
      const { auction, owner, otherAccount1 } = await deployAuction();

      await auction.startAuction();
      await auction.connect(otherAccount1).makeBid({value: 1});
      await auction.endAuction();

      await auction.payoutWinner();

      expect(auction.fundsPerBidder(otherAccount1.address) == 0);
    });

  });


});
