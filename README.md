# algocodesearch

Off-sprint project that intends to index symbols from a language server (LSP), for code search.

Try the resulting Code Seach UI: https://codesandbox.io/s/ais-ecommerce-demo-app-580me.

## Vision

Do better than GitHub to discover and explore a codebase.

Use cases:
- find that user-identification API call by just typing "user", and then exploring
- share a tutorial on how a particular sequence of actions is being run in the code
- find insights about how symbols are spread in your codebase, to help you refactor

## How to use the back-end

- Launch the Language Server in one terminal:

**JavaScript/TypeScript**

```sh
$ git clone https://github.com/sourcegraph/javascript-typescript-langserver.git
$ cd javascript-typescript-langserver
$ npm install
$ npm run build
$ node lib/language-server --trace
```

**Go**

# Install https://github.com/golang/tools/tree/master/gopls
$ gopls -v serve -rpc.trace --port 2089 --debug=localhost:6060 -logfile /tmp/log.log -listen 127.0.0.1:2089

- Run the client in a separate terminal:

```sh
$ git clone https://github.com/adrienjoly/algocodesearch.git
$ cd algocodesearch
$ npm install
$ npm run test:js # with js lsp running
$ npm run test:go # with go lsp running
```

This should send a LSP request to the server and print the response to stdout.

- Index a directory that contains JS source code

```sh
# git clone https://github.com/adrienjoly/algocodesearch.git
# cd algocodesearch
# npm install
$ node indexing.js ../my-js-project/ "output-file-prefix"
# => will generate output-file-prefix-index-symbols.json and output-file-prefix-index-refs.json
```

- Then you can import these 2 files into Algolia indices


## WIP / Next Steps

* UI ([webapp-v2 on codesandbox](https://codesandbox.io/s/objective-wing-zxn8j))
  * add a button to go back to root/home page
  * add breadcrumbs: go beyond grouping by file, also add name of class and function/method, and make them clickable (i.e. broadening the scope by going up the tree)
  * allow each symbol or reference from the `text` property to be clickable (i.e. horizontal nagivation)
  * allow search/filtering of refs after clicking on a symbol, or disable the search bar
  * support more than one step on a same page, like Jupyter notebooks
  * make the URL persistent (for all steps), in order to be able to share the steps
  * make sure that steps will persist by snapshoting the commit id of each result
  * make the UI look better 😎
  * try with actual data from the indexer, even by importing JSON directly to the UI code

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
