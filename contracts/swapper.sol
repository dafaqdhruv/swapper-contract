// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "interfaces/IERC20.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract Swapper {
    ISwapRouter private constant UNISWAP_V3_ROUTER = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    event Withdrawal(uint amount, uint when);

    receive() external payable {}

    function swapViaWeth (
        uint256 _amount,
        address _fromToken,
        address _toToken,
        address _recipient
    )   internal
        returns (uint256 amountOut)
    {
        console.log("Swapping via WETH9");

        IERC20 TokenA = IERC20(_fromToken);
        require(TokenA.balanceOf(_recipient) >= _amount, "Insufficient SrcToken Balance");

        TransferHelper.safeTransferFrom(
            _fromToken,
            _recipient,
            address(this),
            _amount
        );

        TransferHelper.safeApprove(_fromToken, address(UNISWAP_V3_ROUTER), _amount);

        uint24 poolFee = 3000;
        bytes memory path = abi.encodePacked (_fromToken, poolFee, WETH9, poolFee, _toToken);

        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: path,
                recipient: _recipient,
                deadline: block.timestamp + 100,
                amountIn: _amount,
                amountOutMinimum: 1
            });

        amountOut = UNISWAP_V3_ROUTER.exactInput(params);
        console.log("amount out of Token is: ", amountOut);
    }

    function swapDirect (
        uint256 _amount,
        address _fromToken,
        address _toToken,
        address _recipient
    )   internal
        returns (uint256 amountOut)
    {
        IERC20 TokenA = IERC20(_fromToken);
        require(TokenA.balanceOf(_recipient) >= _amount, "Insufficient Balance");
        console.log("Balance ", TokenA.balanceOf(_recipient));

        // Transfer tokens to self
        TransferHelper.safeTransferFrom(
            _fromToken,
            _recipient,
            address(this),
            _amount
        );
        // bool ok = TokenA.transferFrom(_recipient, address(this), _amount);
        console.log("Transfer Successful");

        // Approve Token
        TransferHelper.safeApprove(_fromToken, address(UNISWAP_V3_ROUTER), _amount);
        console.log("Approval Successful");

        // Swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _fromToken,
                tokenOut: _toToken,
                fee: 3000,
                recipient: _recipient,
                deadline: block.timestamp + 100,
                amountIn: _amount,
                amountOutMinimum: 1,
                sqrtPriceLimitX96: 0
            });

        amountOut = UNISWAP_V3_ROUTER.exactInputSingle(params);
        console.log("amount out of Token : ", amountOut);
    }

    function swap (
        uint256 _amount,
        address _from,
        address _to
    )   external
        payable
    {
        console.log("Inside swap, ",_amount);
        require(_amount > 0, "Amount must be positive");

        if( _from != WETH9 && _to != WETH9) {
            console.log("Swap via ether");
            swapViaWeth(_amount, _from, _to, msg.sender);
        } else {
            console.log("Swap direct");
            swapDirect(_amount, _from, _to, msg.sender);
        }
    }
}
