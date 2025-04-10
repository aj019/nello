import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Edit2 } from 'lucide-react';
import Card from './Card';
import { List as ListType, Card as CardType } from '../types';

interface ListProps {
  list: ListType;
  boardId: string;
  onUpdateTitle: (boardId: string, listId: string, title: string) => void;
  onAddCard: (boardId: string, listId: string, title: string) => void;
  onUpdateCard: (boardId: string, listId: string, cardId: string, updates: Partial<CardType>) => void;
  onDeleteCard: (boardId: string, listId: string, cardId: string) => void;
  onToggleCardCheck: (boardId: string, listId: string, cardId: string) => void;
}

const List: React.FC<ListProps> = ({
  list,
  boardId,
  onUpdateTitle,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onToggleCardCheck,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const { setNodeRef } = useDroppable({ id: list.id });

  const handleTitleSubmit = () => {
    if (editTitle.trim()) {
      onUpdateTitle(boardId, list.id, editTitle);
      setIsEditing(false);
    }
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(boardId, list.id, newCardTitle);
      setNewCardTitle('');
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0">
      <div className="mb-4">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="flex-1 px-2 py-1 border rounded"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{list.title}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div ref={setNodeRef} className="space-y-2">
        <SortableContext
          items={list.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              listId={list.id}
              boardId={boardId}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onToggleCheck={onToggleCardCheck}
            />
          ))}
        </SortableContext>
      </div>

      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Add a card..."
            className="flex-1 px-3 py-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCard()}
          />
          <button
            onClick={handleAddCard}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default List;