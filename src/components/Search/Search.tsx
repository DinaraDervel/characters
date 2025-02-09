import { useState, useEffect, useRef } from "react";
import styles from "./search.module.scss";
import Card from "../Card/Card";

const MIN_SEARCH_LENGTH = 4;

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  url: string;
  created: string;
}

interface ApiResponse {
  info: { count: number; next: string | null };
  results: Character[];
}

function Search() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Character[]>([]);
  const [nextPageURL, setNextPageURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetching = useRef(false);

  // Загружаем запрос из localStorage при монтировании компонента
  useEffect(() => {
    const savedQuery = localStorage.getItem("query");
    if (savedQuery) {
      setQuery(savedQuery);
    }
  }, []);

  // Сохраняем запрос в localStorage при его изменении
  useEffect(() => {
    if (query.length >= MIN_SEARCH_LENGTH) {
      localStorage.setItem("query", query);
    }
  }, [query]);

  // Загружаем первую страницу при изменении запроса (если 4+ символа)
  useEffect(() => {
    if (query.length >= MIN_SEARCH_LENGTH) {
      setResults([]);
      setNextPageURL(
        `https://rickandmortyapi.com/api/character/?name=${query}&page=1`
      );
    } else {
      setResults([]);
      setNextPageURL(null);
      setResultsCount(0);
    }
  }, [query]);

  // Функция загрузки данных
  const fetchCharacters = async (url: string) => {
    if (!url || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      if (!data.results) {
        setNextPageURL(null);
        setResultsCount(0);
        return;
      }
      setResults((prev) => [...prev, ...data.results]);
      setNextPageURL(data.info.next);
      setResultsCount(data.info.count);
    } catch (error) {
      console.error("Ошибка загрузки.", error);
      setNextPageURL(null);
      setResultsCount(0);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Observer для подгрузки новых страниц
  useEffect(() => {
    if (!nextPageURL) return;

    if (observerRef.current) observerRef.current.disconnect(); // Убираем старый observer

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchCharacters(nextPageURL);
        }
      },
      { rootMargin: "100px" }
    );

    if (observerTarget.current)
      observerRef.current.observe(observerTarget.current);

    return () => observerRef.current?.disconnect();
  }, [nextPageURL]);

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
        {query.length >= MIN_SEARCH_LENGTH && (
          <p className={styles.resultsCount}>
            Found characters: {resultsCount}
          </p>
        )}
      </div>
      {query.length >= MIN_SEARCH_LENGTH && (
        <div className={styles.cardWrapper}>
          {results.map((item, index) => (
            <Card key={item.id} index={index} character={item} />
          ))}
        </div>
      )}
      <div ref={observerTarget} style={{ height: 20 }} />
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default Search;
