/* global describe it expect */

const JavaScriptIndexer = require('./JavaScriptIndexer');

describe('indexing a javascript file', () => {

  it('should not allow relative paths', async () => {
    expect(() => new JavaScriptIndexer("./test-repo")).toThrow();
  })

  it('should allow absolute paths', async () => {
    expect(() => new JavaScriptIndexer(`${__dirname}/test-repo`)).not.toThrow();
  })

  it('returns 1 symbol', async () => {
    const indexer = new JavaScriptIndexer(`${__dirname}/test-repo`);
    const symbols = await indexer.indexSymbols();

    expect(symbols).toHaveLength(1);
  })

  it('should give IDs to symbols', async () => {
    const indexer = new JavaScriptIndexer(`${__dirname}/test-repo`);
    const symbols = await indexer.indexSymbols();

    expect(symbols[0]).toHaveProperty('symbolID');
  })

  it('returns 2 refs to that symbol', async () => {
    const indexer = new JavaScriptIndexer(`${__dirname}/test-repo`);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);

    expect(refs).toHaveLength(2);
  })

  it('should reference symbolIDs in refs', async () => {
    const indexer = new JavaScriptIndexer(`${__dirname}/test-repo`);
    const symbols = await indexer.indexSymbols();
    const refs = await indexer.indexRefs(symbols);

    expect(refs[0]).toHaveProperty('symbolID');
  })

})
