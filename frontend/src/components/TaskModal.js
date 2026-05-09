import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const defaultForm = { title:'', description:'', status:'todo', priority:'medium', dueDate:'', tags:'' };

export default function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm]       = useState(isEdit ? {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    tags: task.tags?.join(', ') || ''
  } : defaultForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || undefined
      };
      let data;
      if (isEdit) {
        ({ data } = await axios.put(`/api/tasks/${task._id}`, payload));
        toast.success('Task updated');
      } else {
        ({ data } = await axios.post('/api/tasks', payload));
        toast.success('Task created');
      }
      onSave(data.task, !isEdit);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="fade-in">
        <div style={styles.header}>
          <h2 style={styles.title}>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Title *</label>
            <input className="input" placeholder="What needs to be done?" value={form.title}
              onChange={e => setForm({...form, title:e.target.value})} required maxLength={100} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea className="input" placeholder="Add details..." value={form.description}
              onChange={e => setForm({...form, description:e.target.value})}
              rows={3} maxLength={500} style={{ resize:'vertical' }} />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Due Date</label>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => setForm({...form, dueDate:e.target.value})} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tags (comma-separated)</label>
              <input className="input" placeholder="design, urgent, review" value={form.tags}
                onChange={e => setForm({...form, tags:e.target.value})} />
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24 },
  modal: { background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:16,
    width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 24px 0' },
  title: { fontSize:20, fontWeight:700 },
  close: { background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer',
    padding:4, lineHeight:1, borderRadius:6, transition:'color 0.15s' },
  form: { display:'flex', flexDirection:'column', gap:20, padding:24 },
  field: { display:'flex', flexDirection:'column', gap:6, flex:1 },
  label: { fontSize:12, fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.05em', textTransform:'uppercase' },
  row: { display:'flex', gap:16 },
  actions: { display:'flex', gap:12, justifyContent:'flex-end', paddingTop:8, borderTop:'1px solid var(--border)' }
};
