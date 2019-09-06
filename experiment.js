const {
  createServerSocketTransport,
  createProtocolConnection,
  InitializeRequest,
  ReferencesRequest,
} = require('vscode-languageserver');

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

(async () => {

  const [input, output] = createServerSocketTransport(LANGUAGE_SERVER_PORT, 'utf-8');
  //output.write({ jsonrpc: 'hello' });

  const connection = await createProtocolConnection(input, output, console);

  connection.onNotification((kind, { message }) =>
    console.log(`ℹ️  [${kind}] ${message}`)
  );

  await connection.listen();

  const initRes = await connection.sendRequest(InitializeRequest.type, {
    rootUri: `file://${__dirname}`, // current directory
    processId: 1,
    capabilities: {},
    workspaceFolders: null,
    trace: "verbose"
  });
  console.log({ initRes });

  const refsRes = await connection.sendRequest(ReferencesRequest.type, {
    textDocument: {
      uri: `file://${__dirname}/test.js`
    },
    position: {
      line: 1, // starts at zero
      character: 4 // starts at zero
    },
    context: {
      includeDeclaration: true
    }
  });
  console.log('=>', JSON.stringify(refsRes, null, 2));

  // close the connection and exit
  await connection.dispose();
  process.exit(0);

})();
