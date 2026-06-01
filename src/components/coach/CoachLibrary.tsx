import { ReactNode, useMemo, useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import type { MaterialRef } from '../../types';
import { QuizCard } from '../QuizCard';
import { TacticCard } from '../TacticCard';
import { AssignmentBuilder } from './AssignmentBuilder';

const keyOf = (type: 'quiz' | 'tactic', id: string) => `${type}:${id}`;

function Selectable({ selected, onToggle, children }: { selected: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="relative" style={selected ? { boxShadow: '0 0 0 2px var(--accent)', borderRadius: 'var(--r-lg, 16px)' } : undefined}>
      <button
        type="button"
        onClick={onToggle}
        title={selected ? 'Убрать из задания' : 'Добавить в задание'}
        aria-pressed={selected}
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          width: 34, height: 34, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, lineHeight: 1,
          background: selected ? 'var(--accent)' : 'var(--bg-card, #fff)',
          color: selected ? '#fff' : 'var(--ink)',
          border: '1px solid var(--line)',
          boxShadow: '0 1px 6px rgba(0,0,0,.14)',
          cursor: 'pointer',
        }}
      >
        {selected ? '✓' : '+'}
      </button>
      {children}
    </div>
  );
}

export function CoachLibrary() {
  const { quizzes, tactics, isLoading } = useAdminData();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [builderOpen, setBuilderOpen] = useState(false);

  const titleByKey = useMemo(() => {
    const map = new Map<string, string>();
    quizzes.forEach((q) => map.set(keyOf('quiz', q.id), q.title));
    tactics.forEach((t) => map.set(keyOf('tactic', t.id), t.title));
    return map;
  }, [quizzes, tactics]);

  const toggle = (type: 'quiz' | 'tactic', id: string) => {
    const k = keyOf(type, id);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const items = useMemo(
    () =>
      [...selected].map((k) => {
        const [type, id] = k.split(':');
        return { ref: { type: type as MaterialRef['type'], id }, title: titleByKey.get(k) || '—' };
      }),
    [selected, titleByKey]
  );

  if (isLoading) return <div className="muted">Загрузка библиотеки…</div>;

  return (
    <div className="space-y-8 pb-24">
      <section>
        <h3 className="font-display text-lg mb-3">Квизы ({quizzes.length})</h3>
        {quizzes.length === 0 ? (
          <div className="muted text-sm">Квизов в библиотеке пока нет.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {quizzes.map((q) => (
              <Selectable key={q.id} selected={selected.has(keyOf('quiz', q.id))} onToggle={() => toggle('quiz', q.id)}>
                <QuizCard quiz={q} isCompleted={false} onComplete={() => {}} />
              </Selectable>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display text-lg mb-3">Тактики ({tactics.length})</h3>
        {tactics.length === 0 ? (
          <div className="muted text-sm">Тактик в библиотеке пока нет.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {tactics.map((t) => (
              <Selectable key={t.id} selected={selected.has(keyOf('tactic', t.id))} onToggle={() => toggle('tactic', t.id)}>
                <TacticCard tactic={t} isCompleted={false} onComplete={() => {}} />
              </Selectable>
            ))}
          </div>
        )}
      </section>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-card, #fff)' }}>
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm muted-2">Выбрано материалов: <b>{selected.size}</b></span>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Сбросить</button>
              <button className="btn btn-primary" onClick={() => setBuilderOpen(true)}>Создать задание</button>
            </div>
          </div>
        </div>
      )}

      {builderOpen && (
        <AssignmentBuilder
          items={items}
          onClose={() => setBuilderOpen(false)}
          onCreated={() => {
            setBuilderOpen(false);
            setSelected(new Set());
            alert('Задание создано');
          }}
        />
      )}
    </div>
  );
}
