import { useCallback, useEffect, useRef, type FC } from 'react';
import type { CardProp } from './types';
import styles from './index.module.scss';

const TaskCard: FC<CardProp> = ({ assignee, description, name, reporter, id, onDragStart }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const toggleClass = useCallback((e: DragEvent) => {
    e.dataTransfer?.setData('id', id);
    ref.current?.classList.toggle(styles.dragging);
    ref.current?.classList.toggle('dragging');
  }, []);
  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('dragstart', toggleClass);
      ref.current.addEventListener('dragend', toggleClass);
      return () => {
        ref.current?.removeEventListener('dragstart', toggleClass);
        ref.current?.removeEventListener('dragend', toggleClass);
      };
    }
  }, []);
  return (
    <div onDragStart={onDragStart} id={id} ref={ref} className={`${styles.cardContainer} taskCard`} draggable="true">
      <div className={styles.row_1}>{name}</div>
      <div className={styles.row_2}>{description}</div>
      <div className={styles.row_3}>
        <div>{reporter}</div>
        <div>{assignee}</div>
      </div>
    </div>
  );
};

export default TaskCard;
