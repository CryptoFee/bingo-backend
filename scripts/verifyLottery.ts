
import hre from "hardhat";

async function main() {

    await hre.run("verify:verify", {
        address: "0x8BC40C0Fb9B97A7589a0089B9076b6736ec5e719",
        constructorArguments: [
            "0x5F325221E35320E0CF57427697fbe3B31B58f0b4",
            10000000,
            10,
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