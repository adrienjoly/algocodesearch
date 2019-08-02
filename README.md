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

## WIP

* For one file of source code
    * Get all symbols
        * For each symbol, output a json record
        ```
        {
            "objectID": (hash of JSON)
            "name": "WorkspaceSymbolParams",
            "kind": 13,
            "location": {
                "uri": "file:///path/to/javascript-typescript-langserver/src/typescript-service.ts",
                "range": {
                    "start": {
                        "line": 62,
                        "character": 4
                    },
                    "end": {
                        "line": 62,
                        "character": 25
                    }
                }
            }
        }
        ```
    * For each symbol, get all references + definition
        * For each reference, output a json record
            ```
            {
                "uri": "file:///path/to/javascript-typescript-langserver/node_modules/%40types/lodash/common/lang.d.ts",
                "range": {
                    "start": {
                        "line": 11,
                        "character": 8
                    },
                    "end": {
                        "line": 11,
                        "character": 17
                    }
                }
            }
            ```