const fs = require("fs");
const path = require("path");

const destDir = path.join(__dirname, '..', '..', '..', 'bingo-frontend', 'src', 'web3Utils', 'constants.ts');

export const replaceConstantsValue = (variableName: string, value: string) => {

    const filePath = path.resolve(__dirname, destDir);

    const data = fs.readFileSync(filePath, "utf-8")

    const regex = new RegExp(`(export const ${variableName} = ')([^']+)`);
    const result = data.replace(regex, `$1${value}`);

    fs.writeFileSync(filePath, result, "utf-8")
}

export const replaceAbi = (contractName: string) => {

    const sourceFile = path.join(__dirname, '..', '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    const destDir = path.join(__dirname, '..', '..', '..', 'bingo-frontend', 'src', 'web3Utils', 'abi');
    const destFile = path.join(destDir, `${contractName}.json`);

    fs.copyFileSync(sourceFile, destFile)
}

export const replaceENV = (envName: string, value : string) => {

    const destDir = path.join(__dirname, '..', '..', '.env');
    const filePath = path.resolve(__dirname, destDir);

    const data = fs.readFileSync(filePath, "utf-8")


    const regex = new RegExp(`(${envName}=)(.*)`);
    const result = data.replace(regex, `$1${value}`);

    fs.writeFileSync(filePath, result, "utf-8")
}

export const getAbi = (contractName: string) => {
    const abi = path.join(__dirname, '..', '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    return fs.readFileSync(abi, 'utf8');
}

export {}