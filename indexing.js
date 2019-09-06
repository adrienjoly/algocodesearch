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

const repodir = process.argv[2] || "/Users/jeromeschneider/Code/Js/javascript-typescript-langserver";
// const repodir = "/Users/adrienjoly/Dev/_off-sprint/2019-09-02-code-search/javascript-typescript-langserver";

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

(async () => {
  
  const [input, output] = createServerSocketTransport(LANGUAGE_SERVER_PORT, 'utf-8');
  //output.write({ jsonrpc: 'hello' });

  const connection = await createProtocolConnection(input, output, console);

  // connection.onNotification((kind, { message }) =>
  //   console.log(`ℹ️  [${kind}] ${message}`)
  // );

  await connection.listen();

  const initRes = await connection.sendRequest(InitializeRequest.type, {
    rootUri: `file://${repodir}`, // current directory
    processId: 1,
    capabilities: {},
    workspaceFolders: null,
    trace: "verbose"
  });
  // console.log({ initRes });

  const filePathes = await globby(`${repodir}/src/**/*.ts`, {
    absolute: true,
    onlyFiles: true,
    deep: 20,
    case: false,
    ignore: ['**/node_modules'],    // in the case not .gitignore is set in the notebook!
    nobrace: true,
  });

  console.log("Filepathes", filePathes);

  for (const filePath of filePathes) {
  
    const symbolRes = await connection.sendRequest(DocumentSymbolRequest.type, {
      textDocument: {
        uri: `file://${filePath}`
      }
    });
    
    for (const symbol of symbolRes) {
      console.log(`Generating records for symbol: ${symbol.name} (${symbol.kind}, ${symbol.location.uri}):${symbol.location.range.start.line},${symbol.location.range.start.character}`);
      try {
        const refsRes = await getRefs(connection, filePath, symbol.location.range.start);
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