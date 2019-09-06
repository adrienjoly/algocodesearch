
const { writeFile } = require('fs');
const { promisify } = require('util');

const repodir = process.argv[2] || "../javascript-typescript-langserver/src";

(async () => {
    // Generate 2 json files
    const promiseWriteFile = promisify(writeFile);
    await promiseWriteFile("index-symbols-v2.json", JSON.stringify(symbols, null, 2));
    await promiseWriteFile("index-refs-v2.json", JSON.stringify(symbolRefs, null, 2));
  
 process.exit(0);

})();

const symbols = [];
const symbolRefs = [];

const crypto = require('crypto');

const hash = str => crypto.createHash('md5').update(str).digest("hex")

function addSymbol(symbol) {
  const symbolID = hash(JSON.stringify(symbol));
  symbols.push({ objectID: symbolID, ...symbol });
}

function addSymbolRef(symbol, ref) {
  const symbolID = hash(JSON.stringify(symbol));
  symbolRefs.push({ symbolID, ...ref });
}