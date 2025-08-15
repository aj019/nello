import React, { useState } from 'react';
import { Plus, Layout, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from './store';
import Board from './components/Board';
import Modal from './components/Modal';

// Draggable Board Item Component
const DraggableBoardItem: React.FC<{
  board: { id: string; title: string };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ board, isActive, onSelect, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full px-4 py-2 text-left rounded-lg transition-colors flex items-center justify-between group ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-gray-100'
      }`}
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-2 flex-1"
      >
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        <span className="truncate">{board.title}</span>
      </button>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete board"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

function App() {
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const {
    boards,
    currentBoard,
    addBoard,
    setCurrentBoard,
    updateBoardBackground,
    addList,
    updateListTitle,
    deleteList,
    addCard,
    updateCard,
    deleteCard,
    toggleCardCheck,
    reorderCard,
    reorderList,
    reorderBoard,
    deleteBoard,
  } = useStore();

  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      addBoard(newBoardTitle);
      setNewBoardTitle('');
      setIsNewBoardModalOpen(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = boards.findIndex((board) => board.id === active.id);
      const overIndex = boards.findIndex((board) => board.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        reorderBoard(activeIndex, overIndex);
      }
    }
    
    setActiveId(null);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      deleteBoard(boardId);
    }
  };

  const currentBoardData = boards.find((board) => board.id === currentBoard);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Toggle Button - Always visible */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
      >
        <Layout size={20} />
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-10 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
        }`}
      >
        <div className="p-4 mt-16">
          <h2 className="text-xl font-bold mb-6">Boards</h2>
          <button
            onClick={() => setIsNewBoardModalOpen(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 mb-4"
          >
            <Plus size={20} />
            Create Board
          </button>
          
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={boards.map((board) => board.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {boards.map((board) => (
                  <DraggableBoardItem
                    key={board.id}
                    board={board}
                    isActive={board.id === currentBoard}
                    onSelect={() => setCurrentBoard(board.id)}
                    onDelete={() => handleDeleteBoard(board.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Static Top Bar */}
        {currentBoardData && (
          <div className="h-16 bg-white shadow-sm flex items-center px-8 z-10">
            <h1 className="text-2xl font-bold">{currentBoardData.title}</h1>
          </div>
        )}

        {/* Board Content */}
        {!currentBoard ? (
          <div className="p-8 pt-20">
            <h1 className="text-3xl font-bold mb-8">Welcome to Your Boards</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => setCurrentBoard(board.id)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: board.backgroundColor }}
                >
                  <h2 className="text-xl font-semibold mb-2">{board.title}</h2>
                  <p className="text-gray-600">
                    {board.lists.length} lists • {board.lists.reduce(
                      (acc, list) => acc + list.cards.length,
                      0
                    )}{' '}
                    cards
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : currentBoardData ? (
          <div className="flex-1 overflow-auto">
            <Board
              board={currentBoardData}
              onUpdateBoard={(updates) =>
                updateBoardBackground(currentBoardData.id, updates.backgroundColor || '')
              }
              onAddList={addList}
              onUpdateList={updateListTitle}
              onDeleteList={deleteList}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onToggleCardCheck={toggleCardCheck}
              onReorderCard={reorderCard}
              onReorderList={reorderList}
            />
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={isNewBoardModalOpen}
        onClose={() => setIsNewBoardModalOpen(false)}
        title="Create New Board"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Title
            </label>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Enter board title..."
              className="w-full px-3 py-2 border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsNewBoardModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBoard}
              className="px-4 py-2 text-white bg-blue-600 rounded-md"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;