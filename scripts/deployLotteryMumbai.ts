import hre, {ethers} from "hardhat";
import {dollar} from "../test/utils/helpers";
import {replaceENV} from "./helpers/replace";

async function main() {

    const Lottery = await ethers.getContractFactory("Lottery");

      const contract = await Lottery.deploy(
          process.env.USDT_ADDRESS || "",
          dollar(10),
          10,
          [dollar(3), dollar(2), dollar(1)],
          Number(process.env.SUB_ID),
          process.env.COORDINATOR || "",
          process.env.KEY_HASH || "",
      );

      await contract.deployed()

    replaceENV(`LOTTERY_ADDRESS`, contract.address, ".env.mumbai")

      console.log("Lottery deployed to:", contract.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}