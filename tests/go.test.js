/* global describe it expect */

const path = require("path");
const GoIndexer = require("../GoIndexer");

const REL_REPO_PATH = "./test-repo";
const ABS_REPO_PATH = path.resolve(REL_REPO_PATH);

// NOTE: do not forget to run the right LSP server for the tests

describe("indexing a go file", () => {
  it("should not allow relative paths", async () => {
    expect(() => new GoIndexer(REL_REPO_PATH)).toThrow();
  });

  it("should allow absolute paths", async () => {
    expect(() => new GoIndexer(ABS_REPO_PATH)).not.toThrow();
  });

  it("returns 1 symbol", async () => {
    const indexer = new GoIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();

    expect(symbols).toHaveLength(1);
  });

  it("lists 1 go file", async () => {
    const indexer = new GoIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    expect(symbols[0].location.uri).toMatch(/\.go$/);
  });

  it("lists only go files", async () => {
    const indexer = new GoIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    expect(
      symbols.some(symbol => !symbol.location.uri.match(/\.go$/))
    ).toBeFalsy();
  });
});
