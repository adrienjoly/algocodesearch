const {
  createServerSocketTransport,
  createProtocolConnection,
  InitializeRequest,
  ReferencesRequest,
  DocumentSymbolRequest,
  DefinitionRequest,
} = require('vscode-languageserver');

const { writeFile } = require('fs');
const { promisify } = require('util');

const chalk = require('chalk');

const globby = require('globby');

const repodir = process.argv[2] || "../javascript-typescript-langserver/src";
const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

(async () => {
  
  const [input, output] = createServerSocketTransport(LANGUAGE_SERVER_PORT, 'utf-8');
  const connection = await createProtocolConnection(input, output, console);
  await connection.listen();

  await connection.sendRequest(InitializeRequest.type, {
    rootUri: `file://${repodir}`, // current directory
    processId: 1,
    capabilities: {},
    workspaceFolders: null,
    trace: "verbose"
  });

  const filePathes = await globby(`${repodir}/**/*.{ts,go}`, {
    absolute: true,
    onlyFiles: true,
    deep: 20,
    case: false,
    ignore: ['**/node_modules', '**/vendor'],    // in the case not .gitignore is set in the notebook!
    nobrace: true,
  });

  console.log(`${filePathes.length} files to index`);

  for (const filePath of filePathes) {

    console.log(`Processing file ${filePath}`)
  
    const symbolRes = await connection.sendRequest(DocumentSymbolRequest.type, {
      textDocument: {
        uri: `file://${filePath}`
      }
    });
    
    for (const symbol of symbolRes) {
      console.log(symbol);
      try {
        const range = symbol.selectionRange ? symbol.selectionRange : symbol.location.range;
        console.log(`Generating records for symbol: ${symbol.name} (${symbol.kind}, ${filePath}):${range.start.line},${range.start.character}`);
        const refsRes = await getRefs(connection, filePath, range.start);
        console.log(`=> found ${refsRes.length} refs`);
        addSymbol(symbol);
        refsRes.forEach(ref => addSymbolRef(symbol, ref)); 
      } catch(e) {
        console.error(
          chalk.red(`=> Could not generate records for symbol ${symbol.name}`, e.message)
        );
      }

      console.log();
    }
  }

  // Generate 2 json files
  const promiseWriteFile = promisify(writeFile);
  await promiseWriteFile("index-symbols-v2.json", JSON.stringify(symbols, null, 2));
  await promiseWriteFile("index-refs-v2.json", JSON.stringify(symbolRefs, null, 2));

  // close the connection and exit
  await connection.dispose();
  process.exit(0);

})();

async function getRefs(connection, filePath, position) {
  return await connection.sendRequest(ReferencesRequest.type, {
    textDocument: {
      uri: `file://${filePath}`
    },
    position,
    context: {
      includeDeclaration: true
    }
  });
}

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