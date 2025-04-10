import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, GripVertical } from 'lucide-react';
import { Card as CardType } from '../types';
import Modal from './Modal';

interface CardProps {
  card: CardType;
  listId: string;
  boardId: string;
  onUpdate: (boardId: string, listId: string, cardId: string, updates: Partial<CardType>) => void;
  onDelete: (boardId: string, listId: string, cardId: string) => void;
  onToggleCheck: (boardId: string, listId: string, cardId: string) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  listId,
  boardId,
  onUpdate,
  onDelete,
  onToggleCheck,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate(boardId, listId, card.id, {
      title: editTitle,
      description: editDescription,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow p-3 mb-2 cursor-pointer ${
          card.checked ? 'opacity-50' : ''
        }`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners}>
              <GripVertical className="text-gray-400 cursor-grab" size={16} />
            </div>
            <span className={card.checked ? 'line-through' : ''}>{card.title}</span>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleCheck(boardId, listId, card.id)}
              className={`p-1 rounded ${
                card.checked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => onDelete(boardId, listId, card.id)}
              className="p-1 rounded bg-red-100 text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Card"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Card;