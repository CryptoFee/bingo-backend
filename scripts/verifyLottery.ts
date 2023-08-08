
import hre from "hardhat";

async function main() {

    await hre.run("verify:verify", {
        address: "0xffe711B5011C0bC4603599f3306A48d7A891097f",
        constructorArguments: [
            "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832",
            10000000,
            4,
            [3000000,2000000,1000000],
            5576,
            "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
            "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f"
        ],
    });

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}