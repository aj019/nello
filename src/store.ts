import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, BoardStore, Card } from './types';

const useStore = create<BoardStore>()(
  persist(
    (set) => ({
      boards: [],
      currentBoard: '',

      addBoard: (title) =>
        set((state) => ({
          boards: [...state.boards, { id: crypto.randomUUID(), title, backgroundColor: '#f0f0f0', lists: [] }],
        })),

      setCurrentBoard: (id) => set({ currentBoard: id }),

      updateBoardBackground: (id, color) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id ? { ...board, backgroundColor: color } : board
          ),
        })),

      addList: (boardId, title) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? { ...board, lists: [...board.lists, { id: crypto.randomUUID(), title, cards: [] }] }
              : board
          ),
        })),

      updateListTitle: (boardId, listId, title) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  lists: board.lists.map((list) =>
                    list.id === listId ? { ...list, title } : list
                  ),
                }
              : board
          ),
        })),

      addCard: (boardId, listId, title) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  lists: board.lists.map((list) =>
                    list.id === listId
                      ? {
                          ...list,
                          cards: [
                            ...list.cards,
                            {
                              id: crypto.randomUUID(),
                              title,
                              description: '',
                              checked: false,
                              order: list.cards.length,
                            },
                          ],
                        }
                      : list
                  ),
                }
              : board
          ),
        })),

      updateCard: (boardId, listId, cardId, updates) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  lists: board.lists.map((list) =>
                    list.id === listId
                      ? {
                          ...list,
                          cards: list.cards.map((card) =>
                            card.id === cardId ? { ...card, ...updates } : card
                          ),
                        }
                      : list
                  ),
                }
              : board
          ),
        })),

      toggleCardCheck: (boardId, listId, cardId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  lists: board.lists.map((list) =>
                    list.id === listId
                      ? {
                          ...list,
                          cards: [
                            ...list.cards
                              .map((card) =>
                                card.id === cardId
                                  ? { ...card, checked: !card.checked }
                                  : card
                              )
                              .sort((a, b) => {
                                if (a.checked === b.checked) return a.order - b.order;
                                return a.checked ? 1 : -1;
                              }),
                          ],
                        }
                      : list
                  ),
                }
              : board
          ),
        })),

      deleteCard: (boardId, listId, cardId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  lists: board.lists.map((list) =>
                    list.id === listId
                      ? {
                          ...list,
                          cards: list.cards.filter((card) => card.id !== cardId),
                        }
                      : list
                  ),
                }
              : board
          ),
        })),

      reorderCard: (boardId, source, destination) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  lists: board.lists.map((list) => {
                    if (list.id === source.listId) {
                      const cards = [...list.cards];
                      const [removed] = cards.splice(source.index, 1);
                      if (list.id === destination.listId) {
                        cards.splice(destination.index, 0, removed);
                        return { ...list, cards };
                      }
                      return { ...list, cards };
                    }
                    if (list.id === destination.listId) {
                      const sourceList = board.lists.find((l) => l.id === source.listId);
                      if (!sourceList) return list;
                      const [moved] = sourceList.cards.splice(source.index, 1);
                      const cards = [...list.cards];
                      cards.splice(destination.index, 0, moved);
                      return { ...list, cards };
                    }
                    return list;
                  }),
                }
              : board
          ),
        })),
    }),
    {
      name: 'trello-board-storage',
    }
  )
);

export default useStore;