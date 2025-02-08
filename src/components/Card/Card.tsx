import { Character } from "../Search/Search";
import styles from "./card.module.scss";

interface CardProps {
  index: number;
  character: Character;
}

function formatDate(date: Date) {
  return `${
    date.getDate().toString().length > 1 ? date.getDate() : "0" + date.getDate()
  }.${
    date.getMonth() + 1 > 9
      ? date.getMonth() + 1
      : "0" + Number(date.getMonth() + 1)
  }.${date.getFullYear()}`;
}

export default function Card({ index, character }: CardProps) {
  const firstTwoStyle = index === 0 || index === 1 ? `${styles.firstTwo}` : "";
  const dateCreated = new Date(character.created);
  const statusDead = character.status === "Dead" ? `${styles.dead}` : "";
  const statusAlive = character.status === "Alive" ? `${styles.alive}` : "";

  return (
    <div
      className={`${styles.card} ${firstTwoStyle}`}
      onClick={() => (window.location.href = character.url)}
    >
      <p className={styles.cardTop}>
        {character.name} - {character.species}
      </p>
      <div className={styles.cardBottom}>
        <p>
          Status:{" "}
          <span className={`${styles.status} ${statusDead} ${statusAlive}`}>
            {character.status}
          </span>
        </p>
        <p>
          Created: <span>{formatDate(dateCreated)}</span>
        </p>
      </div>
    </div>
  );
}
