import hre from "hardhat";
async function main() {

    const TestArray = await hre.ethers.getContractFactory("TestArray");
    const testArray = await TestArray.deploy();
    await testArray.deployed();

    console.log("TestArray deployed to:", testArray.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}