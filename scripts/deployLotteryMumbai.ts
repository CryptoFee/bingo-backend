import hre, {ethers} from "hardhat";
import {dollar} from "../test/utils/helpers";

async function main() {

    const Lottery = await ethers.getContractFactory("Lottery");

      const contract = await Lottery.deploy(
          "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832",
          dollar(10),
          4,
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