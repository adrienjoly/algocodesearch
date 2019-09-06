import algoliasearch from 'algoliasearch/lite';
import React, { Component } from 'react';
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  Highlight,
} from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import './App.css';

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

const searchClient = algoliasearch(
  'JCRWDPUY5R',
  '1875a1c336d3d8d411bbb568d81578a4'
);

const secondClient = algoliasearch(
  'JCRWDPUY5R',
  '1875a1c336d3d8d411bbb568d81578a4'
);

const searchFct = searchClient.search.bind(searchClient);
searchClient.search = async requests => {
  const symbols = (await searchFct(requests)).results[0].hits;
  const symbolMap = symbols.reduce((names, symbol) => ({ ...names, [symbol.symbolID]: symbol }), {});
  const symbolIDs = symbols.map(symbol => symbol.symbolID);
  const filters = symbolIDs.map(symbolID => `symbolID:${symbolID}`).join(' OR ');
  console.log(filters);
  if (!filters) return { results: [ { hit: [] } ] };
  const refs = (await secondClient.search([
    {
      indexName: 'codesearch-refs',
      params: { filters },
    },
  ])).results[0].hits;
  return {
    results: [
      {
        hits: refs.map(hit => ({
          ...hit,
          name: symbolMap[hit.symbolID].name,
          kind: getHumanTypeForType(symbolMap[hit.symbolID].kind),
        })),
      },
    ],
  };
};

class App extends Component {
  render() {
    return (
      <div className="ais-InstantSearch">
        <h1>Code Search UI</h1>
        <p>Enter the name of a symbol below, e.g. repoUrl</p>
        <InstantSearch
          indexName="codesearch-symbols"
          searchClient={searchClient}
        >
          <SearchBox />
          <Hits hitComponent={Hit} />
          <Pagination />
        </InstantSearch>
      </div>
    );
  }
}

function Hit(props) {
  return (
    <div>
      <p className="hit-symbol">
        Reference to {props.hit.kind} "{props.hit.name}" ({props.hit.symbolID}):
      </p>
      <a className="hit-uri" href={props.hit.uri}>
        {props.hit.uri}
      </a>
      <p className="hit-loc-start">
        Starts at {JSON.stringify(props.hit.range.start)}
      </p>
      <p className="hit-loc-end">
        Ends at {JSON.stringify(props.hit.range.end)}
      </p>
    </div>
  );
}

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};

export default App;
