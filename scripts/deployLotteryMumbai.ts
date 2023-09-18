import hre, {ethers} from "hardhat";
import {dollar} from "../test/utils/helpers";

async function main() {

    const Lottery = await ethers.getContractFactory("Lottery");

      const contract = await Lottery.deploy(
          "0x5F325221E35320E0CF57427697fbe3B31B58f0b4",
          dollar(10),
          10,
          [dollar(3), dollar(2), dollar(1)],
          Number(process.env.SUB_ID),
          process.env.COORDINATOR || "",
          process.env.KEY_HASH || "",
      );

      await contract.deployed()

      console.log("Lottery deployed to:", contract.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}