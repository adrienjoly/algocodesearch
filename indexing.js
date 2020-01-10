const path = require('path');
const JavaScriptIndexer = require('./JavaScriptIndexer');

const { writeFile } = require('fs');
const { promisify } = require('util');

const repodir = path.resolve(process.argv[2]);
const outputName = path.resolve(process.argv[3]);

console.warn(`Indexing ${repodir}...`);

(async () => {
  const indexer = new JavaScriptIndexer(repodir);
  const symbols = await indexer.indexSymbols();
  const refs = await indexer.indexRefs(symbols);

  // Generate 2 json files
  const promiseWriteFile = promisify(writeFile);

  await promiseWriteFile(outputName + "-index-symbols.json", JSON.stringify(symbols, null, 2));
  await promiseWriteFile(outputName + "-index-refs.json", JSON.stringify(refs, null, 2));

  process.exit(0);
})();
