import React from 'react';

const priorityColors = { low:'#34d399', medium:'#fbbf24', high:'#f87171' };

export default function TaskCard({ task, onEdit, onDelete, style }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

  return (
    <div className="card fade-in" style={{ ...cardStyle, ...style, animationFillMode:'both' }}>
      <div style={styles.top}>
        <span className={`badge badge-${task.status}`}>{task.status}</span>
        <div style={styles.dot} title={task.priority}>
          <div style={{ width:8, height:8, borderRadius:'50%', background: priorityColors[task.priority] }} />
          <span style={styles.dotLabel}>{task.priority}</span>
        </div>
      </div>

      <h3 style={{
        ...styles.title,
        textDecoration: task.status === 'done' ? 'line-through' : 'none',
        opacity: task.status === 'done' ? 0.6 : 1
      }}>
        {task.title}
      </h3>

      {task.description && (
        <p style={styles.desc}>{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div style={styles.tags}>
          {task.tags.map(tag => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        {dueDate ? (
          <span style={{ ...styles.due, color: isOverdue ? '#f87171' : 'var(--text-muted)' }}>
            {isOverdue ? '⚠ ' : '📅 '}
            {dueDate.toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
          </span>
        ) : <span />}

        <div style={styles.actions}>
          <button className="btn btn-ghost" style={btnSm} onClick={() => onEdit(task)} title="Edit">✏️</button>
          <button className="btn btn-danger" style={btnSm} onClick={() => onDelete(task._id)} title="Delete">🗑</button>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { display:'flex', flexDirection:'column', gap:12, transition:'border-color 0.2s',
  cursor:'default', ':hover': { borderColor:'var(--border-light)' } };

const styles = {
  top: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  dot: { display:'flex', alignItems:'center', gap:5 },
  dotLabel: { fontSize:12, color:'var(--text-muted)', textTransform:'capitalize', fontFamily:'var(--font-mono)' },
  title: { fontSize:15, fontWeight:600, lineHeight:1.4, color:'var(--text-primary)' },
  desc: { fontSize:13, color:'var(--text-secondary)', lineHeight:1.6,
    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  tags: { display:'flex', flexWrap:'wrap', gap:6 },
  tag: { fontSize:11, background:'rgba(99,102,241,0.12)', color:'var(--accent-light)', padding:'2px 8px',
    borderRadius:100, fontFamily:'var(--font-mono)' },
  footer: { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 },
  due: { fontSize:12, fontFamily:'var(--font-mono)' },
  actions: { display:'flex', gap:4 }
};

const btnSm = { padding:'4px 8px', fontSize:12 };
