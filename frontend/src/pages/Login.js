import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.logo}>⚡ TaskFlow</div>
        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.sub}>Manage your work, your way.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding: '24px',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 60%)' },
  card: { width:'100%', maxWidth:420, background:'var(--bg-secondary)', border:'1px solid var(--border)',
    borderRadius:16, padding:40 },
  logo: { fontSize:22, fontWeight:700, color:'var(--accent-light)', marginBottom:28,
    letterSpacing:'-0.02em' },
  title: { fontSize:28, fontWeight:700, letterSpacing:'-0.03em', marginBottom:6 },
  sub: { color:'var(--text-secondary)', fontSize:15, marginBottom:32 },
  form: { display:'flex', flexDirection:'column', gap:20 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.04em',
    textTransform:'uppercase' },
  footer: { marginTop:24, textAlign:'center', fontSize:14, color:'var(--text-muted)' }
};
