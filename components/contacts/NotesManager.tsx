"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Check, FileText } from "lucide-react";
import { CRMNote } from "@/components/crm/types";
import { useCRM } from "@/components/crm/CRMProvider";

interface NotesManagerProps {
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  entityName: string;
}

export function NotesManager({
  entityType,
  entityId,
  entityName,
}: NotesManagerProps) {
  const { getNotesFor, createNote, deleteNote } = useCRM();
  const [notes, setNotes] = useState<CRMNote[]>([]);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    const list = await getNotesFor(entityType, entityId);
    setNotes(list);
  };

  useEffect(() => {
    fetchNotes();
  }, [entityId, entityType]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createNote({
        entityType,
        entityId,
        content: newContent.trim(),
        author: "Current User",
      });
      setNewContent("");
      await fetchNotes();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    await fetchNotes();
  };

  return (
    <div className="bl-notes-container">
      {/* Note Composer */}
      <form onSubmit={handleAddNote} className="bl-note-composer">
        <textarea
          rows={3}
          placeholder={`Add an account note or observation for ${entityName}...`}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <div className="bl-note-composer-footer">
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            Notes are shared with your team and synchronized across records.
          </span>
          <button
            type="submit"
            className="bl-primary bl-btn-sm"
            disabled={isSubmitting || !newContent.trim()}
          >
            <Plus size={14} /> Add Note
          </button>
        </div>
      </form>

      {/* Notes Stream */}
      <div className="bl-notes-list">
        {notes.map((note) => (
          <article key={note.id} className="bl-note-card">
            <div className="bl-between" style={{ marginBottom: "8px" }}>
              <span className="bl-note-author">
                <strong>{note.author}</strong> · {note.createdAt}
              </span>
              <button
                type="button"
                className="bl-icon bl-icon-sm"
                onClick={() => handleDelete(note.id)}
                title="Delete note"
                aria-label="Delete note"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <p className="bl-note-text">{note.content}</p>
          </article>
        ))}

        {notes.length === 0 && (
          <div className="bl-empty-stream">
            <FileText size={24} opacity={0.4} />
            <p>No notes written yet. Jot down notes above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesManager;
