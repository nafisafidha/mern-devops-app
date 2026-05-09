import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.logo}>⚡ TaskFlow</div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.sub}>Start organizing your work today.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { key:'name',     label:'Full Name',  type:'text',     ph:'Jane Doe' },
            { key:'email',    label:'Email',       type:'email',    ph:'you@example.com' },
            { key:'password', label:'Password',    type:'password', ph:'Min. 6 characters' }
          ].map(f => (
            <div key={f.key} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input
                className="input"
                type={f.type}
                placeholder={f.ph}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required
              />
            </div>
          ))}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width:'100%', justifyContent:'center', padding:12 }}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent-light)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    background:'radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.12) 0%, transparent 60%)' },
  card: { width:'100%', maxWidth:420, background:'var(--bg-secondary)', border:'1px solid var(--border)',
    borderRadius:16, padding:40 },
  logo: { fontSize:22, fontWeight:700, color:'var(--accent-light)', marginBottom:28, letterSpacing:'-0.02em' },
  title: { fontSize:28, fontWeight:700, letterSpacing:'-0.03em', marginBottom:6 },
  sub: { color:'var(--text-secondary)', fontSize:15, marginBottom:32 },
  form: { display:'flex', flexDirection:'column', gap:20 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' },
  footer: { marginTop:24, textAlign:'center', fontSize:14, color:'var(--text-muted)' }
};
