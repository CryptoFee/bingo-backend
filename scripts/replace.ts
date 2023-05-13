const fs = require("fs");
const path = require("path");

const destDir = path.join(__dirname, '..', '..', 'frontend', 'src' , 'web3', 'constants.ts');

export const replaceConstantsValue = (variableName : string, value : string) => {

    const filePath = path.resolve(__dirname, destDir);

    const data = fs.readFileSync(filePath, "utf-8")

    const regex = new RegExp(`(export const ${variableName} = ')([^']+)`);
    const result = data.replace(regex, `$1${value}`);

    fs.writeFileSync(filePath, result, "utf-8")
}

export const replaceAbi = (contractName : string) => {

    const sourceFile = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    const destDir = path.join(__dirname, '..', '..', 'frontend', 'src' , 'abi');
    const destFile = path.join(destDir, `${contractName}.json`);

    fs.copyFileSync(sourceFile, destFile)
}

export {}