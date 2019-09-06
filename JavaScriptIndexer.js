const chalk = require("chalk");

const globby = require("globby");

const crypto = require("crypto");

const {
  createServerSocketTransport,
  createProtocolConnection,
  InitializeRequest,
  ReferencesRequest,
  DocumentSymbolRequest
} = require("vscode-languageserver");

const hash = str =>
  crypto
    .createHash("md5")
    .update(str)
    .digest("hex");

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

async function getRefs(connection, fileURI, position) {
  return await connection.sendRequest(ReferencesRequest.type, {
    textDocument: {
      uri: fileURI  // file:// is included in fileURI
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

  async connect() {
    const [input, output] = createServerSocketTransport(
      LANGUAGE_SERVER_PORT,
      "utf-8"
    );
    const connection = await createProtocolConnection(input, output, console);
    await connection.listen();

    await connection.sendRequest(InitializeRequest.type, {
      rootUri: `file://${this.path}`,
      processId: 1,
      capabilities: {},
      workspaceFolders: null,
      trace: "verbose"
    });

    return connection;
  }

  async indexSymbols() {
    const symbols = [];

    const connection = await this.connect();

    const filePathes = await globby(`${this.path}/**/*.{js,ts,go}`, {
      absolute: true,
      onlyFiles: true,
      deep: 20,
      case: false,
      ignore: ["**/node_modules", "**/vendor"], // in the case not .gitignore is set in the notebook!
      nobrace: true
    });

    for (const filePath of filePathes) {
      const symbolRes = await connection.sendRequest(
        DocumentSymbolRequest.type,
        {
          textDocument: {
            uri: `file://${filePath}`
          }
        }
      );

      for (const symbol of symbolRes) {
        symbols.push(symbol);
      }
    }

    // close the connection and exit
    await connection.dispose();

    return symbols;
  }

  async indexRefs(symbols) {
    const refs = [];
    const connection = await this.connect();

    for (const symbol of symbols) {
      try {
        const range = symbol.selectionRange
          ? symbol.selectionRange
          : symbol.location.range;
        
        const refsRes = await getRefs(connection, symbol.location.uri, range.start);
        const symbolID = hash(JSON.stringify(symbol));
        refsRes.forEach(ref => refs.push({ symbolID, ...ref }));
      } catch (e) {
        console.error(
          chalk.red(
            `=> Could not generate records for symbol ${symbol.name}`,
            e.message
          )
        );
        throw e;
      }
    }

    await connection.dispose();

    return refs;
  }
}

module.exports = JavaScriptIndexer;
