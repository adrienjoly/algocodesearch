/* global describe it expect */

const path = require('path');
const JavaScriptIndexer = require('./JavaScriptIndexer');
const GoIndexer = require('./GoIndexer');

const REL_REPO_PATH = "./test-repo";
const ABS_REPO_PATH = path.resolve(REL_REPO_PATH);

// NOTE: do not forget to run the right LSP server for the tests

describe('indexing a go file', () => {
  it('returns 1 symbol', async () => {
    const indexer = new GoIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();

    expect(symbols).toHaveLength(1);
  });

  it("lists 1 go file", async () => {
    const indexer = new GoIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    console.warn(symbols);
    expect(symbols[0].location.uri).toMatch(/\.go$/);
  });

  it("lists only go files", async () => {
    const indexer = new GoIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    expect(symbols.some(symbol => !symbol.location.uri.match(/\.go$/))).toBeFalsy();
  });
});

describe('indexing a javascript file', () => {

  it('should not allow relative paths', async () => {
    expect(() => new JavaScriptIndexer(REL_REPO_PATH)).toThrow();
  })

  it('should allow absolute paths', async () => {
    expect(() => new JavaScriptIndexer(ABS_REPO_PATH)).not.toThrow();
  })

  it('returns 1 symbol', async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();

    expect(symbols).toHaveLength(1);
  })

  it('should give IDs to symbols', async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();

    expect(symbols[0]).toHaveProperty('symbolID');
  })

  it('returns 2 refs to that symbol', async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);

    expect(refs).toHaveLength(2);
  })

  it('should reference symbolIDs in refs', async () => {
    const indexer = new JavaScriptIndexer(ABS_REPO_PATH);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);

    expect(refs[0]).toHaveProperty('symbolID');
  })

})
