import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const FILTERS = ['all', 'todo', 'in-progress', 'done'];

export default function Dashboard() {
  const { user, logout }       = useAuth();
  const [tasks, setTasks]      = useState([]);
  const [loading, setLoading]  = useState(true);
  const [filter, setFilter]    = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchTasks = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await axios.get('/api/tasks', { params });
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleSave = (task, isNew) => {
    if (isNew) {
      setTasks(prev => [task, ...prev]);
    } else {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    }
    setShowModal(false);
    setEditTask(null);
  };

  const openEdit = (task) => { setEditTask(task); setShowModal(true); };
  const openNew  = () => { setEditTask(null); setShowModal(true); };

  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done:       tasks.filter(t => t.status === 'done').length
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>⚡ TaskFlow</div>

        <div style={styles.userCard}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {FILTERS.map(f => (
            <button
              key={f}
              style={{ ...styles.navItem, ...(filter === f ? styles.navActive : {}) }}
              onClick={() => setFilter(f)}
            >
              <span style={styles.navDot(f)} />
              {f === 'all' ? 'All Tasks' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              <span style={styles.navCount}>
                {f === 'all' ? stats.total : f === 'in-progress' ? stats.inProgress : stats[f] || 0}
              </span>
            </button>
          ))}
        </nav>

        <div style={styles.statsGrid}>
          {[
            { label:'Todo',        val: stats.todo,       color:'#94a3b8' },
            { label:'In Progress', val: stats.inProgress, color:'#fbbf24' },
            { label:'Done',        val: stats.done,       color:'#34d399' }
          ].map(s => (
            <div key={s.label} style={styles.stat}>
              <div style={{ ...styles.statVal, color: s.color }}>{s.val}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost" onClick={logout} style={{ width:'100%', justifyContent:'center', marginTop:'auto' }}>
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              {filter === 'all' ? 'All Tasks' : filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </h1>
            <p style={styles.subheading}>{pagination.total || 0} tasks found</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>
            + New Task
          </button>
        </div>

        {loading ? (
          <div style={styles.center}>
            <div className="spinner" style={{ width:36, height:36, border:'3px solid var(--border)', borderTop:'3px solid var(--accent)', borderRadius:'50%' }} />
          </div>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={{ marginBottom:8, fontSize:18 }}>No tasks yet</h3>
            <p style={{ color:'var(--text-muted)', marginBottom:20 }}>Create your first task to get started</p>
            <button className="btn btn-primary" onClick={openNew}>+ Create Task</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {tasks.map((task, i) => (
              <TaskCard
                key={task._id}
                task={task}
                style={{ animationDelay: `${i * 0.05}s` }}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

const styles = {
  page: { display:'flex', minHeight:'100vh' },
  sidebar: { width:260, background:'var(--bg-secondary)', borderRight:'1px solid var(--border)', padding:24,
    display:'flex', flexDirection:'column', gap:24, flexShrink:0, position:'sticky', top:0, height:'100vh' },
  brand: { fontSize:20, fontWeight:700, color:'var(--accent-light)', letterSpacing:'-0.02em' },
  userCard: { display:'flex', alignItems:'center', gap:12, padding:'12px', background:'var(--bg-primary)',
    borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' },
  avatar: { width:36, height:36, borderRadius:'50%', background:'var(--accent)', display:'flex',
    alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, flexShrink:0 },
  userName: { fontWeight:600, fontSize:14, lineHeight:1.3 },
  userEmail: { fontSize:12, color:'var(--text-muted)', lineHeight:1.3 },
  nav: { display:'flex', flexDirection:'column', gap:4 },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:'var(--radius-sm)',
    background:'transparent', border:'none', color:'var(--text-secondary)', fontSize:14, fontWeight:500,
    cursor:'pointer', transition:'all 0.15s', width:'100%', textAlign:'left' },
  navActive: { background:'rgba(99,102,241,0.15)', color:'var(--accent-light)', fontWeight:600 },
  navDot: (f) => ({
    width:8, height:8, borderRadius:'50%', flexShrink:0,
    background: f==='todo' ? '#94a3b8' : f==='in-progress' ? '#fbbf24' : f==='done' ? '#34d399' : 'var(--accent)'
  }),
  navCount: { marginLeft:'auto', fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-muted)' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 },
  stat: { background:'var(--bg-primary)', borderRadius:'var(--radius-sm)', padding:'10px 8px', textAlign:'center',
    border:'1px solid var(--border)' },
  statVal: { fontSize:20, fontWeight:700, lineHeight:1 },
  statLabel: { fontSize:11, color:'var(--text-muted)', marginTop:4, fontFamily:'var(--font-mono)' },
  main: { flex:1, padding:'32px 40px', overflowY:'auto' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 },
  heading: { fontSize:26, fontWeight:700, letterSpacing:'-0.02em' },
  subheading: { color:'var(--text-muted)', fontSize:14, marginTop:4 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 },
  center: { display:'flex', justifyContent:'center', paddingTop:80 },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', paddingTop:80, textAlign:'center' },
  emptyIcon: { fontSize:48, marginBottom:16 }
};
