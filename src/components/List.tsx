import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit2, GripVertical, Trash2 } from 'lucide-react';
import Card from './Card';
import { List as ListType, Card as CardType } from '../types';

interface ListProps {
  list: ListType;
  boardId: string;
  onUpdateTitle: (boardId: string, listId: string, title: string) => void;
  onDeleteList: (boardId: string, listId: string) => void;
  onAddCard: (boardId: string, listId: string, title: string) => void;
  onUpdateCard: (boardId: string, listId: string, cardId: string, updates: Partial<CardType>) => void;
  onDeleteCard: (boardId: string, listId: string, cardId: string) => void;
  onToggleCardCheck: (boardId: string, listId: string, cardId: string) => void;
}

const List: React.FC<ListProps> = ({
  list,
  boardId,
  onUpdateTitle,
  onDeleteList,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onToggleCardCheck,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  const { setNodeRef } = useDroppable({ id: list.id });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  const handleDeleteList = () => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      onDeleteList(boardId, list.id);
    }
  };

  return (
    <div 
      ref={setSortableRef}
      style={style}
      className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0"
    >
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
            <div className="flex items-center gap-2">
              <button
                {...attributes}
                {...listeners}
                className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={16} />
              </button>
              <h3 className="text-lg font-semibold">{list.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-gray-700"
                title="Edit list title"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDeleteList}
                className="text-gray-500 hover:text-red-600"
                title="Delete list"
              >
                <Trash2 size={16} />
              </button>
            </div>
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