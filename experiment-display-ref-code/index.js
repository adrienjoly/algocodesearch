async function app() {
    const symbols = await fetch("symbols.json").then(res => res.json());
    const refs = await fetch("refs.json").then(res => res.json());

    // console.log(symbols, refs);

    const foundSymbols = searchSymbol(symbols, "str");
    const foundRefs = searchRefs(refs, foundSymbols.map(s => s.symbolID));
    console.log(displayRef(symbols, refs, foundRefs[0]));
}

function searchSymbol(symbols, keyword) {
    const matches = [];
    for(const symbol of symbols) {
        if (symbol.name === keyword) {
            matches.push(symbol);
        }
    }

    return matches;
}

function getSymbolBySymbolID(symbols, id) {
    for(const symbol of symbols) {
        if (symbol.symbolID === id) {
            return symbol;
        }
    }

    throw new Error("getSymbolBySymbolID: Could not find symbol for id \"" + id + "\"");
}

function searchRefs(refs, symbolIDs) {
    const matches = [];
    for(const ref of refs) {
        if (symbolIDs.includes(ref.symbolID)) {
            matches.push(ref);
        }
    }

    return matches;
}

function displayRef(symbols, refs, ref) {
    const symbol = getSymbolBySymbolID(symbols, ref.symbolID);
    // console.log(symbols, refs, ref);
    // console.log("Symbol", symbol);

    const displayLines = 5;
    const nbLinesAbove = Math.floor((displayLines - 1) / 2);
    let beginLine = (ref.range.start.line) <= nbLinesAbove ? 0 : ref.range.start.line - nbLinesAbove;
    let endLine = beginLine + displayLines - 1;

    const refsBetweenLines = getRefsBetweenLines(refs, ref.uri, beginLine, endLine);
    const reconstitutedCode = getCodeFromRefs(refsBetweenLines, beginLine, displayLines);

    return {
        kind: getHumanTypeForType(symbol.kind),
        name: symbol.name,
        file: ref.uri,
        code: ref.line,
        line: ref.range.start.line,
        beginLine: beginLine,
        endLine: endLine,
        neighbourRefs: refsBetweenLines,
        neighbourCode: reconstitutedCode,
    }
}

function getRefsBetweenLines(refs, uri, beginLine, endLine) {
    const matchingRefs = [];

    for (const ref of refs) {
        if (ref.uri !== uri) continue;
        if (ref.range.start.line < beginLine || ref.range.start.line > endLine) continue;
        matchingRefs.push(ref);
    }

    return matchingRefs;
}

function getCodeFromRefs(refsSubset, firstLine, nbLines) {
    const code = new Array(nbLines);
    for(let i = 0; i < nbLines; i++) code[i] = "";
    for (let ref of refsSubset) {
        code[ref.range.start.line - firstLine] = ref.line;
    }

    return code;
}

function getHumanTypeForType(t) {
    switch(t) {
        case 1: return "File";
        case 2: return "Module";
        case 3: return "Namespace";
        case 4: return "Package";
        case 5: return "Class";
        case 6: return "Method";
        case 7: return "Property";
        case 8: return "Field";
        case 9: return "Constructor";
        case 10: return "Enum";
        case 11: return "Interface";
        case 12: return "Function";
        case 13: return "Variable";
        case 14: return "Constant";
        case 15: return "String";
        case 16: return "Number";
        case 17: return "Boolean";
        case 18: return "Array";
        case 19: return "Object";
        case 20: return "Key";
        case 21: return "Null";
        case 22: return "EnumMember";
        case 23: return "Struct";
        case 24: return "Event";
        case 25: return "Operator";
        case 26: return "TypeParameter";
        default: return "Unknown";
    }
}

app();
