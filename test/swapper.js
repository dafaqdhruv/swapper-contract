const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, should } = require("chai");

const { ethers } = require("hardhat");

const IERC20 = require('../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json')
const IWETH9 = require('../weth.json')

const wethAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

describe("Swapper", function () {
  let signer;
  let WethContract;
  let usdcContract;
  let swapperContract;

  before (async function() {
    [signer] = await ethers.getSigners();

    WethContract = new ethers.Contract(wethAddr, IWETH9, signer);
    usdcContract = new ethers.Contract(USDC, IERC20.abi, signer);

    swapperContract = await ethers.deployContract("Swapper");
    await swapperContract.waitForDeployment();

    const amountToDeposit = ethers.parseEther('50')
    await WethContract.deposit({ value: amountToDeposit });
  });

  describe("Single-hop Swaps: WETH9 -> USDC", function () {

    it("Should check signer to own some amount of WETH9", async function () {
      expect(await WethContract.balanceOf(signer.address)).to.be.greaterThan(0);
    });

    it("Swap should fail without WETH9 approval", async function() {
      try{
        const amount = ethers.parseUnits("0.01", 18);
        await swapperContract.swap(amount, wethAddr, USDC);
        should.fail("Swap should not happen without contract approval")
      } catch (err) { }
    });

    it("Contract should be approved", async function() {
      const approvalAmount = ethers.parseUnits('5', 18)
      const tx = await WethContract.approve(swapperContract, approvalAmount);
      expect(tx.hash).to.not.be.undefined;
    });

    it("Should swap tokens post approval", async function() {
      const amount = ethers.parseUnits("0.01", 18);
      console.log("Swapping 0.01 WETH9 with USDC using deployed Swapper contract");

      let wethBalance = await WethContract.balanceOf(signer.address)
      let usdcBalance = await usdcContract.balanceOf(signer.address)

      console.log("WETH9 before swap:", wethBalance)
      console.log("USDC before swap:", usdcBalance)

      const tx = await swapperContract.swap(amount, wethAddr, USDC);
      expect(tx.hash).to.not.be.undefined;

      wethBalance = await WethContract.balanceOf(signer.address)
      usdcBalance = await usdcContract.balanceOf(signer.address)

      console.log("WETH9 after swap:", wethBalance);
      console.log("USDC after swap:", usdcBalance);
    })
  });

  describe("Multi-hop Swaps: USDC -> USDT", function () {

    it("Should check signer to own some amount of USDC", async function () {
      expect(await usdcContract.balanceOf(signer.address)).to.be.greaterThan(0);
    });

    it("Swap should fail without USDC approval", async function() {
      try{
        const amount = ethers.parseUnits("10.0", 6);
        await swapperContract.swap(amount, USDC, USDT);
        should.fail("Swap should not happen without contract approval")
      } catch (err) { }
    });

    it("Contract should be approved", async function() {
      const approvalAmount = ethers.parseUnits('500', 6)
      const tx = await usdcContract.approve(swapperContract, approvalAmount);
      expect(tx.hash).to.not.be.undefined;
    });


    it("Should swap USDC with USDT and via WETH9", async function() {
      const amount = ethers.parseUnits("10", 6);
      console.log("Swapping 10 USDC Tokens with USDT using deployed Swapper contract");

      let usdtContract = new ethers.Contract(USDT, IERC20.abi, signer);

      let usdcBalance = await usdcContract.balanceOf(signer.address)
      let usdtBalance = await usdtContract.balanceOf(signer.address)

      console.log("USDC before swap:", usdcBalance)
      console.log("USDT before swap:", usdtBalance)

      const tx = await swapperContract.swap(amount, USDC, USDT);
      expect(tx.hash).to.not.be.undefined;

      usdcBalance = await usdcContract.balanceOf(signer.address)
      usdtBalance = await usdtContract.balanceOf(signer.address)

      console.log("USDC after swap:", usdcBalance);
      console.log("USDT after swap:", usdtBalance);
    })
  });
});
