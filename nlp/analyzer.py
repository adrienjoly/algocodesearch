from functools import reduce

import gensim
from nltk import word_tokenize

from loader import load_symbols

# from nltk.tokenize import sent_tokenize, word_tokenize
# import warnings
WINDOW_SIZE = 5


def print_similarity(model, first, second, model_name):
    print("Cosine similarity for %s between %s and %s: %.2f" %
          (model_name, first, second, model.wv.similarity(first, second)))


def analyze(symbols):
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

    # CBOW model
    model_bag = gensim.models.Word2Vec(data, min_count=1,
                                       size=100, window=WINDOW_SIZE)
    # Skip Gram model
    model_skip = gensim.models.Word2Vec(data, min_count=1, size=100,
                                        window=WINDOW_SIZE, sg=1)
    # TODO: Choose which model works best for each task.
    #  Comparing similarity -> Skip gram seems to differentiate better
    #  Getting most similar tokens -> Skip gram too? Need to check with someone familiar with the Dinero.js codebase

    models = [(model_bag, "Bag of words"), (model_skip, "Skip Gram")]

    for model, model_name in models:
        for reference, values in {"amount": ["currency", "locale"]}.items():
            for value in values:
                print_similarity(model, reference, value, model_name)

        for word in ["Dinero", "amount", "export", ".lessThanOrEqual", "precision", "roundingMode"]:
            print("Most similar for %s: %s -> %s" % (
                model_name, word, [word for (word, freq) in model.wv.most_similar(word, topn=5)]))
        print("\n")


if __name__ == '__main__':
    analyze(load_symbols())
