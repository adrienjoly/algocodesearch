const Indexer = require("./Indexer");

class JavaScriptIndexer {
  constructor(repoPath) {
    this.indexer = new Indexer(repoPath, {
      filePattern: "**/*.js",
      ignoredPaths: ["**/node_modules"]
    });
  }

  async indexSymbols() {
    return await this.indexer.indexSymbols();
  }

  async indexRefs(symbols) {
    return await this.indexer.indexRefs(symbols);
  }
}

module.exports = JavaScriptIndexer;
