const assert = require("assert");
const chalk = require("chalk");
const globby = require("globby");
const crypto = require("crypto");
const path = require("path");

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

const makeSymbolID = symbol => hash(JSON.stringify(symbol));

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

async function getRefs(connection, fileURI, position) {
  return await connection.sendRequest(ReferencesRequest.type, {
    textDocument: {
      uri: fileURI // file:// is included in fileURI
    },
    position,
    context: {
      includeDeclaration: true
    }
  });
}

class Indexer {
  constructor(repoPath, { ignoredPaths, filePattern }) {
    assert.ok(path.isAbsolute(repoPath), "path should be absolute");
    this.path = repoPath;
    this.ignoredPaths = ignoredPaths;
    this.filePattern = filePattern;
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

    return {
      connection,
      async disconnect() {
        await connection.dispose();
        await input.dispose();
        await output.dispose();
      }
    };
  }

  async indexSymbols() {
    const symbols = [];

    const { connection, disconnect } = await this.connect();

    const filePathes = await globby(`${this.path}/${this.filePattern}`, {
      absolute: true,
      onlyFiles: true,
      deep: 20,
      case: false,
      ignore: this.ignoredPaths,
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
        (symbol.location = symbol.location || {}).uri = `file://${filePath}`;
        symbols.push({
          symbolID: makeSymbolID(symbol),
          ...symbol
        });
      }
    }

    // close the connection and exit
    await disconnect();

    return symbols;
  }

  async indexRefs(symbols) {
    const refs = [];
    const { connection, disconnect } = await this.connect();

    for (const symbol of symbols) {
      try {
        const range = symbol.selectionRange
          ? symbol.selectionRange
          : symbol.location.range;

        const refsRes = await getRefs(
          connection,
          symbol.location.uri,
          range.start
        );
        refsRes.forEach(ref =>
          refs.push({
            symbolID: symbol.symbolID,
            ...ref
          })
        );
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

    await disconnect();

    return refs;
  }
}

module.exports = Indexer;
