/**
 * @file RichTextEditor.jsx
 * @description Custom thin rich text editing interface for resume list items, summaries, and experience details, supporting basic formatting.
 * @author Thabotharan Balachandran
 */
import { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, placeholder, onFocus, onBlur }) {
  const editorRef = useRef(null);

  // Sync value from props to editor if it changes from outside (e.g. mock data load or state clear)
  useEffect(() => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      const expectedHTML = value || '';
      
      // Only update DOM if the content is meaningfully different to avoid cursor jumping
      if (currentHTML !== expectedHTML && expectedHTML !== '<p><br></p>') {
        editorRef.current.innerHTML = expectedHTML;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      
      // If it is just an empty block, set it as empty string
      if (content === '<br>' || content === '<p><br></p>' || content.trim() === '') {
        content = '';
      }
      onChange(content);
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
    // Return focus back to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="rich-text-editor card bg-dark border-secondary overflow-hidden shadow-sm" style={{ transition: 'all 0.25s' }}>
      
      {/* Editor Deluxe Toolbar (Matches high-fidelity professional bars) */}
      <div className="editor-toolbar d-flex flex-wrap gap-1 p-2 bg-black bg-opacity-25 border-bottom border-secondary border-opacity-10 align-items-center">
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2 fw-bold"
          onClick={() => executeCommand('bold')}
          title="Bold"
          style={{ minWidth: '28px', fontSize: '0.82rem' }}
        >
          B
        </button>
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2 fst-italic"
          onClick={() => executeCommand('italic')}
          title="Italic"
          style={{ minWidth: '28px', fontSize: '0.82rem' }}
        >
          I
        </button>
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2 text-decoration-underline"
          onClick={() => executeCommand('underline')}
          title="Underline"
          style={{ minWidth: '28px', fontSize: '0.82rem' }}
        >
          U
        </button>
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2 text-decoration-line-through"
          onClick={() => executeCommand('strikeThrough')}
          title="Strikethrough"
          style={{ minWidth: '28px', fontSize: '0.82rem' }}
        >
          S
        </button>
        
        <div className="vr bg-secondary mx-1" style={{ height: '16px', opacity: 0.3 }}></div>
        
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
          style={{ fontSize: '0.82rem' }}
        >
          • List
        </button>
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
          style={{ fontSize: '0.82rem' }}
        >
          1. List
        </button>
        
        <div className="vr bg-secondary mx-1" style={{ height: '16px', opacity: 0.3 }}></div>

        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2"
          onClick={() => executeCommand('undo')}
          title="Undo"
          style={{ fontSize: '0.82rem' }}
        >
          ↶
        </button>
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2"
          onClick={() => executeCommand('redo')}
          title="Redo"
          style={{ fontSize: '0.82rem' }}
        >
          ↷
        </button>
        <button 
          type="button"
          className="btn btn-sm btn-outline-secondary text-light border-0 py-1 px-2"
          onClick={() => executeCommand('removeFormat')}
          title="Clear Formatting"
          style={{ fontSize: '0.82rem' }}
        >
          🧹
        </button>
      </div>
      
      {/* Interactive contentEditable canvas */}
      <div 
        ref={editorRef}
        contentEditable="true"
        className="editor-content p-3 text-light bg-dark"
        onInput={handleInput}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ 
          minHeight: '120px', 
          outline: 'none', 
          color: '#f3f4f6',
          fontSize: '0.88rem',
          lineHeight: '1.6',
          overflowY: 'auto'
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
