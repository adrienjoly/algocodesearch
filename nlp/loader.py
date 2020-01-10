import json

from model.symbol import Symbol


def load_symbols():
    symbols = []

    with open("./dinero-index-symbols.json") as f:
        symbolsJSON = json.load(f)

    with open("./dinero-index-refs.json") as f:
        references = json.load(f)

    for s in symbolsJSON:
        symbol_references = [r for r in references if r["symbolID"] == s["symbolID"]]
        symbol = Symbol(s, symbol_references)
        symbols.append(symbol)

    return [s for s in sorted(symbols, key=lambda s1: len(s1.references), reverse=True)]


if __name__ == '__main__':
    load_symbols()
