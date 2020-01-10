import json


def type_to_str(t):
    types = {
        1: "File",
        2: "Module",
        3: "Namespace",
        4: "Package",
        5: "Class",
        6: "Method",
        7: "Property",
        8: "Field",
        9: "Constructor",
        10: "Enum",
        11: "Interface",
        12: "Function",
        13: "Variable",
        14: "Constant",
        15: "String",
        16: "Number",
        17: "Boolean",
        18: "Array",
        19: "Object",
        20: "Key",
        21: "Null",
        22: "EnumMember",
        23: "Struct",
        24: "Event",
        25: "Operator",
        26: "TypeParameter",
    }
    return types.get(t, "Default")

def load_symbols():
    with open("./dinero-index-symbols.json") as f:
        symbols = json.load(f)

    with open("./dinero-index-refs.json") as f:
        references = json.load(f)

    for symbol in symbols:
        name = symbol["name"]
        symbol_references = [r for r in references if r["symbolID"] == symbol["symbolID"]]
        print("References to %s:\n%s" % (name, "\n".join([r["line"] for r in symbol_references])))



if __name__ == '__main__':
    load_symbols()
