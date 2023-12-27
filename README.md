# swapper-contract

A smart contract to swap any two ERC20 tokens

## Setup

* Install deps

```shell
yarn
```

* Start a forked node

    ```shell
    yarn hardhat node --fork https://<your-mainnet-rpc-url>
    ```

* Create and fill the swap parameters in `.env`

    ```shell
    cp .env.example .env
    ```

* Deploy contract

    ```shell
    yarn hardhat run scripts/deploy.js --network localhost
    ```

    Export the deployed address of the contract or update in `.env`

    ```shell
    export DEPLOYED_ADDRESS=0x9852795dbb01913439f534b4984fBf74aC8AfA12
    ```

* Mint WETH9 tokens

    ```shell
    yarn hardhat run scripts/mint.js --network localhost
    ```

* Approve SwapRouter contract

    ```shell
    yarn hardhat run scripts/approve.js --network localhost
    ```

* Swap tokens

    ```
    yarn hardhat run scripts/swap.js --network localhost
    ```

## Testing

* Start a forked node

    ```shell
    yarn hardhat node --fork https://<your-mainnet-rpc-url>
    ```

* Run hardhat tests

    ```shell
    yarn hardhat test test/swapper.js --network localhost
    ```

    Sample output:

    ```
    yarn run v1.22.19
    $ /home/dfqm8/work/plena/swapper-contract/node_modules/.bin/hardhat test test/swapper.js --network localhost


    Swapper
        Single-hop Swaps: WETH9 -> USDC
        ✔ Should check signer to own some amount of WETH9
        ✔ Swap should fail without WETH9 approval (577ms)
        ✔ Contract should be approved
    Swapping 0.01 WETH9 with USDC using deployed Swapper contract
    WETH9 before swap: 50000000000000000000n
    USDC before swap: 0n
    WETH9 after swap: 49990000000000000000n
    USDC after swap: 23434863n
        ✔ Should swap tokens post approval (5106ms)
        Multi-hop Swaps: USDC -> USDT
        ✔ Should check signer to own some amount of USDC
        ✔ Swap should fail without USDC approval (506ms)
        ✔ Contract should be approved
    Swapping 10 USDC Tokens with USDT using deployed Swapper contract
    USDC before swap: 23434863n
    USDT before swap: 77916n
    USDC after swap: 13434863n
    USDT after swap: 10008926n
        ✔ Should swap USDC with USDT and via WETH9 (4819ms)


    8 passing (13s)

    Done in 13.88s.
    ```
