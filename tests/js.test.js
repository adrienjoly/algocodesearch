/* global describe it expect */

const path = require("path");
const JavaScriptIndexer = require("../JavaScriptIndexer");

const REL_REPO_PATH = "./test-repo";
const ABS_REPO_PATH = path.resolve(REL_REPO_PATH);

// NOTE: do not forget to run the right LSP server for the tests

describe("indexing a javascript file", () => {
  it("should not allow relative paths", async () => {
    expect(() => new JavaScriptIndexer(REL_REPO_PATH)).toThrow();
  });

  it("should allow absolute paths", async () => {
    expect(() => new JavaScriptIndexer(ABS_REPO_PATH)).not.toThrow();
  });

  it("returns 1 symbol", async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();

    expect(symbols).toHaveLength(1);
  });

  it("should give IDs to symbols", async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();

    expect(symbols[0]).toHaveProperty("symbolID");
  });

  it("returns 2 refs to that symbol", async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);

    expect(refs).toHaveLength(2);
  });

  it("should reference symbolIDs in refs", async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);

    expect(refs[0]).toHaveProperty("symbolID");
  });

  it("should have matching symbolIDs", async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);
    const { symbolID } = symbols[0];
    
    expect(symbols[0].symbolID).toBeTruthy();
    expect(refs[0].symbolID).toBeTruthy();
    expect(refs.find(ref => ref.symbolID === symbolID)).toBeTruthy();
  });
});
