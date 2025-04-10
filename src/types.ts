export interface Card {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  order: number;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  backgroundColor: string;
  lists: List[];
}

export interface BoardStore {
  boards: Board[];
  currentBoard: string;
  addBoard: (title: string) => void;
  setCurrentBoard: (id: string) => void;
  updateBoardBackground: (id: string, color: string) => void;
  addList: (boardId: string, title: string) => void;
  updateListTitle: (boardId: string, listId: string, title: string) => void;
  addCard: (boardId: string, listId: string, title: string) => void;
  updateCard: (boardId: string, listId: string, cardId: string, updates: Partial<Card>) => void;
  toggleCardCheck: (boardId: string, listId: string, cardId: string) => void;
  deleteCard: (boardId: string, listId: string, cardId: string) => void;
  reorderCard: (boardId: string, source: { listId: string; index: number }, destination: { listId: string; index: number }) => void;
}