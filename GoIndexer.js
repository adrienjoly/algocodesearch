const Indexer = require("./Indexer");

class GoIndexer {
  constructor(repoPath) {
    this.indexer = new Indexer(repoPath, {
      filePattern: "**/*.go",
      ignoredPaths: ["**/vendor"]
    });
  }

  async indexSymbols() {
    return await this.indexer.indexSymbols();
  }

  async indexRefs(symbols) {
    return await this.indexer.indexRefs(symbols);
  }
}

module.exports = GoIndexer;
