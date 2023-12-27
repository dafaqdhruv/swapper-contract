const { ethers } = require('hardhat');

require('dotenv').config()

// const WETH9 = require('../weth.json')
const { abi } = require('../artifacts/contracts/swapper.sol/Swapper.json')
const JSBI = require("jsbi");

async function main() {
    const [signer] = await ethers.getSigners();

    const deployedAddress = process.env.DEPLOYED_ADDRESS || "";
    const Swapper = new ethers.Contract(deployedAddress, abi,  signer);

    const amount = process.env.AMOUNT || "";
    const srcToken = process.env.FROM_TOKEN || "";
    const targetToken = process.env.TO_TOKEN || "";

    const amountWei = ethers.parseUnits(amount, 18)

    console.log("Swapping %s %s Tokens with %s using contract at %s", amountWei, srcToken, targetToken, deployedAddress)
    const tx = await Swapper.swap(amountWei, srcToken, targetToken);
    console.log('Tx Hash:', tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

function fromReadableAmount(amount, decimals) {
    const extraDigits = Math.pow(10, countDecimals(amount));
    const adjustedAmount = amount * extraDigits;
    return JSBI.divide(
        JSBI.multiply(
        JSBI.BigInt(adjustedAmount),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
        ),
        JSBI.BigInt(extraDigits)
    );
}

function countDecimals(x) {
    if (Math.floor(x) === x) {
        return 0;
    }
    return x.toString().split(".")[1].length || 0;
}