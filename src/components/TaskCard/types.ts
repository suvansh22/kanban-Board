export type CardProp = {
  name: string;
  description: string;
  assignee: string;
  reporter: string;
  id: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
};
