import cn from "classnames";
import { useTranslation } from "react-i18next";

import { formatDate, colorExtension } from "../../../../utils";

import styles from "./Row.module.css";

interface IRowProps {
  data?: any;
  onEventClick?: any;
  addEvent?: any;
  isLast?: any;
}

const Row = (props: IRowProps) => {
  const { data, onEventClick, addEvent, isLast, ...others } = props;
  const { t } = useTranslation();
  return (
    <section className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      <div>
        {formatDate(data.date) ? ( // try to parse as date, otherwise render as is
          <time className={styles.date} dateTime={data.date.slice(1, -1)}>
            {formatDate(data.date)}
          </time>
        ) : (
          <div className={styles.date}>{data.date}</div>
        )}
        <div
          className={styles.add}
          title={t("line.button.add")}
          onClick={() => addEvent(data.date, data.events.length + 1)}
        >
          +
        </div>
        <div className={styles.content}>
          <div className={styles.stars}>
            {data.events.map((event: any, index: number) => (
              <button
                className={styles.star}
                style={{ backgroundColor: colorExtension(event) }}
                type="button"
                onClick={() => onEventClick(event, index + 1)}
                title={event?.FILE_PATH}
                id={event?.UUID}
                key={event}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Row;
