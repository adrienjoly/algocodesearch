const chalk = require('chalk');

const globby = require('globby');

const {
  createServerSocketTransport,
  createProtocolConnection,
  InitializeRequest,
  ReferencesRequest,
  DocumentSymbolRequest,
} = require('vscode-languageserver');

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

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

class JavaScriptIndexer {

  constructor(path) {
    this.path = path;
  }

  async indexSymbols() {
    const symbols = [];

    const [input, output] = createServerSocketTransport(LANGUAGE_SERVER_PORT, 'utf-8');
    const connection = await createProtocolConnection(input, output, console);
    await connection.listen();

    console.warn(this.path)

    await connection.sendRequest(InitializeRequest.type, {
      rootUri: `file://${this.path}`,
      processId: 1,
      capabilities: {},
      workspaceFolders: null,
      trace: "verbose"
    });

    const filePathes = await globby(`${this.path}/**/*.{js,ts,go}`, {
      absolute: true,
      onlyFiles: true,
      deep: 20,
      case: false,
      ignore: ['**/node_modules', '**/vendor'],    // in the case not .gitignore is set in the notebook!
      nobrace: true,
    });

    console.warn(`${filePathes.length} files to index`, filePathes);

    for (const filePath of filePathes) {

      console.log(`Processing file ${filePath}`)

      const symbolRes = await connection.sendRequest(DocumentSymbolRequest.type, {
        textDocument: {
          uri: `file://${filePath}`
        }
      });

      for (const symbol of symbolRes) {
        /*
        console.log(symbol);
        try {
          const range = symbol.selectionRange ? symbol.selectionRange : symbol.location.range;
          console.log(`Generating records for symbol: ${symbol.name} (${symbol.kind}, ${filePath}):${range.start.line},${range.start.character}`);
          const refsRes = await getRefs(connection, filePath, range.start);
          console.log(`=> found ${refsRes.length} refs`);
          // refsRes.forEach(ref => addSymbolRef(symbol, ref)); 
        } catch(e) {
          console.error(
            chalk.red(`=> Could not generate records for symbol ${symbol.name}`, e.message)
          );
        }
        console.log();
        */
        symbols.push(symbol);

      }
    }

    // close the connection and exit
    await connection.dispose();

    return symbols;
  }
}

module.exports = JavaScriptIndexer;
