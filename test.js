const { createServerSocketTransport, createProtocolConnection, InitializeRequest } = require('vscode-languageserver');

const LANGUAGE_SERVER_PORT = 2089; // e.g. javascript-typescript-langserver

(async () => {

  const [ input, output ] = createServerSocketTransport(LANGUAGE_SERVER_PORT, 'utf-8');
  //output.write({ jsonrpc: 'hello' });

  const connection = await createProtocolConnection(input, output, console);

  connection.onNotification((kind, { message }) =>
    console.log(`ℹ️  [${kind}] ${message}`)
  );

  await connection.listen();

  const initRes = await connection.sendRequest(InitializeRequest.type, {
    rootUri: 'file:///home/dirkb',
    processId: 1,
    capabilities: {},
    workspaceFolders: null,
  });
  console.log({ initRes });

  // close the connection and exit
  await connection.dispose();
  process.exit(0);

})();
