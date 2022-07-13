const { getNamedAccounts, ethers } = require("hardhat")

const AMOUNT = ethers.utils.parseEther("0.02")

const getWeth = async () => {
    const { deployer } = await getNamedAccounts()
    // call deposit function on weth contract
    // we need abi =[x] & contract address =[x]
    // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const IWeth = await ethers.getContractAt(
        "IWeth",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        deployer
    )
    const tx = await IWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await IWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}
module.exports = { getWeth }
