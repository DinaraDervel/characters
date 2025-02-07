import { useState, useEffect } from "react";
import styles from "./search.module.scss";
import Card from "../Card/Card";

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  url: string;
  created: string;
}

function Search() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Character[]>([]);

  useEffect(() => {
    if (query.length > 3) {
      fetch(`https://rickandmortyapi.com/api/character/?name=${query}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results || []))
        .catch(() => setResults([]));
    }
  }, [query]);

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          className={styles.search}
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search characters..."
        />
        {query.length > 3 && (
          <p className={styles.found}>Found characters: {results.length}</p>
        )}
      </div>
      {query.length > 3 && (
        <div className={styles.wrapper}>
          {results.map((item, index) => (
            <Card key={index} index={index} character={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
