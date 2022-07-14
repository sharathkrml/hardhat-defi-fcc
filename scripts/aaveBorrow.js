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
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer) // gives out deposited,debt,amount we can borrow
    // find conversion rate to DAI
    const daiPrice = await getDaiPrice() //Price of 1 Dai in ETH
    const amountofDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber()) // convert eth to dai,95% of amount we can borrow
    console.log(`You can borrow ${amountofDaiToBorrow} DAI`)
    const amountofDaiToBorrowWei = ethers.utils.parseEther(amountofDaiToBorrow.toString())
    console.log(`You can borrow ${amountofDaiToBorrowWei} wei DAI`)

    // Borrow

    // how much we have borrowed,how much we have in collateral,how much we can borrow
    daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
    await borrowDai(daiAddress, lendingPool, amountofDaiToBorrowWei, deployer)
    // get updated data
    await getBorrowUserData(lendingPool, deployer)
    // You have 20000000112503753 worth of eth deposited
    // You have 15674999999999999 worth of eth borrowed
    // You can borrow 825000092815597 worth of ETH

    // Repaying
    await repay(amountofDaiToBorrowWei, daiAddress, lendingPool, deployer)
    // get updated data

    // You have 20000000190767233 worth of eth deposited
    // You have 863137685 worth of eth borrowed - interest of borrowed amount
    // You can borrow 16499999294245282 worth of ETH

    await getBorrowUserData(lendingPool, deployer)
}
const repay = async (amount, daiAddress, lendingPool, account) => {
    await approveERC20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!!")
}
const borrowDai = async (daiAddress, lendingPool, amountofDaiToBorrowWei, account) => {
    const borrowTx = await lendingPool.borrow(daiAddress, amountofDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You've Borrowed!!")
}
const getDaiPrice = async () => {
    //get price of 1 dai in ether
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const { answer } = await daiEthPriceFeed.latestRoundData()
    const decimal = await daiEthPriceFeed.decimals()
    console.log(`decimals = ${decimal.toString()}`)
    console.log(`1Dai = ${answer.toString()} Eth`)
    // 936716598501778
    return answer
}
const getBorrowUserData = async (lendingPool, account) => {
    // gets How much collateral use have,How much debt user have & how much they can borrow
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of eth deposited`)
    console.log(`You have ${totalDebtETH} worth of eth borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`)
    return { availableBorrowsETH, totalDebtETH }
}
const getLendingPool = async (account) => {
    // gives out contract lendingPool
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
