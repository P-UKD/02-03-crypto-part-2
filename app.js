import fs from 'fs';
import cryptoJs from 'crypto-js';
import { parseArgs } from 'util';

/**
 * Encrypts a file using AES encryption and writes the encrypted data to a new file.
 * 
 * @param {string} inputFilePath - The path to the file to encrypt.
 * @param {string} key - The encryption key to use.
 * @param {string} outputFilePath - The path to the output file to write the encrypted data to.
 * @returns {Promise<void>} A Promise that resolves when the encryption and writing is complete.
 */
async function encryptFile(inputFilePath, key, outputFilePath) {
    const inputFileData = await fs.promises.readFile(inputFilePath, 'utf-8');
    const encryptedData = cryptoJs.AES.encrypt(inputFileData, key).toString();
    await fs.promises.writeFile(outputFilePath, encryptedData);
}

/**
 * Decrypts a file using a given key.
 * @param {string} inputFilePath - The file path of the file to decrypt.
 * @param {string} key - The encryption key to use for decryption.
 * @param {string} outputFilePath - The file path to save the decrypted data to.
 * @returns {Promise<void>} - A Promise that resolves when the file is decrypted and saved.
 */
async function decryptFile(inputFilePath, key, outputFilePath) {
    const inputFileData = await fs.promises.readFile(inputFilePath, 'utf-8');
    const decryptedData = cryptoJs.AES.decrypt(inputFileData, key);
    await fs.promises.writeFile(outputFilePath, decryptedData.toString(cryptoJs.enc.Utf8));
}

/**
 * Displays usage information for the CLI application.
 * 
 * @returns {void}
 */
function usage() {
    console.log(`
Usage: npm start encrypt|decrypt <input file> -- [options]

Options:
    -o, --output <output file> Defaults to input file name with .enc extension if encrypt is used, otherwise defaults to input file name with .txt extension if decrypt is used.
    -k, --key <encryption key> Defaults to 'mySecretKey' key.
    `.trim());
}

const options = {
    'output': {
        type: 'string',
        short: 'o'
    },
    'key': {
        type: 'string',
        short: 'k',
    }
};

const args = parseArgs({
    args: process.argv.slice(2),
    options: options,
    allowPositionals: true,
});

if (args.positionals.length !== 2) {
    usage();
    process.exit(1);
}

const action = args.positionals[0];
const inputFilePath = args.positionals[1];
const encryptionKey = args.values.key ?? 'mySecretKey';

if (action === 'encrypt') {
    const outputFilePath = args.values.output ?? inputFilePath + '.enc';
    try {
        await encryptFile(inputFilePath, encryptionKey, outputFilePath);
        console.log(`Successfully encrypted ${inputFilePath}, and saved to ${outputFilePath}.`);
    } catch (error) {
        console.trace(error);
        console.error(`Failed to encrypt ${inputFilePath}.`);
    }
} else if (action === 'decrypt') {
    const outputFilePath = args.values.output ?? inputFilePath + '.txt';
    try {
        await decryptFile(inputFilePath, encryptionKey, outputFilePath);
        console.log(`Successfully decrypted ${inputFilePath}, and saved to ${outputFilePath}.`);
    } catch (error) {
        console.trace(error);
        console.error(`Failed to decrypt ${inputFilePath}.`);
    }
} else {
    console.log(`Unknown action: ${action}.`);
    usage();
}