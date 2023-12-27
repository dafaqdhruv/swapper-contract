const { ethers } = require('hardhat');

// const WETH9 = require('../weth.json')
const IERC20 = require('../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json')
const Swapper = require('../artifacts/contracts/swapper.sol/Swapper.json')

async function main() {
    const [signer] = await ethers.getSigners();

    const deployedAddress = process.env.DEPLOYED_ADDRESS || "";
    const srcToken = process.env.FROM_TOKEN || "";

    const srcContract = new ethers.Contract(srcToken, IERC20.abi,  signer);
    const deployedContract = new ethers.Contract(deployedAddress, Swapper.abi,  signer);

    const approvalAmount = ethers.parseUnits('5', 18)
    const tx = await srcContract.approve(deployedContract, approvalAmount);
    console.log('approvalTx Hash:', tx.hash);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
