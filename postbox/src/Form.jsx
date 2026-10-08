import { useEffect, useState } from 'react';

// Generic modal form used for posts and comments.
export default function Form({ title, fields, initial = {}, submitLabel, onSubmit, onClose }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? ''])));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try { await onSubmit(values); onClose(); } catch { setBusy(false); }
  }

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            {f.multiline ? (
              <textarea required rows={5} value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            ) : (
              <input required type={f.type || 'text'} autoFocus={f === fields[0]} value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            )}
          </label>
        ))}
        <div className="row end">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
