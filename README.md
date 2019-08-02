# algocodesearch

Off-sprint project that intends to index symbols from a language server (LSP), for code search.

## how to use

- Launch the Language Server in one terminal:

```sh
$ git clone https://github.com/sourcegraph/javascript-typescript-langserver.git
$ cd javascript-typescript-langserver
$ npm install
$ npm run build
$ node lib/language-server --trace
```

- Run the client in a separate terminal:

```sh
$ git clone https://github.com/adrienjoly/algocodesearch.git
$ cd algocodesearch
$ npm install
$ npm test
```

This should send a LSP request to the server and print the response to stdout.
