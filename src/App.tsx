import { useMemo, useState } from 'react'
import { Activity, Apple, ArrowDownLeft, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronRight, CirclePlus, Droplets, Dumbbell, Flame, Heart, Home, LockKeyhole, Moon, MoreHorizontal, Plus, Search, Settings, Target, Wallet, X } from 'lucide-react'

type RecordItem = { id: string; module: string; title: string; amount?: number; unit?: string; date: string; note?: string }
type Challenge = { id: string; name: string; days: number; start: string; rules: string[]; done: string[]; paused: boolean }
const modules = [
  { name: 'Fitness & Gym', icon: Dumbbell, desc: 'Workouts, sets, reps and personal records' },
  { name: 'Diet & Nutrition', icon: Apple, desc: 'Meals, calories and macro tracking' },
  { name: 'Body & Weight', icon: Activity, desc: 'Weight, measurements and progress' },
  { name: 'Water Intake', icon: Droplets, desc: 'Hydration goals and daily intake' },
  { name: 'Sleep & Recovery', icon: Moon, desc: 'Sleep, energy and readiness' },
  { name: 'Habits & Routines', icon: Check, desc: 'Build repeatable daily habits' },
  { name: 'Meditation & Wellness', icon: Heart, desc: 'Mindfulness and recovery' },
  { name: 'Reading & Learning', icon: BookOpen, desc: 'Reading and learning sessions' },
  { name: 'Productivity & Study', icon: Target, desc: 'Focused work and study time' },
  { name: 'Finance Manager', icon: Wallet, desc: 'Income, expenses and budgets' },
  { name: 'Journal & Mood', icon: CalendarDays, desc: 'Private notes and mood check-ins' },
  { name: 'Goals & Challenges', icon: Flame, desc: 'Milestones and discipline plans' }
]
const today = () => new Date().toISOString().slice(0, 10)
const read = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback } }

export default function App() {
  const [tab, setTab] = useState('Overview')
  const [records, setRecords] = useState<RecordItem[]>(() => read('35dd.records', []))
  const [challenges, setChallenges] = useState<Challenge[]>(() => read('35dd.challenges', []))
  const [modal, setModal] = useState<'record' | 'challenge' | null>(null)
  const [search, setSearch] = useState('')
  const [recordModule, setRecordModule] = useState('Water Intake')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [challengeName, setChallengeName] = useState('')
  const [challengeDays, setChallengeDays] = useState('35')
  const [ruleText, setRuleText] = useState('Workout')
  const [rules, setRules] = useState(['Workout', 'Read 60 minutes', 'Meditate 30 minutes'])
  const [showModules, setShowModules] = useState(false)

  const saveRecords = (next: RecordItem[]) => { setRecords(next); localStorage.setItem('35dd.records', JSON.stringify(next)) }
  const saveChallenges = (next: Challenge[]) => { setChallenges(next); localStorage.setItem('35dd.challenges', JSON.stringify(next)) }
  const todays = records.filter(r => r.date === today())
  const water = todays.filter(r => r.module === 'Water Intake').reduce((s, r) => s + (r.amount || 0), 0)
  const calories = todays.filter(r => r.module === 'Diet & Nutrition').reduce((s, r) => s + (r.amount || 0), 0)
  const protein = todays.filter(r => r.module === 'Diet & Nutrition').reduce((s, r) => s + (Number(r.note?.match(/protein\s*:?\s*(\d+)/i)?.[1] || 0)), 0)
  const filtered = useMemo(() => records.filter(r => (r.title + r.module + (r.note || '')).toLowerCase().includes(search.toLowerCase())), [records, search])

  const addRecord = () => {
    if (!title.trim()) return
    saveRecords([{ id: crypto.randomUUID(), module: recordModule, title: title.trim(), amount: amount ? Number(amount) : undefined, date: today(), note: note.trim() }, ...records])
    setTitle(''); setAmount(''); setNote(''); setModal(null)
  }
  const addChallenge = () => {
    if (!challengeName.trim() || !rules.length) return
    saveChallenges([{ id: crypto.randomUUID(), name: challengeName.trim(), days: Math.max(1, Number(challengeDays) || 35), start: today(), rules, done: [], paused: false }, ...challenges])
    setChallengeName(''); setModal(null)
  }
  const toggleRule = (challenge: Challenge, rule: string) => {
    const key = today() + ':' + rule
    saveChallenges(challenges.map(c => c.id !== challenge.id ? c : { ...c, done: c.done.includes(key) ? c.done.filter(x => x !== key) : [...c.done, key] }))
  }
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records, challenges }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '35-day-discipline-backup.json'; a.click(); URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Flame size={21}/></div><div><b>35 DAY <span>DISCIPLINE</span></b><small>Discipline creates freedom.</small></div></div><button className="icon-btn" onClick={() => setTab('Settings')} aria-label="Settings"><Settings size={19}/></button></header>
    <main>
      {tab === 'Overview' && <><section className="welcome"><div><p className="eyebrow">YOUR DAILY STANDARD</p><h1>Stay consistent.<br/><em>Become unstoppable.</em></h1><p className="muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div><div className="streak"><Flame/><b>{todays.length}</b><small>ENTRIES TODAY</small></div></section>
        <section className="metric-grid">
          <Metric icon={<Droplets/>} label="WATER" value={(water / 1000).toFixed(1)} unit="/ 4.0 L" progress={Math.min(100, water / 40)}/>
          <Metric icon={<Apple/>} label="CALORIES" value={String(calories)} unit="/ 1500 kcal" progress={Math.min(100, calories / 15)}/>
          <Metric icon={<Target/>} label="PROTEIN" value={String(protein)} unit="/ 80 g" progress={Math.min(100, protein / .8)}/>
          <Metric icon={<Dumbbell/>} label="ACTIVITY" value={String(todays.filter(r => r.module === 'Fitness & Gym').length)} unit="sessions" progress={0}/>
        </section>
        <section className="section-head"><div><p className="eyebrow">TAKE ACTION</p><h2>Quick actions</h2></div><button className="text-btn" onClick={() => setShowModules(!showModules)}>All modules <ChevronRight size={15}/></button></section>
        <section className="quick-grid">
          {modules.slice(0, 6).map(m => <button className="quick-card" key={m.name} onClick={() => { setRecordModule(m.name); setModal('record') }}><m.icon size={20}/><span>{m.name}</span><Plus size={15}/></button>)}
        </section>
        {showModules && <section className="module-list">{modules.map(m => <button key={m.name} onClick={() => { setRecordModule(m.name); setModal('record') }}><m.icon/><span><b>{m.name}</b><small>{m.desc}</small></span><ChevronRight/></button>)}</section>}
        <section className="section-head"><div><p className="eyebrow">YOUR COMMITMENT</p><h2>Active challenges</h2></div><button className="round-add" onClick={() => setModal('challenge')}><Plus size={18}/></button></section>
        {challenges.length === 0 ? <div className="empty"><div className="empty-icon"><Target/></div><b>No active challenges yet</b><p>Create a challenge when you're ready. Your start date is set when you create it.</p><button className="primary-btn" onClick={() => setModal('challenge')}>Create challenge</button></div> : challenges.map(c => <div className="challenge-card" key={c.id}><div className="challenge-top"><div><b>{c.name}</b><small>{c.days} days · Started {c.start}</small></div><button className="text-btn" onClick={() => saveChallenges(challenges.map(x => x.id === c.id ? { ...x, paused: !x.paused } : x))}>{c.paused ? 'Resume' : 'Pause'}</button></div><div className="rule-list">{c.rules.map(rule => <label key={rule} className="rule"><input type="checkbox" disabled={c.paused} checked={c.done.includes(today() + ':' + rule)} onChange={() => toggleRule(c, rule)}/><span>{rule}</span></label>)}</div></div>)}
        <section className="section-head"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Today's records</h2></div><button className="text-btn" onClick={() => setTab('History')}>View history <ChevronRight size={15}/></button></section>
        {todays.length === 0 ? <p className="muted empty-line">Your daily log is clear. Add your first entry above.</p> : todays.slice(0, 4).map(r => <RecordRow key={r.id} record={r}/>)}
      </>}
      {tab === 'Modules' && <><p className="eyebrow">YOUR TOOLKIT</p><h1>All modules</h1><div className="module-list">{modules.map(m => <button key={m.name} onClick={() => { setRecordModule(m.name); setModal('record') }}><m.icon/><span><b>{m.name}</b><small>{m.desc}</small></span><ChevronRight/></button>)}</div></>}
      {tab === 'History' && <><p className="eyebrow">YOUR DATA</p><h1>Activity history</h1><div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search every record..."/></div>{filtered.length ? filtered.map(r => <div className="history-row" key={r.id}><RecordRow record={r}/><button className="delete-btn" onClick={() => saveRecords(records.filter(x => x.id !== r.id))}>Delete</button></div>) : <div className="empty"><b>No matching records</b></div>}</>}
      {tab === 'Settings' && <><p className="eyebrow">PREFERENCES & DATA</p><h1>Settings</h1><div className="setting-card"><div className="setting-icon"><LockKeyhole/></div><div><b>Private by design</b><p>Records are stored locally in this app on this device. This starter build does not sync to a server.</p></div></div><button className="setting-row" onClick={exportBackup}><span><b>Export backup</b><small>Download your records and challenges as JSON</small></span><ArrowDownLeft/></button><button className="setting-row" onClick={() => { if (confirm('Import is not enabled in this first build.')) return }}><span><b>Restore backup</b><small>Backup import will be enabled after validation</small></span><ArrowUpRight/></button><p className="footnote">Version 1.0.0 · Offline-first foundation</p></>}
    </main>
    <nav className="bottom-nav"><NavButton active={tab === 'Overview'} icon={<Home/>} label="Home" onClick={() => setTab('Overview')}/><NavButton active={tab === 'Modules'} icon={<MoreHorizontal/>} label="Modules" onClick={() => setTab('Modules')}/><NavButton active={tab === 'History'} icon={<CalendarDays/>} label="History" onClick={() => setTab('History')}/><NavButton active={tab === 'Settings'} icon={<Settings/>} label="Settings" onClick={() => setTab('Settings')}/></nav>
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><h2>{modal === 'record' ? 'Add a record' : 'Create challenge'}</h2><button className="icon-btn" onClick={() => setModal(null)}><X/></button></div>
      {modal === 'record' ? <><label className="field">Module<select value={recordModule} onChange={e => setRecordModule(e.target.value)}>{modules.map(m => <option key={m.name}>{m.name}</option>)}</select></label><label className="field">Activity / item<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 500 ml water, push day"/></label><label className="field">Amount (optional)<input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Numeric value"/></label><label className="field">Notes<input value={note} onChange={e => setNote(e.target.value)} placeholder="Details, duration, protein: 25g..."/></label><button className="primary-btn full" onClick={addRecord}>Save record</button></> :
      <><label className="field">Challenge name<input value={challengeName} onChange={e => setChallengeName(e.target.value)} placeholder="My discipline challenge"/></label><label className="field">Duration in days<input type="number" min="1" value={challengeDays} onChange={e => setChallengeDays(e.target.value)}/></label><div className="field">Daily rules<div className="rule-editor">{rules.map(r => <span key={r}>{r}<button onClick={() => setRules(rules.filter(x => x !== r))}><X size={13}/></button></span>)}</div><div className="inline-add"><input value={ruleText} onChange={e => setRuleText(e.target.value)} placeholder="Add a daily rule"/><button onClick={() => { if (ruleText.trim() && !rules.includes(ruleText.trim())) setRules([...rules, ruleText.trim()]); setRuleText('') }}><Plus/></button></div></div><button className="primary-btn full" onClick={addChallenge}>Create challenge</button></>}
    </div></div>}
  </div>
}

function Metric({ icon, label, value, unit, progress }: { icon: React.ReactNode; label: string; value: string; unit: string; progress: number }) {
  return <div className="metric"><div className="metric-top">{icon}<span>{label}</span></div><div className="metric-value">{value}<small>{unit}</small></div><div className="progress"><i style={{ width: progress + '%' }}/></div></div>
}
function RecordRow({ record }: { record: RecordItem }) { return <div className="record-row"><div className="record-icon"><Check size={16}/></div><div className="record-copy"><b>{record.title}</b><small>{record.module} · {record.date}</small></div>{record.amount !== undefined && <strong>{record.amount}</strong>}</div> }
function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) { return <button className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}>{icon}<small>{label}</small></button> }
