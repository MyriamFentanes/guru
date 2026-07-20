"use client";

import { useState } from "react";
import ClassFieldsForm, { type ClassFieldsInitial } from "@/components/ClassFieldsForm";

interface Props {
  classId: string;
  initial: ClassFieldsInitial;
}

export default function ClassDetailsSection({ classId, initial }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <ClassFieldsForm mode="edit" classId={classId} initial={initial} onSaved={() => setEditing(false)} />;
  }

  return (
    <div>
      <dl className="flex flex-col gap-4">
        <div>
          <dt className="label text-muted">Class type</dt>
          <dd className="text-ink">{initial.classType}</dd>
        </div>
        <div>
          <dt className="label text-muted">Target duration</dt>
          <dd className="text-ink">{initial.durationMinutes} minutes</dd>
        </div>
        <div>
          <dt className="label text-muted">Level</dt>
          <dd className="text-ink">{initial.level}</dd>
        </div>
        {initial.series && (
          <div>
            <dt className="label text-muted">Series</dt>
            <dd className="text-ink">{initial.series}</dd>
          </div>
        )}
        {initial.focus && (
          <div>
            <dt className="label text-muted">Focus</dt>
            <dd className="text-ink">{initial.focus}</dd>
          </div>
        )}
        {initial.notes && (
          <div>
            <dt className="label text-muted">Notes</dt>
            <dd className="whitespace-pre-wrap text-ink">{initial.notes}</dd>
          </div>
        )}
      </dl>
      <button onClick={() => setEditing(true)} className="label mt-4 text-muted hover:text-ink">
        Edit details
      </button>
    </div>
  );
}
