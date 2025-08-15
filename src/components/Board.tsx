import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, Settings } from 'lucide-react';
import List from './List';
import Modal from './Modal';
import { Board as BoardType } from '../types';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface BoardProps {
  board: BoardType;
  onUpdateBoard: (updates: Partial<BoardType>) => void;
  onAddList: (boardId: string, title: string) => void;
  onUpdateList: (boardId: string, listId: string, title: string) => void;
  onDeleteList: (boardId: string, listId: string) => void;
  onAddCard: (boardId: string, listId: string, title: string) => void;
  onUpdateCard: (boardId: string, listId: string, cardId: string, updates: any) => void;
  onDeleteCard: (boardId: string, listId: string, cardId: string) => void;
  onToggleCardCheck: (boardId: string, listId: string, cardId: string) => void;
  onReorderCard: (
    boardId: string,
    source: { listId: string; index: number },
    destination: { listId: string; index: number }
  ) => void;
  onReorderList: (boardId: string, sourceIndex: number, destinationIndex: number) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  onUpdateBoard,
  onAddList,
  onUpdateList,
  onDeleteList,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onToggleCardCheck,
  onReorderCard,
  onReorderList,
}) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Check if we're dragging a list
      const activeListIndex = board.lists.findIndex((list) => list.id === active.id);
      const overListIndex = board.lists.findIndex((list) => list.id === over.id);
      
      if (activeListIndex !== -1 && overListIndex !== -1) {
        // Reordering lists
        onReorderList(board.id, activeListIndex, overListIndex);
      } else {
        // Reordering cards
        const activeList = board.lists.find((list) =>
          list.cards.some((card) => card.id === active.id)
        );
        const overList = board.lists.find((list) =>
          list.cards.some((card) => card.id === over.id)
        );

        if (activeList && overList) {
          const activeIndex = activeList.cards.findIndex(
            (card) => card.id === active.id
          );
          const overIndex = overList.cards.findIndex(
            (card) => card.id === over.id
          );

          onReorderCard(
            board.id,
            { listId: activeList.id, index: activeIndex },
            { listId: overList.id, index: overIndex }
          );
        }
      }
    }

    setActiveId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Check if we're dragging a list
    const activeListIndex = board.lists.findIndex((list) => list.id === active.id);
    if (activeListIndex !== -1) {
      // Don't handle list drag over for now
      return;
    }

    // Handle card drag over - check if dropping on a list
    const activeList = board.lists.find((list) =>
      list.cards.some((card) => card.id === active.id)
    );
    const overList = board.lists.find((list) => list.id === over.id);

    if (activeList && overList && activeList !== overList) {
      const activeIndex = activeList.cards.findIndex(
        (card) => card.id === active.id
      );
      
      onReorderCard(
        board.id,
        { listId: activeList.id, index: activeIndex },
        { listId: overList.id, index: overList.cards.length }
      );
    }
  };

  const handleAddList = () => {
    if (newListTitle.trim()) {
      onAddList(board.id, newListTitle);
      setNewListTitle('');
    }
  };

  return (
    <div
      className="min-h-full p-8"
      style={{ backgroundColor: board.backgroundColor }}
    >
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
        >
          <Settings size={20} />
        </button>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          <SortableContext
            items={board.lists.map((list) => list.id)}
            strategy={verticalListSortingStrategy}
          >
            {board.lists.map((list) => (
              <List
                key={list.id}
                list={list}
                boardId={board.id}
                onUpdateTitle={onUpdateList}
                onDeleteList={onDeleteList}
                onAddCard={onAddCard}
                onUpdateCard={onUpdateCard}
                onDeleteCard={onDeleteCard}
                onToggleCardCheck={onToggleCardCheck}
              />
            ))}
          </SortableContext>

          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Add a list..."
                  className="flex-1 px-3 py-2 border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                />
                <button
                  onClick={handleAddList}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Board Settings"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={board.backgroundColor}
              onChange={(e) =>
                onUpdateBoard({ backgroundColor: e.target.value })
              }
              className="w-full h-10 rounded-md cursor-pointer"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Board;