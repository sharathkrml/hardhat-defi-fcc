const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT, WETHADDRESS } = require("./getWeth")
const main = async () => {
    await getWeth()
    // protocol treats everything as ERC20 token
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool(deployer)
    console.log(`lendingPool address = ${lendingPool.address}`)
    // approve
    await approveERC20(WETHADDRESS, lendingPool.address, AMOUNT, deployer)
    console.log("depositing......")
    await lendingPool.deposit(WETHADDRESS, AMOUNT, deployer, 0)
    console.log("Deposited")
}
const getLendingPool = async (account) => {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
        account
    )
    // lendingPoolAddressProvider gives out the address
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}
const approveERC20 = async (erc20address, spenderAddress, amountToSpend, account) => {
    const erc20Token = await ethers.getContractAt("IERC20", erc20address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("approved!!")
}
main()
    .then(() => {
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
