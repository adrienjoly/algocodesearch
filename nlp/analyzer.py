from functools import reduce
from typing import List

import gensim
from nltk import word_tokenize

from loader import load_symbols
# from nltk.tokenize import sent_tokenize, word_tokenize
# import warnings
from model.symbol import Symbol

WINDOW_SIZE = 5


class Analyzer(object):
    def __init__(self, symbols: List[Symbol]):
        self.symbols = symbols
        self.model = self.create_model(symbols)

    @staticmethod
    def create_model(symbols):
        print("%i symbols to analyze." % len(symbols))

        blacklist = ["{", "}", "?", ";", ":", "...", "$", "!", "+", "-", ",", ".", "#",
                     "new", "var", "let", "function", "for", "return", "in"]
        corpus = [r.line for r in reduce(list.__add__,
                                         [s.references for s in symbols])
                  ]

        data = []
        for line in corpus:
            tokens = word_tokenize(line)
            data.append([t for t in tokens if t not in blacklist])

        # Skip Gram model: Teach a neural network to predict a token given its context
        model = gensim.models.Word2Vec(data, min_count=1, size=100,
                                       window=WINDOW_SIZE, sg=1)
        return model

    def similarity(self, first, second):
        """
        Measure similarity between two tokens of the corpus.

        :return: A similarity index from 0 (unrelated) to 1 (identical).
        """
        return self.model.wv.similarity(first, second)

    def most_similar(self, symbol, nb_words=5):
        """
        Returns the top nb_words most similar to symbol.

        """
        return self.model.wv.most_similar(symbol, topn=nb_words)


if __name__ == '__main__':
    analyzer = Analyzer(load_symbols())

    for first in ["amount", "globalFormat"]:
        for second in ["currency", "locale"]:
            print("Cosine similarity between %s and %s: %.2f" %
                  (first, second, analyzer.similarity(first, second)))

    for word in ["Dinero", "amount", "export", ".lessThanOrEqual", "precision", "roundingMode"]:
        print("Words most similar to %s -> %s" % (
            word, [word for (word, freq) in analyzer.most_similar(word, nb_words=5)]))
