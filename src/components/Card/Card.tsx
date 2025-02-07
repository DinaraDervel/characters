import { Character } from "../Search/Search";
import styles from "./card.module.scss";

interface CardProps {
  index: number;
  character: Character;
}

export default function Card({ index, character }: CardProps) {
  const firstTwoStyle = (index === 0 || index === 1) && `${styles.firstTwo}`;
  const dateCreated = new Date(character.created);
  const statusRed = character.status === "Dead" && `${styles.redStatus}`;
  const statusGreen = character.status === "Alive" && `${styles.greenStatus}`;

  return (
    <div
      className={`${styles.card} ${firstTwoStyle}`}
      onClick={() => (window.location.href = character.url)}
    >
      <p className={styles.name}>
        {character.name} - {character.species}
      </p>
      <div className={styles.bottom}>
        <p>
          Status:{" "}
          <span className={`${styles.status} ${statusRed} ${statusGreen}`}>
            {character.status}
          </span>
        </p>
        <p>
          Created:{" "}
          <span>
            {dateCreated.getDate().toString().length > 1
              ? dateCreated.getDate()
              : "0" + dateCreated.getDate()}
            .{dateCreated.getMonth() + 1}.{dateCreated.getFullYear()}
          </span>
        </p>
      </div>
    </div>
  );
}
