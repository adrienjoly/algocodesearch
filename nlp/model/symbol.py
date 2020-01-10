from utils import type_to_str


class Reference(object):
    def __init__(self, json):
        self.symbolID = json["symbolID"]
        self.uri = json["uri"]
        self.range = json["range"]
        self.line = json["line"]


class Symbol(object):
    def __init__(self, json, references):
        self.name = json["name"]
        self.ID = json["symbolID"]
        self.kindID = json["kind"]
        self.kind = type_to_str(self.kindID)
        self.references = [Reference(r) for r in references]

        self.container = json["containerName"] if "containerName" in json else None

        if "range" in json:
            self.range = json["range"]

    def __str__(self):
        return "%s [%s] -> %i references" % (self.name, self.ID, len(self.references))
