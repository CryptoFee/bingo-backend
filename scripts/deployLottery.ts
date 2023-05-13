const {ethers} = require("hardhat");
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'artifacts', 'contracts', 'Lottery.sol', 'Lottery.json');
const destDir = path.join(__dirname, '..', '..', 'frontend', 'src');
const destFile = path.join(destDir, 'Lottery.json');

async function main() {

    // Compile the smart contract
    const Lottery = await ethers.getContractFactory("Lottery");
    console.log("Compiling Lottery...");

    // Deploy the smart contract
    const lottery = await Lottery.deploy();
    console.log("Deploying Lottery...");

    // Wait for the contract to be mined
    await lottery.deployed();

    console.log("Lottery deployed to:", lottery.address);

    fs.copyFileSync(sourceFile, destFile)
    console.log(`${sourceFile} was successfully copied to ${destFile}`);
}

// Run the deploy function
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}