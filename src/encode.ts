import { ethers } from "ethers";
import inquirer from "inquirer";

process.on('uncaughtException', () => {  console.log('\r\n', 'Unhandled Exception.. Exiting..', '\r\n'); process.exit()  });

(async() => {
    let iFace: ethers.utils.Interface | string = await getAbi();
    
    if (typeof iFace === 'string') {
        return console.log('\r\n', iFace);
    }

    let functionData: string = await getFunctionParameters(iFace);

    console.log('\r\n', functionData, '\r\n');
})();

async function getAbi(): Promise<ethers.utils.Interface | string> {

    let iFace: ethers.utils.Interface;

    let prompt = await inquirer.prompt({
        name: 'function_abi',
        type: 'input',
        message: 'Function ABI [someFunc(someType1,**someType2)]'
    });

    let abiInput = prompt.function_abi.replace(' ', '');

    try {
        iFace = new ethers.utils.Interface([`function ${abiInput}`]);
    } catch (e) {
        console.log('\r\n', 'ERROR: Invalid ABI Input.', abiInput, '\r\n');
        return getAbi();
    }

    let func = iFace.getFunction(abiInput)

    return func.inputs.length == 0 ? iFace.getSighash(abiInput) : iFace;

}

async function getFunctionParameters(iFace: ethers.utils.Interface): Promise<string> {

    let functionData: string;

    let prompt = await inquirer.prompt({
        name: 'function_params',
        type: 'input',
        message: 'Function arguments separated by comma. [arg1,arg2,arg3,..]',
    });

    let input = prompt['function_params'].replace(' ', '')
    
    let params: string[];

    if (input !== '') {
        params = input.split(',')
    } else {
        params = [];
    }

    try {
        functionData = iFace.encodeFunctionData(Object.values(iFace.functions)[0], params);
    } catch (e) {
        console.log('\r\n', 'ERROR: Invalid parameters.', params, '\r\n');
        return getFunctionParameters(iFace);
    }

    return functionData;
};