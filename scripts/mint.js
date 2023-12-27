const { ethers } = require('hardhat');

const WETH9 = require('../weth.json')

async function mintWeth() {
    const [signer] = await ethers.getSigners();

    const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const WethContract = new ethers.Contract(wethAddress, WETH9,  signer);
    const amountToDeposit = ethers.parseEther('50')

    const tx = await WethContract.deposit({ value: amountToDeposit });
    console.log('Tx Hash:', tx.hash);
    return tx.hash
}

async function main() {
    await mintWeth()
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
