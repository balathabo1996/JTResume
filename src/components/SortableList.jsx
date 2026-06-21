/**
 * @file SortableList.jsx
 * @description Interactive list organizer. Handles drag-and-drop index shifts, item deletions, and creation events for nested resume lists.
 * @author Thabotharan Balachandran
 */
import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItemContext = React.createContext(null);

export function SortableItem({ id, children, className }) {
  const sortableParams = useSortable({ id });
  const { setNodeRef, transform, transition, isDragging } = sortableParams;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative'
  };

  return (
    <SortableItemContext.Provider value={sortableParams}>
      <div ref={setNodeRef} style={style} className={className}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}


export function DragHandle({ children }) {
  const context = React.useContext(SortableItemContext);
  if (!context) {
    return (
      <div className="item-drag-handle-disabled">
        {children || (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        )}
      </div>
    );
  }
  const { attributes, listeners } = context;
  
  return (
    <div
      {...attributes}
      {...listeners}
      className="item-drag-handle"
      style={{ display: 'flex', alignItems: 'center', touchAction: 'none' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children || (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      )}
    </div>
  );
}

export function SortableList({ items, onReorder, renderItem }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const itemIds = useMemo(() => {
    return items.map((item, idx) => item.id || `item-${idx}`);
  }, [items]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id);
      const newIndex = itemIds.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <SortableItem key={itemIds[index]} id={itemIds[index]} className="repeater-item mb-3">
            {renderItem(item, index)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
