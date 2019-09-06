# algocodesearch

Off-sprint project that intends to index symbols from a language server (LSP), for code search.

Try the resulting Code Seach UI: https://codesandbox.io/s/ais-ecommerce-demo-app-580me.

## How to use the back-end

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
$ npm run test:server
```

This should send a LSP request to the server and print the response to stdout.

- Index a directory that contains JS source code

```sh
# git clone https://github.com/adrienjoly/algocodesearch.git
# cd algocodesearch
# npm install
$ node indexing.js ../my-js-project/
# => will generate index-symbols.json and index-refs.json
```

- Then you can import these 2 files into Algolia indices


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
