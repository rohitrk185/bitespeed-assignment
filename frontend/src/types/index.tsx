export type TNode = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data?: {
    message: string;
  };
};

export type TEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  data?: Object;
};
