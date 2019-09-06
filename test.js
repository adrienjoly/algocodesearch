describe('indexing a javascript file', () => {
  it('returns 1 symbol', () => {
    // write how we would love to code it
    const indexer = new JavaScriptIndexer("./test-repo");
    const symbols = indexer.indexSymbols();

    expect(symbols).toHaveLength(1);
  })

  it('returns 2 refs to that symbol', () => {
    // write how we would love to code it
    const indexer = new JavaScriptIndexer("./test-repo");
    const symbols = indexer.indexSymbols();
    const refs = indexer.indexRefs(symbols);

    expect(refs).toHaveLength(2);
  })
})
