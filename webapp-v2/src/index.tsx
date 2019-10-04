import * as React from "react";
import { render } from "react-dom";

import "./styles.css";

const step2SymbolID = "userLitteral";

interface Hit {
  file: string;
  text: string;
  anchor?: string;
  symbolID?: string;
  symbolKind?: string;
  symbolName?: string;
}

interface SearchProvider {
  search: (query: string, symbolID?: string) => Hit[];
}

const STEP2_RECORDS: Array<Hit> = [
  {
    file: "api.js",
    text: 'const res = sendGET("/api/users", {',
    anchor: "https://github.com/algolia/crawler",
    symbolID: step2SymbolID,
    symbolKind: "litteral",
    symbolName: '"/api/users"'
  },
  {
    file: "api.js",
    text: 'sendPOST("/api/users/login", {',
    anchor: "https://github.com/algolia/crawler",
    symbolID: step2SymbolID,
    symbolKind: "litteral",
    symbolName: '"/api/users"'
  }
];

const ALL_RECORDS: Array<Hit> = [
  ...STEP2_RECORDS,
  {
    file: "loop.js",
    text: "class User {",
    symbolID: "classUser",
    symbolKind: "class",
    symbolName: "User"
  },
  {
    file: "loop.js",
    text: "const u = new User(data);",
    symbolID: "classUser",
    symbolKind: "class",
    symbolName: "User"
  },
  {
    file: "loop.js",
    text: "export default User;",
    symbolID: "classUser",
    symbolKind: "class",
    symbolName: "User"
  },
  {
    file: "api.js",
    text: "const user = {};",
    symbolID: "varUser",
    symbolKind: "variable",
    symbolName: "user"
  },
  {
    file: "api.js",
    text: "console.log(user);",
    symbolID: "varUser",
    symbolKind: "variable",
    symbolName: "user"
  }
];

function App({ searchProvider }: { searchProvider: SearchProvider }) {
  return (
    <div className="App">
      <Step searchProvider={searchProvider} searchQuery="user" />
      <hr />
    </div>
  );
}

function Step({
  searchProvider,
  searchQuery
}: {
  searchProvider: SearchProvider;
  searchQuery: string;
}) {
  const [query, setQuery] = React.useState(searchQuery);
  const [hits, setHits] = React.useState([]);

  React.useEffect(() => {
    const symbolID = document.location.pathname.replace(/^\//, "");
    setHits(searchProvider.search(query, symbolID));
  }, [query, searchProvider]);

  return (
    <>
      <Search searchQuery={query} onSearch={setQuery} />
      <Results hits={hits} />
    </>
  );
}

function Search({
  searchQuery,
  onSearch
}: {
  searchQuery: string;
  onSearch: Function;
}) {
  return (
    <input
      type="text"
      placeholder="Type a symbol"
      value={searchQuery}
      onChange={e => onSearch(e.currentTarget.value)}
    />
  );
}

function Results({ hits }: { hits: Array<Hit> }) {
  const groupedHits = hits.reduce((acc, hit) => {
    acc[hit.file] = acc[hit.file] || [];
    acc[hit.file].push(hit);
    return acc;
  }, {});
  return (
    <>
      {Object.values(groupedHits).map(hits => (
        <HitGroup hits={hits} />
      ))}
    </>
  );
}

function HitGroup({ hits }: { hits: Hit[] }) {
  if (!hits.length) return;
  return (
    <>
      <h2>{hits[0].file}</h2>
      {hits.map(hit => (
        <Hit hit={hit} />
      ))}
    </>
  );
}

function Hit({ hit }) {
  return (
    <p>
      <a href={hit.anchor}>{hit.text}</a>
    </p>
  );
}

const rootElement = document.getElementById("root");
const provider: SearchProvider = {
  search: (query: string, symbolID?: string) => {
    // if (symbolID === step2SymbolID) return STEP2_RECORDS;

    if (symbolID) {
      // TODO: also filter by searchQuery
      return ALL_RECORDS.filter(record => record.symbolID === symbolID);
    }

    // let's mock a search
    const hits = ALL_RECORDS.filter(
      (record: Hit) =>
        record.text.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );

    const aggregatedHits = hits.reduce((acc: {}, hit: Hit) => {
      acc[hit.symbolID] = acc[hit.symbolID] || [];
      acc[hit.symbolID].push(hit);
      return acc;
    }, {});

    const renderedHits = Object.values(aggregatedHits).map((hits: Hit[]) => {
      return {
        file: hits[0].file,
        text: `${hits[0].symbolKind} ${hits[0].symbolName}: ${
          hits.length
        } ref(s)`,
        anchor: `${hits[0].symbolID}`
      };
    });
    return renderedHits;
  }
};
render(<App searchProvider={provider} />, rootElement);
