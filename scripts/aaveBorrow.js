const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth } = require("./getWeth")
const main = async () => {
    await getWeth()
    // protocol treats everything as ERC20 token
    const { deployer } = await getNamedAccounts()
    // lending pool address provider :0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(deployer)
    console.log(`lendingPool address = ${lendingPool.address}`)
}
const getLendingPool = async (account) => {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
        account
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}
main()
    .then(() => {
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
