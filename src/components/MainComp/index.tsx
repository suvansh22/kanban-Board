import TaskCard from '../TaskCard';
import { mockData } from '../TaskCard/mockData';
import type { TaskDataType } from '../dataTypes/taskDataType';
import styles from './index.module.scss';
import { useCallback, useEffect, useState, type FC } from 'react';

type Tasks = {
  todo: TaskDataType[];
  inProgress: TaskDataType[];
  done: TaskDataType[];
};

type Lanes = 'todo' | 'inProgress' | 'done';

const statusDetails = [
  {
    id: 'todo',
    title: 'Todo',
    className: styles.status_1,
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    className: styles.status_2,
  },
  {
    id: 'done',
    title: 'Done',
    className: styles.status_3,
  },
];

const MainComp: FC = () => {
  const [tasks, setTasks] = useState<Tasks>({ todo: [], inProgress: [], done: [] });

  const getTask = useCallback(() => {
    const localTasks: Tasks = {
      todo: [],
      inProgress: [],
      done: [],
    };
    localTasks.todo = mockData.filter((item) => item.statusCode === 0);
    localTasks.inProgress = mockData.filter((item) => item.statusCode === 1);
    localTasks.done = mockData.filter((item) => item.statusCode === 2);
    setTasks(localTasks);
  }, []);

  const updateTasks = useCallback((updatedTasks: Tasks) => {
    setTasks(updatedTasks);
  }, []);

  useEffect(() => {
    getTask();
  }, [getTask]);

  return (
    <div className={styles.mainWrapper}>
      {statusDetails.map((item) => (
        <Temp
          id={item.id as Lanes}
          title={item.title}
          className={item.className}
          tasks={tasks}
          updateTasks={updateTasks}
        />
      ))}
    </div>
  );
};

type Props = {
  id: Lanes;
  title: string;
  className: string;
  tasks: Tasks;
  updateTasks: (updatedTasks: Tasks) => void;
};

const Temp = ({ id, title, className, tasks, updateTasks }: Props) => {
  const insertAboveTask = useCallback((e: React.DragEvent<HTMLDivElement>, clientY: number): Element | null => {
    const notSelectedTask = e.currentTarget.querySelectorAll('.taskCard:not(.dragging)');
    let closestEle: Element | null = null;
    let closestDist: number = Number.NEGATIVE_INFINITY;
    notSelectedTask.forEach((ele: Element) => {
      const { top } = ele.getBoundingClientRect();
      const offsetDist = clientY - top;
      if (offsetDist < 0 && offsetDist > closestDist) {
        closestEle = ele;
        closestDist = offsetDist;
      }
    });
    return closestEle;
  }, []);

  const popTask = useCallback(
    (id: string, currentLane: Lanes, droppenLane: Lanes, closestTaskId: string | null) => {
      let taskObj: TaskDataType | null = null;
      const currentTasks = tasks[currentLane];
      const droppedLaneTasks = tasks[droppenLane];
      currentTasks.forEach((item, index) => {
        if (item.id === id) {
          taskObj = item;
          currentTasks.splice(index, 1);
          return;
        }
      });
      if (closestTaskId && taskObj) {
        for (let i = 0; i < droppedLaneTasks.length; i++) {
          if (closestTaskId === droppedLaneTasks[i].id) {
            droppedLaneTasks.splice(i, 0, taskObj);
            break;
          }
        }
      }
      return [currentTasks, droppedLaneTasks];
    },
    [tasks],
  );

  const dragDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const [taskIdString, currentLaneString] = e.dataTransfer.getData('text/plain').split('-');
      const currentLane = currentLaneString as Lanes;
      const droppedLane = e.currentTarget.id as Lanes;
      const bottomTask = insertAboveTask(e, e.clientY);
      const [currentTasks, droppedLaneTasks] = popTask(taskIdString, currentLane, droppedLane, bottomTask?.id || null);
      if (droppedLane === currentLane) {
        updateTasks({
          ...tasks,
          [currentLane]: currentTasks,
        });
      } else {
        updateTasks({
          ...tasks,
          [droppedLane]: droppedLaneTasks,
          [currentLane]: currentTasks,
        });
      }
    },
    [insertAboveTask, popTask, tasks, updateTasks],
  );

  const dragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', `${e.currentTarget.id}-${e?.currentTarget?.parentElement?.id}`);
  }, []);

  const dragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div id={id} className={className} onDrop={dragDrop} onDragOver={dragOver}>
      <span>{title}</span>
      {tasks[id].length > 0 &&
        tasks[id].map((item) => (
          <TaskCard
            assignee={item.assignee}
            description={item.description}
            key={item.id}
            name={item.name}
            reporter={item.reporter}
            id={item.id}
            onDragStart={dragStart}
          />
        ))}
    </div>
  );
};

export default MainComp;
