const {
  createServerSocketTransport,
  createProtocolConnection,
  InitializeRequest,
  ReferencesRequest,
  DocumentSymbolRequest,
  DefinitionRequest,
} = require('vscode-languageserver');

const repodir = "/Users/jeromeschneider/Code/Js/javascript-typescript-langserver";
const repofile = `${repodir}/src/typescript-service.ts`;

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
  console.log({ initRes });

  const symbolRes = await connection.sendRequest(DocumentSymbolRequest.type, {
    textDocument: {
      uri: `file://${repofile}`
    }
  });
  // console.log('=>', JSON.stringify(symbolRes, null, 2));

  // symbolRes.map(o => console.log(o.name));

  const firstSymbol = symbolRes[1];
  // console.log(JSON.stringify(firstSymbol, null, 2));

  const refsRes = await connection.sendRequest(ReferencesRequest.type, {
    textDocument: {
      uri: `file://${repofile}`
    },
    position: firstSymbol.location.range.start,
    context: {
      includeDeclaration: true
    }
  });
  console.log(JSON.stringify(refsRes, null, 2));

  const defRes = await connection.sendRequest(DefinitionRequest.type, {
    textDocument: {
      uri: `file://${repofile}`
    },
    position: firstSymbol.location.range.start,
  });
  console.log(JSON.stringify(defRes, null, 2));

  // close the connection and exit
  await connection.dispose();
  process.exit(0);

})();
