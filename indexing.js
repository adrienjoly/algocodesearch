const path = require('path');
const JavaScriptIndexer = require('./JavaScriptIndexer');

const { writeFile } = require('fs');
const { promisify } = require('util');

const repodir = path.resolve(process.argv[2] || "../javascript-typescript-langserver/src");

(async () => {
  const indexer = new JavaScriptIndexer(repodir);
  const symbols = await indexer.indexSymbols();
  const refs = await indexer.indexRefs(symbols);

  // Generate 2 json files
  const promiseWriteFile = promisify(writeFile);
  await promiseWriteFile("index-symbols-v2.json", JSON.stringify(symbols, null, 2));
  await promiseWriteFile("index-refs-v2.json", JSON.stringify(refs, null, 2));

  process.exit(0);
})();
