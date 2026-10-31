'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
export interface ToolbarAction {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  onSelect: () => void | Promise<void>;
}
export function OverflowMenu({
  actions = [],
  gap = 8,
  label = 'Actions',
  moreLabel = 'More actions',
  className,
}: {
  actions?: readonly ToolbarAction[];
  gap?: number;
  label?: string;
  moreLabel?: string;
  className?: string;
}) {
  if (
    actions.length > 100 ||
    new Set(actions.map((action) => action.id)).size !== actions.length ||
    !Number.isFinite(gap) ||
    gap < 0 ||
    gap > 100
  )
    throw new RangeError('Invalid toolbar actions or gap.');
  const root = useRef<HTMLDivElement>(null);
  const measures = useRef(new Map<string, HTMLButtonElement>());
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const moreMeasure = useRef<HTMLButtonElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(actions.length);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(false);
  const pending = useRef(false);
  const id = useId();
  const signature = actions.map((action) => action.id).join('|');
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const measure = () => {
      if (!root.current) return;
      const width = root.current.getBoundingClientRect().width;
      const widths = actions.map(
        (action) => measures.current.get(action.id)?.getBoundingClientRect().width ?? 0,
      );
      const total =
        widths.reduce((sum, value) => sum + value, 0) + gap * Math.max(0, actions.length - 1);
      if (total <= width) {
        setVisible(actions.length);
        return;
      }
      const room = width - (moreMeasure.current?.getBoundingClientRect().width ?? 44) - gap;
      let used = 0;
      let count = 0;
      for (const value of widths) {
        if (used + value + (count ? gap : 0) > room) break;
        used += value + (count ? gap : 0);
        count += 1;
      }
      setVisible(count);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (root.current) observer?.observe(root.current);
    for (const node of measures.current.values()) observer?.observe(node);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [signature, gap, actions]);
  const shown = actions.slice(0, visible);
  const overflow = actions.slice(visible);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const execute = async (action: ToolbarAction) => {
    if (action.disabled || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await action.onSelect();
      if (alive.current) {
        setOpen(false);
        more.current?.focus();
      }
    } catch (reason) {
      if (alive.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  };
  return (
    <div ref={root} className={className} style={{ position: 'relative', minWidth: 0 }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          height: 0,
          overflow: 'hidden',
        }}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled
            tabIndex={-1}
            ref={(node) => {
              if (node) measures.current.set(action.id, node);
              else measures.current.delete(action.id);
            }}
          >
            {action.label}
          </button>
        ))}
        <button ref={moreMeasure} type="button" disabled tabIndex={-1}>
          {moreLabel}
        </button>
      </div>
      <div
        role="toolbar"
        aria-label={label}
        style={{ display: 'flex', gap, overflow: 'hidden' }}
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          const nodes = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
          ];
          const index = nodes.indexOf(document.activeElement as HTMLButtonElement);
          if (index < 0) return;
          event.preventDefault();
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? nodes.length - 1
                : (index + (event.key === 'ArrowRight' ? 1 : -1) + nodes.length) % nodes.length;
          nodes[next]?.focus();
        }}
      >
        {shown.map((action) => (
          <button
            key={action.id}
            ref={(node) => {
              if (node) buttons.current.set(action.id, node);
              else buttons.current.delete(action.id);
            }}
            type="button"
            disabled={action.disabled || busy}
            onClick={() => void execute(action)}
            style={{ flexShrink: 0 }}
          >
            {action.label}
          </button>
        ))}
        {overflow.length > 0 && (
          <button
            ref={more}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={`${id}-menu`}
            onClick={() => setOpen(!open)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
              }
            }}
            style={{ flexShrink: 0 }}
          >
            {moreLabel}
          </button>
        )}
      </div>
      {open && overflow.length > 0 && (
        <div
          ref={menu}
          id={`${id}-menu`}
          role="menu"
          aria-label={moreLabel}
          style={{
            position: 'absolute',
            right: 0,
            zIndex: 20,
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid GrayText',
            padding: 4,
            maxWidth: '100%',
            maxHeight: 320,
            overflow: 'auto',
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              more.current?.focus();
              return;
            }
            if (event.key === 'Tab') {
              setOpen(false);
              return;
            }
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const nodes = [
              ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
            ];
            const index = nodes.indexOf(document.activeElement as HTMLButtonElement);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? nodes.length - 1
                  : (index + (event.key === 'ArrowDown' ? 1 : -1) + nodes.length) % nodes.length;
            nodes[next]?.focus();
          }}
        >
          {overflow.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={action.disabled || busy}
              onClick={() => void execute(action)}
              style={{ display: 'block', width: '100%', font: 'inherit', textAlign: 'start' }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export default OverflowMenu;
