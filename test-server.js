const {
  createServerSocketTransport,
  createProtocolConnection,
  InitializeRequest,
  ReferencesRequest,
} = require('vscode-languageserver');

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

const run = () => new Promise((resolve, reject) => {

  const [input, output] = createServerSocketTransport(LANGUAGE_SERVER_PORT, 'utf-8');
  
  const connection = createProtocolConnection(input, output, console);
  connection.onError(err => {
    reject(err);
  });
  makeRequest(connection).then(resolve);
});

async function makeRequest(connection) {
  /*
  connection.onNotification((kind, { message }) =>
  console.log(`ℹ️  [${kind}] ${message}`)
  );
  */

  await connection.listen();

  console.log(`Waiting for response from localhost:${LANGUAGE_SERVER_PORT}...`);
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
      uri: `file://${__dirname}/experiment.js`
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

  await connection.dispose();
}

run().then(() => {
  console.log('✅  We got a response from the language server');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
