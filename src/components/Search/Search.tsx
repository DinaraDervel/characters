import { useState, useEffect, useRef } from "react";
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

interface ApiResponse {
  info: { count: number; next: string | null };
  results: Character[];
}

function Search() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Character[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(0);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetching = useRef(false); // Флаг для предотвращения дублирующихся запросов

  // Загружаем запрос из localStorage при монтировании компонента
  useEffect(() => {
    const savedQuery = localStorage.getItem("query");
    if (savedQuery) {
      setQuery(savedQuery); // Восстанавливаем запрос
    }
  }, []);

  // Сохраняем запрос в localStorage при его изменении
  useEffect(() => {
    if (query.length > 3) {
      localStorage.setItem("query", query);
    }
  }, [query]);

  // Загружаем первую страницу при изменении запроса (если 4+ символа)
  useEffect(() => {
    if (query.length > 3) {
      setResults([]);
      setNextPage(
        `https://rickandmortyapi.com/api/character/?name=${query}&page=1`
      );
    } else {
      setResults([]);
      setNextPage(null);
      setFound(0);
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
        setNextPage(null);
        setFound(0);
        return;
      }
      setResults((prev) => [...prev, ...data.results]);
      setNextPage(data.info.next);
      setFound(data.info.count);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setNextPage(null);
      setFound(0);
    } finally {
      setLoading(false);
      isFetching.current = false; // Разрешаем новый запрос
    }
  };

  // Observer для подгрузки новых страниц
  useEffect(() => {
    if (!nextPage) return;

    if (observerRef.current) observerRef.current.disconnect(); // Убираем старый observer

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextPage) {
          fetchCharacters(nextPage);
        }
      },
      { rootMargin: "100px" }
    );

    if (observerTarget.current)
      observerRef.current.observe(observerTarget.current);

    return () => observerRef.current?.disconnect();
  }, [nextPage]);

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
          <p className={styles.found}>Found characters: {found}</p>
        )}
      </div>
      {query.length > 3 && (
        <div className={styles.wrapper}>
          {results.map((item, index) => (
            <Card key={item.id} index={index} character={item} />
          ))}
        </div>
      )}
      <div ref={observerTarget} style={{ height: 20 }} />{" "}
      {/* Следящий элемент */}
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default Search;
