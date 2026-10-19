import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  CodeXml,
  Command,
  Compass,
  Copy,
  Download,
  FileText,
  Flame,
  FolderKanban,
  GraduationCap,
  Home,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Trophy,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  curriculum,
  lessons,
  practiceExercises,
  projects,
  quizQuestions,
} from './data/curriculum'
import {
  LearningProvider,
  type Profile,
} from './lib/learning-store'
import { useLearning } from './lib/learning-context'
import { runPython } from './lib/python-runner'
import { completionPercentage, currentStreak, getActivityDays } from './lib/analytics'
import { gradeQuiz } from './lib/quiz'
import { supabase } from './lib/supabase'
import './App.css'

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/">
      <span className="brand-mark"><CodeXml size={20} strokeWidth={2.3} /></span>
      <span className="brand-name">python<span>foundation</span></span>
    </Link>
  )
}

function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-title-action">{action}</div>}
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  const bounded = Math.max(0, Math.min(100, value))
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={bounded}
    >
      <span style={{ width: `${bounded}%` }} />
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <Brand />
      <p>© 2026 Python Foundation. All rights reserved.</p>
      <p>Created by VANDAVASI DILEEP.</p>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/curriculum">Curriculum</Link>
        <a href="https://docs.python.org/3/" target="_blank" rel="noreferrer">Python docs</a>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </footer>
  )
}

function LandingPage() {
  const { state } = useLearning()
  const navigate = useNavigate()

  return (
    <div className="public-site">
      <header className="public-nav">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <Link to="/curriculum">Curriculum</Link>
          <Link to="/about">About</Link>
        </nav>
        <div className="public-nav-actions">
          <Link className="text-link" to="/login">Log in</Link>
          <Link className="button button-dark button-small" to={state.profile ? '/dashboard' : '/welcome'}>
            Start learning <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="pill pill-green"><span className="status-dot" /> A thoughtful way to learn Python</div>
            <h1>Build a real understanding of <span>Python.</span></h1>
            <p className="hero-lede">
              From your first line of code to advanced software development. Learn by doing, one clear step at a time.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => navigate(state.profile ? '/dashboard' : '/welcome')}>
                Start learning for free <ArrowRight size={17} />
              </button>
              <Link className="button button-outline" to="/curriculum">Explore curriculum</Link>
            </div>
            <div className="hero-note"><ShieldCheck size={16} /> No credit card. Keep your progress on this device.</div>
          </div>
          <div className="hero-art" aria-label="Python code editor preview">
            <div className="editor-window">
              <div className="editor-topbar">
                <div className="window-dots"><i /><i /><i /></div>
                <span>first_steps.py</span>
                <span className="editor-language">PYTHON 3</span>
              </div>
              <div className="editor-code">
                <div><span className="line-number">1</span><span className="code-comment"># your journey starts here</span></div>
                <div><span className="line-number">2</span><span><b>def</b> <em>learn</em>(topic):</span></div>
                <div><span className="line-number">3</span><span className="indent"><b>return</b> <i>f"One step at a time: {'{'}topic{'}'}"</i></span></div>
                <div><span className="line-number">4</span>&nbsp;</div>
                <div><span className="line-number">5</span><span>print(learn(<i>"Python"</i>))<span className="cursor" /></span></div>
              </div>
              <div className="editor-output">
                <span><Check size={14} /> OUTPUT</span>
                <code>One step at a time: Python</code>
              </div>
              <div className="editor-card-note"><span className="note-spark"><Sparkles size={16} /></span><span><b>Small steps add up.</b><br />Understand every line, then make it your own.</span></div>
            </div>
            <div className="floating-badge badge-top"><span>01</span><div><b>Learn</b><small>clear concepts</small></div></div>
            <div className="floating-badge badge-bottom"><span><Zap size={17} /></span><div><b>Practice</b><small>right in your browser</small></div></div>
          </div>
        </section>

        <section className="promise-row" id="how-it-works">
          <div><span className="promise-icon"><BookOpen size={18} /></span><div><b>A guided path</b><small>32 modules, zero guesswork</small></div></div>
          <div><span className="promise-icon"><Terminal size={18} /></span><div><b>Learn by building</b><small>Run Python in your browser</small></div></div>
          <div><span className="promise-icon"><Activity size={18} /></span><div><b>Your progress, your pace</b><small>Pick up where you left off</small></div></div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div><p className="eyebrow">A clear path forward</p><h2>From curious beginner<br />to confident builder.</h2></div>
            <p>Learn the fundamentals deeply. Then use them to solve real problems and make things you’re proud to share.</p>
          </div>
          <div className="roadmap-cards">
            <div className="roadmap-card roadmap-beginner"><span className="roadmap-number">01 / FOUNDATIONS</span><div className="roadmap-art"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><Code2 size={34} /></div><h3>Start with the essentials</h3><p>Variables, decisions, loops, collections, and the habits that make code readable.</p><Link to="/curriculum">See beginner modules <ArrowRight size={15} /></Link></div>
            <div className="roadmap-card roadmap-intermediate"><span className="roadmap-number">02 / BUILD SKILLS</span><div className="roadmap-art"><span className="blocks"><i /><i /><i /></span><FolderKanban size={30} /></div><h3>Turn ideas into programs</h3><p>Functions, files, errors, testing, and object-oriented thinking—put to work.</p><Link to="/curriculum">Explore the course <ArrowRight size={15} /></Link></div>
            <div className="roadmap-card roadmap-advanced"><span className="roadmap-number">03 / GO FURTHER</span><div className="roadmap-art"><span className="star-ring">✳</span><Sparkles size={29} /></div><h3>Make it your own</h3><p>Advanced Python, specialization paths, and portfolio-ready capstone projects.</p><Link to="/projects">View project lab <ArrowRight size={15} /></Link></div>
          </div>
        </section>

        <section className="feature-band">
          <div className="feature-illustration"><div className="feature-code-line"><span>01</span> name = <b>"you"</b></div><div className="feature-code-line"><span>02</span> skills = [<b>"curiosity"</b>]</div><div className="feature-code-line"><span>03</span> <i>keep_learning</i>() <span className="feature-spark">✦</span></div><div className="feature-label">A little progress, every day.</div></div>
          <div className="feature-copy"><p className="eyebrow">Practice makes it yours</p><h2>Not just lessons.<br />A place to try things.</h2><p>Write Python, run it safely in your browser, make a mistake, and understand what happened. That’s where confidence comes from.</p><Link className="button button-dark" to="/playground">Open the playground <ArrowRight size={16} /></Link></div>
        </section>

        <section className="section-block module-preview">
          <div className="section-heading"><div><p className="eyebrow">Made for the long run</p><h2>Every next step,<br />already mapped out.</h2></div><Link className="arrow-link" to="/curriculum">Browse all 32 modules <ArrowRight size={16} /></Link></div>
          <div className="module-preview-list">{curriculum.slice(0, 4).map((module, index) => <Link to={`/lesson/${module.id}`} className="module-preview-row" key={module.id}><span className="module-preview-index">{String(index).padStart(2, '0')}</span><span className="module-preview-title"><b>{module.title}</b><small>{module.topics.slice(0, 3).join(' · ')}</small></span><span className={`level-tag level-${module.level.toLowerCase()}`}>{module.level}</span><span className="preview-duration"><Clock3 size={14} /> {module.duration} min</span><ArrowRight size={17} /></Link>)}</div>
        </section>

        <section className="faq-section">
          <div><p className="eyebrow">A few good questions</p><h2>Before you begin.</h2><p>Learn at your own pace, without needing to know anything beforehand.</p></div>
          <div className="faq-list">
            <details><summary>Do I need any experience with programming?<ChevronDown size={17} /></summary><p>No. The course starts with what programming is and builds from the very first Python statement.</p></details>
            <details><summary>Do I need to install Python?<ChevronDown size={17} /></summary><p>No installation is needed to try the browser playground. The full course also explains how to set up Python on your computer.</p></details>
            <details><summary>Will my progress be saved?<ChevronDown size={17} /></summary><p>Progress is saved in this browser on this device. Connecting Supabase enables account-based sign-in; cloud progress sync is not configured in this local build.</p></details>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

const sidebarLinks = [
  { to: '/dashboard', label: 'Overview', icon: Home, end: true },
  { to: '/curriculum', label: 'Learn Python', icon: BookOpen },
  { to: '/roadmap', label: 'Course roadmap', icon: Compass },
  { to: '/glossary', label: 'Python glossary', icon: Command },
  { to: '/playground', label: 'Code playground', icon: Terminal },
  { to: '/practice', label: 'Practice problems', icon: ListChecks },
  { to: '/quiz', label: 'Quizzes & tests', icon: CircleHelp },
  { to: '/projects', label: 'Project lab', icon: FolderKanban },
]

const personalLinks = [
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/notes', label: 'My notes', icon: FileText },
  { to: '/analytics', label: 'Progress analytics', icon: Activity },
]

function AppShell({ children }: { children: ReactNode }) {
  const { state, storageError, setTheme } = useLearning()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function searchCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/curriculum?q=${encodeURIComponent(search)}`)
  }

  return (
    <div className={`app-shell ${state.theme === 'dark' ? 'theme-dark' : ''}`}>
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Brand light /><button className="mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={19} /></button></div>
        <div className="sidebar-course"><span className="course-icon"><CodeXml size={17} /></span><div><b>Python Foundation</b><small>Core learning path</small></div><ChevronDown size={15} /></div>
        <nav className="side-nav" aria-label="Learning navigation">
          <p className="nav-section-label">LEARNING</p>
          {sidebarLinks.map(({ to, label, icon: Icon, end }) => <NavLink end={end} to={to} key={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={17} /><span>{label}</span>{label === 'Learn Python' && <span className="nav-count">32</span>}</NavLink>)}
          <p className="nav-section-label nav-section-spaced">YOUR SPACE</p>
          {personalLinks.map(({ to, label, icon: Icon }) => <NavLink to={to} key={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={17} /><span>{label}</span>{label === 'Bookmarks' && state.bookmarks.length > 0 && <span className="nav-count">{state.bookmarks.length}</span>}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span><Lightbulb size={15} /></span><b>Small steps count.</b><p>Even 15 minutes of practice moves you forward.</p></div>
          <NavLink to="/settings" className={({ isActive }) => `side-link settings-link ${isActive ? 'active' : ''}`}><Settings size={17} /><span>Settings</span></NavLink>
          <Link to="/profile" className="sidebar-profile"><span className="avatar">{state.profile?.name?.charAt(0).toUpperCase() || <UserRound size={16} />}</span><span className="profile-meta"><b>{state.profile?.name || 'Your profile'}</b><small>{state.profile?.experience || 'Set up your learning profile'}</small></span><ChevronDown size={15} /></Link>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <form className="global-search" onSubmit={searchCourse}><Search size={17} /><input aria-label="Search lessons and topics" placeholder="Search lessons, topics..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd><Command size={12} /> K</kbd></form>
          <div className="topbar-actions"><span className="topbar-course-label"><span className="status-dot" /> Your learning space</span><button className="icon-button theme-toggle" aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}>{state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><Link className="avatar topbar-avatar" to="/profile">{state.profile?.name?.charAt(0).toUpperCase() || <UserRound size={16} />}</Link></div>
        </header>
        <main className="page-content">
          {storageError && <div className="storage-alert" role="alert"><ShieldCheck size={16} /> {storageError}</div>}
          {children}
        </main>
        <footer className="app-footer"><span>© 2026 Python Foundation</span><span>Created by VANDAVASI DILEEP</span><a href="https://docs.python.org/3/" target="_blank" rel="noreferrer">Python documentation <ArrowUpRight size={12} /></a></footer>
      </div>
    </div>
  )
}

function WelcomePage() {
  const { state, saveProfile } = useLearning()
  const navigate = useNavigate()
  const [name, setName] = useState(state.profile?.name || '')
  const [experience, setExperience] = useState(state.profile?.experience || 'Just getting started')
  const [goal, setGoal] = useState(state.profile?.goal || 'Build my foundations')
  const [dailyGoal, setDailyGoal] = useState(state.profile?.dailyGoal || 20)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const profile: Profile = { name: name.trim(), experience, goal, dailyGoal }
    saveProfile(profile)
    navigate('/dashboard')
  }

  return (
    <div className="welcome-screen">
      <Brand />
      <div className="welcome-card">
        <div className="welcome-emblem"><Sparkles size={21} /></div>
        <p className="eyebrow">A little about you</p>
        <h1>Let’s make this<br />journey yours.</h1>
        <p className="welcome-intro">A few details help us make your learning space feel personal. You can change these any time.</p>
        <form onSubmit={submit} className="stacked-form">
          <label>Your name<input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" autoComplete="name" /></label>
          <label>Where are you starting from?<select value={experience} onChange={(event) => setExperience(event.target.value)}><option>Just getting started</option><option>I know a little Python</option><option>I have programming experience</option><option>Returning to Python</option></select></label>
          <label>What would you like to do?<select value={goal} onChange={(event) => setGoal(event.target.value)}><option>Build my foundations</option><option>Prepare for interviews</option><option>Automate everyday tasks</option><option>Explore data and AI</option><option>Build web applications</option></select></label>
          <label>Daily learning goal <span className="range-label">{dailyGoal} min</span><input type="range" min="10" max="60" step="5" value={dailyGoal} onChange={(event) => setDailyGoal(Number(event.target.value))} /></label>
          <button className="button button-primary button-full" type="submit">Create my learning space <ArrowRight size={17} /></button>
        </form>
        <p className="local-note"><LockKeyhole size={14} /> Saved locally on this device. No account required.</p>
        <Link className="back-link" to="/">Back to home</Link>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { state } = useLearning()
  const [today] = useState(() => new Date())
  const name = state.profile?.name || 'Learner'
  const completed = state.completedLessons.length
  const total = lessons.length
  const progress = completionPercentage(completed, total)
  const activities = getActivityDays(state.activities)
  const maxActivity = Math.max(1, ...activities.map((day) => day.total))
  const averageScore = state.attempts.length
    ? Math.round(state.attempts.reduce((sum, attempt) => sum + attempt.score / attempt.total, 0) / state.attempts.length * 100)
    : null
  const nextLesson = lessons.find((lesson) => !state.completedLessons.includes(lesson.lessonId)) || lessons[0]
  const recentActivities = state.activities.slice(0, 4)

  return (
    <>
      <div className="dashboard-welcome">
        <div><p className="eyebrow">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>Good to see you, {name.split(' ')[0]} <span className="wave">✳</span></h1><p>Keep building your Python skills, one thoughtful step at a time.</p></div>
        <Link className="button button-primary" to={`/lesson/${nextLesson.id}`}>Continue learning <ArrowRight size={16} /></Link>
      </div>
      <section className="stat-grid" aria-label="Learning summary">
        <div className="stat-card"><div className="stat-label"><span className="stat-icon lavender"><BookOpen size={17} /></span>Course progress</div><div className="stat-value">{progress}<small>%</small></div><ProgressBar value={progress} /><div className="stat-foot">{completed} of {total} lessons completed</div></div>
        <div className="stat-card"><div className="stat-label"><span className="stat-icon orange"><Flame size={17} /></span>Learning streak</div><div className="stat-value">{currentStreak(state.activities)}<small> days</small></div><div className="stat-foot">{state.activities.length ? 'Built from your learning activity' : 'Your first day starts with one lesson'}</div><div className="streak-spark"><Flame size={27} /></div></div>
        <div className="stat-card"><div className="stat-label"><span className="stat-icon mint"><CircleHelp size={17} /></span>Quiz accuracy</div><div className="stat-value">{averageScore === null ? '—' : averageScore}<small>{averageScore === null ? '' : '%'}</small></div><div className="stat-foot">{state.attempts.length ? `${state.attempts.length} submitted attempt${state.attempts.length === 1 ? '' : 's'}` : 'Take a quiz to see your score'}</div></div>
        <div className="stat-card"><div className="stat-label"><span className="stat-icon blue"><Trophy size={17} /></span>Projects finished</div><div className="stat-value">{state.completedProjects.length}<small> / {projects.length}</small></div><div className="stat-foot">Milestones begin in the project lab</div></div>
      </section>

      <section className="dashboard-grid">
        <div className="panel continue-panel">
          <div className="panel-heading"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Your next lesson</h2></div><span className="lesson-icon"><BookOpen size={19} /></span></div>
          <div className="continue-body"><span className="level-tag level-beginner">{nextLesson.level}</span><h3>{nextLesson.title}</h3><p>{nextLesson.description}</p><div className="lesson-meta"><span><Clock3 size={14} /> {nextLesson.duration} min</span><span><ListChecks size={14} /> {nextLesson.topics.length} key topics</span></div><ProgressBar value={state.completedLessons.includes(nextLesson.lessonId) ? 100 : 0} /><Link className="button button-dark" to={`/lesson/${nextLesson.id}`}>{completed ? 'Continue lesson' : 'Start your first lesson'} <ArrowRight size={16} /></Link></div>
        </div>
        <div className="panel activity-panel">
          <div className="panel-heading"><div><p className="eyebrow">A LOOK BACK</p><h2>This week</h2></div><span className="subtle-label">Learning activity</span></div>
          <div className="activity-chart" role="img" aria-label="Your recorded learning activity for the past seven days">{activities.map((day) => <div className="activity-day" key={day.key}><div className="activity-bar-wrap"><span className={`activity-bar ${day.total ? 'has-activity' : ''}`} style={{ height: `${Math.max(5, day.total / maxActivity * 100)}%` }} title={`${day.total} activity events`} /></div><small>{day.day}</small></div>)}</div>
          <div className="chart-legend"><span><i /> Your recorded activity</span><span>{state.activities.length} total events</span></div>
        </div>
        <div className="panel roadmap-panel">
          <div className="panel-heading"><div><p className="eyebrow">YOUR LEARNING PATH</p><h2>Course roadmap</h2></div><Link className="panel-link" to="/roadmap">View all <ArrowRight size={14} /></Link></div>
          <div className="roadmap-progress-line"><span style={{ height: `${progress}%` }} /></div>
          {curriculum.slice(0, 4).map((module, index) => {
            const done = state.completedLessons.includes(`${module.id}-foundations`)
            return <Link className={`roadmap-step ${done ? 'step-done' : ''}`} to={`/lesson/${module.id}`} key={module.id}><span className="roadmap-dot">{done ? <Check size={13} /> : index + 1}</span><span className="roadmap-step-text"><b>{module.title}</b><small>{module.duration} min · {module.level}</small></span>{done ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}</Link>
          })}
        </div>
        <div className="panel recent-panel">
          <div className="panel-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h2>Recent activity</h2></div><Activity size={17} className="muted-icon" /></div>
          {recentActivities.length ? <div className="recent-list">{recentActivities.map((activity, index) => <div className="recent-item" key={`${activity.at}-${index}`}><span className="recent-dot">{activity.type === 'lesson_completed' ? <Check size={14} /> : activity.type === 'quiz_submitted' ? <CircleHelp size={14} /> : <Play size={12} />}</span><span><b>{activity.type.replaceAll('_', ' ')}</b><small>{curriculum.find((module) => module.id === activity.itemId)?.title || activity.itemId}</small></span><time>{new Date(activity.at).toLocaleDateString()}</time></div>)}</div> : <div className="compact-empty"><p>Your learning activity will show up here as you go.</p><Link to={`/lesson/${nextLesson.id}`}>Start with a lesson <ArrowRight size={14} /></Link></div>}
        </div>
      </section>
      <section className="goal-banner"><span className="goal-icon"><Zap size={20} /></span><div><b>Your goal: {state.profile?.dailyGoal || 20} minutes a day</b><p>Steady, focused practice makes new ideas stick.</p></div><Link to="/settings">Adjust goal <ArrowRight size={14} /></Link></section>
    </>
  )
}

function moduleCompletion(state: ReturnType<typeof useLearning>['state'], moduleId: string) {
  const lesson = `${moduleId}-foundations`
  return state.completedLessons.includes(lesson)
}

function CurriculumPage() {
  const { state } = useLearning()
  const [searchParams, setSearchParams] = useSearchParams()
  const [downloadMessage, setDownloadMessage] = useState('')
  const query = searchParams.get('q') || ''
  const [level, setLevel] = useState('All levels')
  const [status, setStatus] = useState('All lessons')

  const filtered = useMemo(() => curriculum.filter((module) => {
    const matchesSearch = `${module.title} ${module.description} ${module.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const matchesLevel = level === 'All levels' || module.level === level
    const isComplete = moduleCompletion(state, module.id)
    const matchesStatus = status === 'All lessons' || (status === 'Completed' ? isComplete : !isComplete)
    return matchesSearch && matchesLevel && matchesStatus
  }), [level, query, state, status])

  function updateQuery(value: string) {
    if (value) setSearchParams({ q: value })
    else setSearchParams({})
  }

  function downloadRevisionSheet() {
    try {
      const content = curriculum
        .map((module, index) => [
          `MODULE ${String(index).padStart(2, '0')} — ${module.title}`,
          `Level: ${module.level} | Estimated time: ${module.duration} minutes`,
          module.description,
          `Topics: ${module.topics.join(', ')}`,
          `Official reading: ${module.documentation}`,
          '',
        ].join('\n'))
        .join('\n')
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'python-foundation-revision-sheet.txt'
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      setDownloadMessage('Revision sheet downloaded.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The browser could not create the download.'
      setDownloadMessage(`Could not download the revision sheet (${detail}).`)
    }
  }

  return (
    <>
      <PageTitle eyebrow="THE PYTHON LEARNING PATH" title="Course curriculum" description="A clear route from your first Python program to advanced projects. Filter by topic, level, or what you’ve completed." action={<div className="curriculum-actions"><button className="button button-outline button-small" onClick={downloadRevisionSheet}><Download size={14} /> Revision sheet</button><span className="module-count-badge"><BookOpen size={15} /> {curriculum.length} modules</span></div>} />
      {downloadMessage && <p className="download-message" role="status">{downloadMessage}</p>}
      <div className="curriculum-summary"><div><span className="summary-number">{curriculum.length}</span><span>guided modules</span></div><div><span className="summary-number">{curriculum.reduce((sum, module) => sum + module.topics.length, 0)}</span><span>key topics outlined</span></div><div><span className="summary-number">{state.completedLessons.length}</span><span>completed by you</span></div></div>
      <div className="filter-bar"><label className="filter-search"><Search size={16} /><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search modules or topics" aria-label="Search course modules" />{query && <button aria-label="Clear search" onClick={() => updateQuery('')}><X size={14} /></button>}</label><label className="select-wrap"><span className="sr-only">Filter by level</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Specialization</option></select><ChevronDown size={15} /></label><label className="select-wrap"><span className="sr-only">Filter by completion</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All lessons</option><option>Not started</option><option>Completed</option></select><ChevronDown size={15} /></label></div>
      <div className="curriculum-list">{filtered.map((module) => {
        const done = moduleCompletion(state, module.id)
        return <Link to={`/lesson/${module.id}`} className={`curriculum-row ${done ? 'curriculum-complete' : ''}`} key={module.id}><span className="curriculum-index">{String(curriculum.indexOf(module)).padStart(2, '0')}</span><span className="curriculum-row-copy"><b>{module.title}</b><small>{module.description}</small><span className="topic-chips">{module.topics.slice(0, 4).map((topic) => <i key={topic}>{topic}</i>)}</span></span><span className={`level-tag level-${module.level.toLowerCase()}`}>{module.level}</span><span className="curriculum-time"><Clock3 size={14} /> {module.duration} min</span><span className={`module-status ${done ? 'done' : ''}`}>{done ? <CheckCircle2 size={17} /> : <ArrowRight size={17} />}</span></Link>
      })}</div>
      {!filtered.length && <EmptyState icon={<Search size={21} />} title="No modules found" description="Try another keyword or clear your filters." action={<button className="button button-outline" onClick={() => { setLevel('All levels'); setStatus('All lessons'); setSearchParams({}) }}>Clear filters</button>} />}
      <p className="curriculum-footnote"><ShieldCheck size={14} /> Course material is written for learners. Technical references link to the official Python documentation.</p>
    </>
  )
}

function CodeSample({ code, output }: { code: string; output: string }) {
  return <div className="lesson-code-card"><div className="code-card-header"><span><Terminal size={14} /> example.py</span><span>Python 3</span></div><pre><code>{code}</code></pre><div className="code-output"><span>OUTPUT</span><code>{output}</code></div></div>
}

function LessonPage() {
  const { moduleId } = useParams()
  const { state, markLessonComplete, toggleBookmark, saveNote, recordActivity } = useLearning()
  const startedLesson = useRef<string | null>(null)
  const module = curriculum.find((item) => item.id === moduleId)
  const lesson = lessons.find((item) => item.id === moduleId)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    const lessonId = moduleId ? `${moduleId}-foundations` : null
    if (lessonId && lessons.some((item) => item.lessonId === lessonId) && startedLesson.current !== lessonId) {
      startedLesson.current = lessonId
      recordActivity('lesson_started', lessonId)
    }
  }, [moduleId, recordActivity])

  if (!module || !lesson) return <NotFoundPage />

  const note = noteDrafts[lesson.lessonId] ?? state.notes[lesson.lessonId] ?? ''
  const completed = state.completedLessons.includes(lesson.lessonId)
  const bookmarked = state.bookmarks.includes(lesson.lessonId)
  const index = curriculum.indexOf(module)
  const next = curriculum[(index + 1) % curriculum.length]
  const checkOptions = ['Run a small example and inspect what it does', 'Memorize a long example without changing it', 'Ignore unexpected output', 'Skip checking the result']
  const correctAnswer = 0

  return (
    <div className="lesson-layout">
      <div className="lesson-main">
        <div className="breadcrumbs"><Link to="/curriculum">Curriculum</Link><ChevronRight size={14} /><span>Module {String(index).padStart(2, '0')}</span></div>
        <div className="lesson-heading"><span className="lesson-module-icon"><BookOpen size={19} /></span><div><p className="eyebrow">MODULE {String(index).padStart(2, '0')} · {module.level.toUpperCase()}</p><h1>{module.title}</h1><p className="lesson-deck">{module.description}</p></div></div>
        <div className="lesson-toolbar"><span><Clock3 size={14} /> {module.duration} min</span><span><ListChecks size={14} /> {module.topics.length} concepts</span><button className={`tool-button ${bookmarked ? 'is-saved' : ''}`} onClick={() => toggleBookmark(lesson.lessonId)}><Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? 'Bookmarked' : 'Bookmark'}</button></div>
        <section className="lesson-section"><h2>What you’ll learn</h2><p>By the end of this lesson, you’ll be able to explain the core ideas behind {module.title.toLowerCase()} and use them in a small Python program.</p><ul className="objective-list">{module.topics.map((topic) => <li key={topic}><CheckCircle2 size={16} /> {topic}</li>)}</ul></section>
        <section className="lesson-section"><h2>The idea, simply</h2><p>{module.description} Think of it this way:</p><div className="analogy-card"><span className="analogy-icon"><Lightbulb size={18} /></span><p>{module.analogy}</p></div><h3>Why this matters</h3><p>These concepts show up whenever you build a real program. Understanding the reason behind each line makes it easier to adapt examples, debug mistakes, and choose the right tool later.</p></section>
        <section className="lesson-section"><h2>See it in Python</h2><p>Read through the example first. Notice how the code expresses one small idea in a way you can run and change.</p><CodeSample code={module.example} output={module.output} /><details className="explanation-details"><summary><ChevronDown size={15} /> Walk through the example</summary><p>First, Python evaluates the values and expressions in order. Then it performs the operation shown in the example. The final <code>print()</code> call displays the result in the output area. Try changing a value in the playground and observe how the behavior changes.</p></details></section>
        <section className="lesson-section"><h2>Common things to watch for</h2><div className="mistake-card"><span><CircleHelp size={17} /></span><div><b>Start with a small example</b><p>When a result surprises you, simplify the code and check one value at a time. Clear names and a focused print statement often reveal what Python is doing.</p></div></div><p>When you’re unsure, consult the official documentation for syntax and precise behavior.</p><a className="external-doc-link" href={module.documentation} target="_blank" rel="noreferrer">Read the official documentation <ArrowUpRight size={14} /></a></section>
        <section className="lesson-section quick-check"><div className="quick-check-title"><span><Zap size={17} /></span><div><p className="eyebrow">QUICK CHECK</p><h2>Check your understanding</h2></div></div><p>Which is a useful way to build understanding of a Python concept?</p><div className="answer-options">{checkOptions.map((option, index) => <button key={option} className={`answer-option ${selectedAnswer === index ? 'selected' : ''} ${checked && index === correctAnswer ? 'answer-correct' : ''} ${checked && selectedAnswer === index && index !== correctAnswer ? 'answer-wrong' : ''}`} onClick={() => { setSelectedAnswer(index); setChecked(false) }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{checked && <p className={`answer-feedback ${selectedAnswer === correctAnswer ? 'feedback-correct' : 'feedback-wrong'}`}>{selectedAnswer === correctAnswer ? 'That’s right. Small experiments help connect the idea to observable behavior.' : 'Not quite. Try a small example and inspect what Python actually does.'}</p>}<button className="button button-outline" disabled={selectedAnswer === null} onClick={() => setChecked(true)}>Check answer <ArrowRight size={15} /></button></section>
        <section className="lesson-section note-section"><h2>Your lesson notes</h2><p>Jot down a question or an idea you want to remember. Notes are saved in this browser.</p><textarea value={note} onChange={(event) => setNoteDrafts((previous) => ({ ...previous, [lesson.lessonId]: event.target.value }))} placeholder="What would you like to remember from this lesson?" rows={4} aria-label="Personal lesson notes" /><button className="button button-outline button-small" onClick={() => saveNote(lesson.lessonId, note)}><Check size={14} /> Save note</button></section>
        <div className="lesson-finish"><div><p className="eyebrow">ONE STEP AT A TIME</p><h2>{completed ? 'Nice work. This lesson is complete.' : 'Ready to mark this lesson complete?'}</h2><p>Your progress is saved here on this device.</p></div><button className={`button ${completed ? 'button-outline' : 'button-primary'}`} onClick={() => markLessonComplete(lesson.lessonId)} disabled={completed}>{completed ? <><CheckCircle2 size={17} /> Completed</> : <>Mark as complete <Check size={16} /></>}</button></div>
        <div className="lesson-next"><span className="next-arrow"><ArrowRight size={17} /></span><span><small>UP NEXT</small><b>{next.title}</b></span><Link to={`/lesson/${next.id}`} aria-label={`Next lesson: ${next.title}`}><ArrowRight size={17} /></Link></div>
      </div>
      <aside className="lesson-aside"><div className="aside-sticky-card"><p className="eyebrow">IN THIS MODULE</p><h3>{module.title}</h3><ul>{module.topics.map((topic, topicIndex) => <li key={topic} className={topicIndex === 0 ? 'current-topic' : ''}><span>{topicIndex === 0 ? <span className="topic-current-dot" /> : <span className="topic-bullet" />}</span>{topic}</li>)}</ul><div className="aside-divider" /><span className="aside-time"><Clock3 size={14} /> About {module.duration} minutes</span><div className="aside-resource"><span><GraduationCap size={16} /></span><p><b>Keep exploring</b><small>Python examples are based on the official documentation.</small><a href={module.documentation} target="_blank" rel="noreferrer">Open reference <ArrowUpRight size={12} /></a></p></div><Link className="button button-dark button-full" to="/playground">Try it in the playground <Terminal size={15} /></Link></div></aside>
    </div>
  )
}

function RoadmapPage() {
  const { state } = useLearning()
  const grouped = ['Beginner', 'Intermediate', 'Advanced', 'Specialization'] as const
  return (
    <>
      <PageTitle eyebrow="YOUR COURSE MAP" title="A path with purpose" description="Follow the sequence or explore the topics that matter to you. There’s no deadline." />
      <div className="roadmap-intro"><div><span className="roadmap-intro-icon"><Compass size={21} /></span><div><b>{state.completedLessons.length} of {lessons.length} lessons complete</b><p>Each module includes a lesson, practical examples, and official reading.</p></div></div><ProgressBar value={state.completedLessons.length / lessons.length * 100} /></div>
      <div className="roadmap-groups">{grouped.map((level) => {
        const items = curriculum.filter((module) => module.level === level)
        if (!items.length) return null
        return <section className="roadmap-group" key={level}><div className="roadmap-group-heading"><span className={`level-dot level-dot-${level.toLowerCase()}`} /><div><h2>{level}</h2><p>{items.length} modules · {level === 'Beginner' ? 'Build a strong foundation' : level === 'Intermediate' ? 'Turn concepts into working programs' : level === 'Advanced' ? 'Understand how Python works in depth' : 'Choose a direction and build something real'}</p></div></div><div className="roadmap-module-grid">{items.map((module) => { const done = moduleCompletion(state, module.id); return <Link className={`roadmap-module-card ${done ? 'roadmap-module-done' : ''}`} to={`/lesson/${module.id}`} key={module.id}><span className="roadmap-card-index">{String(curriculum.indexOf(module)).padStart(2, '0')}</span><span className="roadmap-card-content"><b>{module.title}</b><small>{module.description}</small><span><Clock3 size={13} /> {module.duration} min · {module.topics.length} concepts</span></span><span className="roadmap-card-status">{done ? <CheckCircle2 size={18} /> : <ArrowRight size={17} />}</span></Link>})}</div></section>
      })}</div>
    </>
  )
}

const glossaryTerms = [
  ['Argument', 'A value supplied to a function call. The function’s parameter receives that value.'],
  ['Binding', 'The association between a name and the object it currently refers to.'],
  ['Boolean', 'The built-in truth value type with two values: True and False.'],
  ['Class', 'A definition that describes the attributes and behavior of instances created from it.'],
  ['Comprehension', 'A concise expression for building a collection by iterating over an iterable, optionally filtering items.'],
  ['Dictionary', 'A mutable mapping of hashable keys to values, written with key-value pairs.'],
  ['Exception', 'An object representing an error or other exceptional condition during program execution.'],
  ['Function', 'A reusable block of code that can accept arguments and return a result.'],
  ['Iterable', 'An object that can produce its members one at a time, such as a list, string, or range.'],
  ['Mutable', 'Capable of being changed after it is created; lists and dictionaries are common examples.'],
  ['Object', 'A value in Python with an identity, a type, and a value.'],
  ['Package', 'A way to organize related Python modules into a namespace.'],
  ['Parameter', 'A name in a function definition that receives an argument when the function is called.'],
  ['Scope', 'The region of a program where a name can be looked up.'],
  ['Tuple', 'An ordered, immutable sequence, often used to group values that belong together.'],
  ['Type', 'The category of an object, which determines its supported behavior and operations.'],
]

function GlossaryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').toLowerCase()
  const filteredTerms = glossaryTerms.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query))

  return (
    <>
      <PageTitle eyebrow="A QUICK REFERENCE" title="Python glossary" description="Plain-language explanations of terms you’ll meet throughout the course." />
      <label className="glossary-search"><Search size={16} /><input aria-label="Search glossary terms" value={searchParams.get('q') || ''} onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})} placeholder="Search a term or definition" />{query && <button aria-label="Clear glossary search" onClick={() => setSearchParams({})}><X size={14} /></button>}</label>
      <dl className="glossary-list">{filteredTerms.map(([term, definition]) => <div className="glossary-entry" key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>
      {!filteredTerms.length && <EmptyState icon={<Search size={21} />} title="No terms found" description="Try a different word or clear the search." action={<button className="button button-outline" onClick={() => setSearchParams({})}>Clear search</button>} />}
    </>
  )
}

function readPlaygroundState(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  const record = value as Record<string, unknown>
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    title: typeof record.title === 'string' ? record.title : undefined,
    expected: typeof record.expected === 'string' ? record.expected : undefined,
  }
}

function PlaygroundPage() {
  const location = useLocation()
  const { state, saveSnippet, recordActivity } = useLearning()
  const routeState = readPlaygroundState(location.state)
  const [code, setCode] = useState(routeState.code || 'print("Hello, Python!")\n')
  const [snippetTitle, setSnippetTitle] = useState(routeState.title || 'My Python snippet')
  const [expectedOutput, setExpectedOutput] = useState(routeState.expected)
  const [output, setOutput] = useState('')
  const [runError, setRunError] = useState(false)
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [hasRun, setHasRun] = useState(false)

  async function runCode() {
    setRunning(true)
    setRunError(false)
    setOutput('Starting the Python runtime…')
    setNotice('')
    try {
      const result = await runPython(code)
      setOutput(result.output)
      setRunError(result.error)
      setHasRun(true)
      recordActivity('exercise_run', routeState.title || 'playground')
      if (expectedOutput && !result.error) {
        setNotice(result.output.trim() === expectedOutput.trim() ? 'Your output matches the expected result.' : 'The code ran, but the output does not match the expected result yet.')
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The Python worker failed unexpectedly.'
      setOutput(`Python runtime error: ${detail}`)
      setRunError(true)
      setHasRun(true)
    } finally {
      setRunning(false)
    }
  }

  function resetCode() {
    setCode(routeState.code || 'print("Hello, Python!")\n')
    setExpectedOutput(routeState.expected)
    setOutput('')
    setNotice('')
    setHasRun(false)
  }

  async function copyCode() {
    await copyText(code)
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Code copied to clipboard.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Clipboard access was denied.'
      setNotice(`Could not copy code (${detail}). Select the code and copy it manually.`)
    }
  }

  function saveCurrentSnippet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!snippetTitle.trim() || !code.trim()) {
      setNotice('Add a title and some code before saving a snippet.')
      return
    }
    saveSnippet({ title: snippetTitle.trim(), code })
    setNotice('Snippet saved in this browser.')
  }

  return (
    <>
      <PageTitle eyebrow="A SAFE PLACE TO EXPERIMENT" title="Python playground" description="Write Python and run it in an isolated browser worker. Your code has no access to this app’s secrets or server." action={<span className="runtime-badge"><span className="status-dot" /> Pyodide · Python in WebAssembly</span>} />
      <div className="playground-layout">
        <section className="playground-editor-panel">
          <div className="playground-toolbar"><span className="playground-file"><Code2 size={15} /> scratch.py <span className="unsaved-dot" /></span><div><button className="tool-button" onClick={copyCode}><FileText size={14} /> Copy</button><button className="tool-button" onClick={resetCode}>Reset</button></div></div>
          <div onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void runCode() } }}><CodeMirror value={code} height="380px" extensions={[python()]} theme={state.theme === 'dark' ? oneDark : undefined} onChange={setCode} basicSetup={{ lineNumbers: true, highlightActiveLine: true, bracketMatching: true, foldGutter: true }} aria-label="Python code editor" /></div>
          <div className="playground-runbar"><span><ShieldCheck size={14} /> Separate worker · 15 sec limit · Ctrl/⌘ + Enter to run</span><button className="button button-primary" onClick={runCode} disabled={running}>{running ? <><span className="button-spinner" /> Running…</> : <><Play size={15} fill="currentColor" /> Run code</>}</button></div>
          <div className={`playground-output ${runError ? 'output-error' : ''}`}><div className="output-heading"><span><Terminal size={14} /> OUTPUT</span><span>{running ? 'INITIALIZING' : hasRun ? (runError ? 'ERROR' : 'COMPLETED') : 'READY'}</span></div><pre>{output || 'Your program output will appear here.'}</pre>{notice && <p className={`output-notice ${notice.startsWith('The code ran') ? 'notice-warn' : ''}`}>{notice}</p>}</div>
        </section>
        <aside className="playground-side">
          <div className="panel starter-panel"><p className="eyebrow">GET STARTED</p><h3>A few ideas to try</h3><p>Change a value, run the code, and see what happens.</p><div className="starter-list">{curriculum.slice(0, 4).map((module) => <button key={module.id} onClick={() => { setCode(module.example); setSnippetTitle(module.title); setExpectedOutput(undefined); setOutput(''); setHasRun(false) }}><span><Code2 size={15} /></span><b>{module.title}</b><ArrowRight size={14} /></button>)}</div></div>
          <div className="panel save-snippet-panel"><p className="eyebrow">KEEP A GOOD IDEA</p><h3>Save this snippet</h3><form onSubmit={saveCurrentSnippet}><label className="sr-only" htmlFor="snippet-title">Snippet title</label><input id="snippet-title" maxLength={80} value={snippetTitle} onChange={(event) => setSnippetTitle(event.target.value)} placeholder="Snippet title" /><button className="button button-dark button-full" type="submit"><Plus size={15} /> Save snippet</button></form>{state.snippets.length > 0 && <><p className="snippet-count">{state.snippets.length} saved snippet{state.snippets.length === 1 ? '' : 's'}</p><div className="saved-snippets">{state.snippets.slice(0, 5).map((snippet) => <div className="saved-snippet-row" key={snippet.id}><button onClick={() => { setCode(snippet.code); setSnippetTitle(snippet.title); setExpectedOutput(undefined); setOutput(''); setHasRun(false) }}><span><b>{snippet.title}</b><small>{snippet.savedAt.slice(0, 10)}</small></span><ArrowRight size={13} /></button><button className="icon-button" aria-label={`Copy ${snippet.title}`} onClick={() => void copyText(snippet.code)}><Copy size={13} /></button></div>)}</div></>}</div>
          <div className="safety-note"><ShieldCheck size={16} /><p><b>Designed for safe practice</b><br />Code runs in a separate browser worker with a time limit. Browser-side execution is for learning—not a production multi-tenant code runner.</p></div>
        </aside>
      </div>
    </>
  )
}

function PracticePage() {
  const navigate = useNavigate()
  return (
    <>
      <PageTitle eyebrow="LEARN BY DOING" title="Practice problems" description="Small challenges help turn concepts into skills. Run your solution in the playground and compare the result." />
      <div className="practice-list">{practiceExercises.map((exercise, index) => {
        const module = curriculum.find((item) => item.id === exercise.moduleId)
        return <article className="practice-card" key={exercise.id}><div className="practice-number">{String(index + 1).padStart(2, '0')}</div><div className="practice-content"><div className="practice-topline"><span className={`level-tag level-${exercise.level.toLowerCase()}`}>{exercise.level}</span><span>{module?.title}</span></div><h2>{exercise.title}</h2><p>{exercise.prompt}</p><div className="practice-preview"><Code2 size={14} /><code>{exercise.starter.split('\n').slice(0, 2).join('  ')}</code></div><details className="hint-disclosure"><summary><Lightbulb size={15} /> Need a hint?</summary><p>{exercise.hint}</p></details></div><button className="button button-outline" onClick={() => navigate('/playground', { state: { code: exercise.starter, title: exercise.title, expected: exercise.expected } })}>Try this <ArrowRight size={15} /></button></article>
      })}</div>
      <div className="practice-note"><Lightbulb size={17} /><p><b>Good practice is deliberate.</b> Try to explain why your solution works, not just what output it produces.</p></div>
    </>
  )
}

function QuizPage() {
  const { state, saveAttempt } = useLearning()
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [result, setResult] = useState<{ score: number; missedTopics: string[] } | null>(null)

  function submitQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (Object.keys(selected).length !== quizQuestions.length) return
    const { score, total, missedTopics } = gradeQuiz(quizQuestions, selected)
    const attempt = { score, total, at: new Date().toISOString(), missedTopics }
    saveAttempt(attempt)
    setResult({ score, missedTopics })
  }

  function retake() {
    setSelected({})
    setResult(null)
  }

  return (
    <>
      <PageTitle eyebrow="CHECK WHAT YOU KNOW" title="Python foundations quiz" description="Five questions, no timer. Your result appears after you submit and includes explanations for each answer." action={<span className="quiz-meta"><Clock3 size={14} /> About 5 minutes</span>} />
      {result ? <section className="quiz-results"><div className="result-icon">{result.score === quizQuestions.length ? <Trophy size={25} /> : <CheckCircle2 size={25} />}</div><p className="eyebrow">ASSESSMENT COMPLETE</p><h2>{result.score} <span>/ {quizQuestions.length}</span></h2><p className="result-description">{result.score === quizQuestions.length ? 'Excellent work. You have a solid start on these foundations.' : 'Every attempt is useful. Review the explanations, then try again when you’re ready.'}</p><div className="result-review">{quizQuestions.map((question) => <div className={`review-answer ${selected[question.id] === question.answer ? 'review-correct' : 'review-incorrect'}`} key={question.id}><span>{selected[question.id] === question.answer ? <Check size={15} /> : <X size={15} />}</span><div><b>{question.topic}</b><p>{question.explanation}</p></div></div>)}</div>{result.missedTopics.length > 0 && <div className="revision-tip"><Lightbulb size={16} /> Suggested revision: {result.missedTopics.join(', ')}</div>}<button className="button button-primary" onClick={retake}>Try again <ArrowRight size={16} /></button></section> : <form className="quiz-form" onSubmit={submitQuiz}>{quizQuestions.map((question, index) => <fieldset className="quiz-question" key={question.id}><legend><span>QUESTION {String(index + 1).padStart(2, '0')}</span><b>{question.prompt}</b></legend><div className="quiz-options">{question.options.map((option, optionIndex) => <label className={selected[question.id] === optionIndex ? 'option-selected' : ''} key={option}><input type="radio" name={question.id} value={optionIndex} checked={selected[question.id] === optionIndex} onChange={() => setSelected((previous) => ({ ...previous, [question.id]: optionIndex }))} /><span className="radio-marker" />{option}</label>)}</div></fieldset>)}<div className="quiz-submit-row"><span>{Object.keys(selected).length} of {quizQuestions.length} answered · {state.attempts.length} previous attempts</span><button className="button button-primary" disabled={Object.keys(selected).length !== quizQuestions.length} type="submit">Submit assessment <ArrowRight size={16} /></button></div></form>}
    </>
  )
}

function ProjectsPage() {
  const { state, markProjectComplete } = useLearning()
  return (
    <>
      <PageTitle eyebrow="BUILD SOMETHING REAL" title="Project lab" description="Guided ideas to help you practice planning, implementation, testing, and explaining your work." action={<span className="module-count-badge"><FolderKanban size={15} /> {projects.length} project paths</span>} />
      <div className="project-notice"><Lightbulb size={17} /><p>Start small and complete each milestone in order. These project briefs are learning guides; no project is marked deployed or tested for you.</p></div>
      <div className="project-grid">{projects.map((project, index) => {
        const done = state.completedProjects.includes(project.id)
        return <article className={`project-card project-card-${index % 4} ${done ? 'project-done' : ''}`} key={project.id}><div className="project-card-top"><span className="project-card-index">{String(index + 1).padStart(2, '0')}</span><span className={`level-tag level-${project.level.toLowerCase()}`}>{project.level}</span>{done && <CheckCircle2 size={17} className="project-check" />}</div><h2>{project.title}</h2><p>{project.description}</p><details className="project-milestones"><summary>Show project milestones <ChevronDown size={15} /></summary><ol>{project.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}</ol></details><button className={`button ${done ? 'button-outline' : 'button-dark'} button-small`} disabled={done} onClick={() => markProjectComplete(project.id)}>{done ? <><Check size={14} /> Marked complete</> : <>Mark project complete <ArrowRight size={14} /></>}</button></article>
      })}</div>
    </>
  )
}

function BookmarksPage() {
  const { state, toggleBookmark } = useLearning()
  const saved = lessons.filter((lesson) => state.bookmarks.includes(lesson.lessonId))
  return (
    <>
      <PageTitle eyebrow="SAVED FOR LATER" title="Your bookmarks" description="Keep the lessons you want to revisit close at hand." action={<span className="module-count-badge"><Bookmark size={14} /> {saved.length} saved</span>} />
      {saved.length ? <div className="saved-list">{saved.map((lesson) => <div className="saved-row" key={lesson.lessonId}><Link to={`/lesson/${lesson.id}`}><span className="saved-row-icon"><BookOpen size={16} /></span><span><b>{lesson.title}</b><small>{lesson.level} · {lesson.duration} min</small></span><ArrowRight size={16} /></Link><button className="icon-button" aria-label={`Remove ${lesson.title} bookmark`} onClick={() => toggleBookmark(lesson.lessonId)}><Bookmark size={16} fill="currentColor" /></button></div>)}</div> : <EmptyState icon={<Bookmark size={22} />} title="Nothing saved just yet" description="Bookmark a lesson to make it easy to come back to." action={<Link className="button button-primary" to="/curriculum">Explore lessons <ArrowRight size={15} /></Link>} />}
    </>
  )
}

function NotesPage() {
  const { state, saveNote } = useLearning()
  const [selectedId, setSelectedId] = useState(lessons[0].lessonId)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const draft = drafts[selectedId] ?? state.notes[selectedId] ?? ''
  const savedNotes = Object.entries(state.notes).filter(([, note]) => note.trim())

  return (
    <>
      <PageTitle eyebrow="YOUR STUDY SPACE" title="My notes" description="Capture the questions, connections, and reminders you want to keep." action={<span className="module-count-badge"><FileText size={14} /> {savedNotes.length} saved notes</span>} />
      <div className="notes-layout"><div className="panel note-editor-card"><label htmlFor="note-lesson">Choose a lesson</label><div className="select-wrap note-select"><select id="note-lesson" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{lessons.map((lesson) => <option key={lesson.lessonId} value={lesson.lessonId}>{lesson.title}</option>)}</select><ChevronDown size={15} /></div><p className="eyebrow note-editor-eyebrow">YOUR NOTE</p><textarea value={draft} onChange={(event) => setDrafts((previous) => ({ ...previous, [selectedId]: event.target.value }))} rows={11} placeholder="Write a question, an example, or a connection you want to remember..." /><div className="note-editor-footer"><span><LockKeyhole size={13} /> Saved in this browser</span><button className="button button-primary button-small" onClick={() => saveNote(selectedId, draft)}><Check size={14} /> Save note</button></div></div><aside className="panel saved-notes-card"><p className="eyebrow">RECENTLY SAVED</p><h3>Your notes</h3>{savedNotes.length ? savedNotes.slice(0, 8).map(([lessonId, note]) => { const lesson = lessons.find((item) => item.lessonId === lessonId); return <button className="saved-note-link" key={lessonId} onClick={() => setSelectedId(lessonId)}><FileText size={15} /><span><b>{lesson?.title || lessonId}</b><small>{note.slice(0, 72)}{note.length > 72 ? '…' : ''}</small></span><ChevronRight size={14} /></button>}) : <p className="notes-empty">Notes you save will appear here.</p>}</aside></div>
    </>
  )
}

function AnalyticsPage() {
  const { state } = useLearning()
  const days = getActivityDays(state.activities)
  const maxActivity = Math.max(1, ...days.map((day) => day.total))
  const scoreAverage = state.attempts.length ? Math.round(state.attempts.reduce((sum, attempt) => sum + attempt.score / attempt.total, 0) / state.attempts.length * 100) : null
  const topicMisses = state.attempts.flatMap((attempt) => attempt.missedTopics)
  const weakTopics = [...new Set(topicMisses)].slice(0, 4)

  return (
    <>
      <PageTitle eyebrow="YOUR LEARNING, IN CONTEXT" title="Progress analytics" description="Every number here is calculated from your activity on this device. Nothing is estimated or filled in." />
      <section className="analytics-summary"><div className="analytics-stat"><span className="analytics-stat-icon"><BookOpen size={17} /></span><small>Lessons completed</small><b>{state.completedLessons.length}<em> / {lessons.length}</em></b></div><div className="analytics-stat"><span className="analytics-stat-icon"><CircleHelp size={17} /></span><small>Quiz accuracy</small><b>{scoreAverage === null ? '—' : `${scoreAverage}%`}</b></div><div className="analytics-stat"><span className="analytics-stat-icon"><Flame size={17} /></span><small>Current streak</small><b>{currentStreak(state.activities)}<em> days</em></b></div><div className="analytics-stat"><span className="analytics-stat-icon"><FolderKanban size={17} /></span><small>Projects completed</small><b>{state.completedProjects.length}<em> / {projects.length}</em></b></div></section>
      <div className="analytics-grid"><section className="panel analytics-chart-panel"><div className="panel-heading"><div><p className="eyebrow">LAST 7 DAYS</p><h2>Learning activity</h2></div><span className="subtle-label">{state.activities.length} total events</span></div><div className="analytics-chart" role="img" aria-label="Chart of recorded learning events by day">{days.map((day) => <div className="analytics-day" key={day.key}><span className="analytics-count">{day.total || ''}</span><div className="analytics-bar-area"><i style={{ height: `${Math.max(2, day.total / maxActivity * 100)}%` }} /></div><small>{day.day}</small></div>)}</div><p className="analytics-caption">Activity is counted when you start or complete a lesson, submit a quiz, or run code.</p></section><section className="panel weak-topics-panel"><div className="panel-heading"><div><p className="eyebrow">A PLACE TO REVISIT</p><h2>Suggested review</h2></div><Lightbulb size={17} className="muted-icon" /></div>{weakTopics.length ? <div className="weak-topics-list">{weakTopics.map((topic) => <Link key={topic} to="/curriculum?q="><span>{topic}</span><ArrowRight size={15} /></Link>)}</div> : <div className="compact-empty"><p>After you submit a quiz, topics to revisit will show up here.</p><Link to="/quiz">Take a quiz <ArrowRight size={14} /></Link></div>}</section><section className="panel analytics-history"><div className="panel-heading"><div><p className="eyebrow">RECENT CHECK-INS</p><h2>Quiz history</h2></div><Link className="panel-link" to="/quiz">Take a quiz <ArrowRight size={14} /></Link></div>{state.attempts.length ? state.attempts.slice(0, 5).map((attempt, index) => <div className="attempt-row" key={`${attempt.at}-${index}`}><span className="attempt-score">{attempt.score}/{attempt.total}</span><span><b>Python foundations quiz</b><small>{attempt.missedTopics.length ? `Review: ${attempt.missedTopics.join(', ')}` : 'All topics correct'}</small></span><time>{new Date(attempt.at).toLocaleDateString()}</time></div>) : <div className="compact-empty"><p>Submitted quiz results will be saved here.</p><Link to="/quiz">Take the foundations quiz <ArrowRight size={14} /></Link></div>}</section></div>
    </>
  )
}

function ProfilePage() {
  const { state, saveProfile, clearProfile } = useLearning()
  const navigate = useNavigate()
  const [name, setName] = useState(state.profile?.name || '')
  const [experience, setExperience] = useState(state.profile?.experience || 'Just getting started')
  const [goal, setGoal] = useState(state.profile?.goal || 'Build my foundations')
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveProfile({ name: name.trim(), experience, goal, dailyGoal: state.profile?.dailyGoal || 20 })
    setMessage('Your profile has been saved in this browser.')
  }

  async function logOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setMessage(`Could not sign out: ${error.message}`)
        return
      }
    }
    clearProfile()
    navigate('/')
  }

  return (
    <>
      <PageTitle eyebrow="YOUR LEARNING SPACE" title="Profile" description="Manage how your learning space is personalized." />
      <div className="settings-layout"><section className="panel settings-card"><div className="profile-identity"><span className="avatar profile-large">{state.profile?.name.charAt(0).toUpperCase() || <UserRound size={22} />}</span><span><b>{state.profile?.name || 'Learner'}</b><small>Personal learning profile</small></span></div><form className="stacked-form" onSubmit={submit}><label>Your name<input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} /></label><label>Experience level<select value={experience} onChange={(event) => setExperience(event.target.value)}><option>Just getting started</option><option>I know a little Python</option><option>I have programming experience</option><option>Returning to Python</option></select></label><label>Learning goal<select value={goal} onChange={(event) => setGoal(event.target.value)}><option>Build my foundations</option><option>Prepare for interviews</option><option>Automate everyday tasks</option><option>Explore data and AI</option><option>Build web applications</option></select></label><button className="button button-primary" type="submit">Save profile <Check size={15} /></button></form>{message && <p className="form-success">{message}</p>}</section><aside className="panel profile-info"><span className="info-icon"><LockKeyhole size={19} /></span><h3>Your data, your browser</h3><p>Your profile and learning progress are stored locally on this device. To enable account sign-in, configure Supabase in the project environment.</p><Link to="/settings">View settings <ArrowRight size={15} /></Link><button className="logout-button" onClick={logOut}><LogOut size={15} /> Log out / leave guest profile</button></aside></div>
    </>
  )
}

function SettingsPage() {
  const { state, setTheme, setDailyGoal, clearProgress } = useLearning()
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const theme = state.theme
  return (
    <>
      <PageTitle eyebrow="MAKE IT YOURS" title="Settings" description="Choose a comfortable reading theme and learning goal. Your preferences stay in this browser." />
      <div className="settings-stack"><section className="panel setting-row"><div className="setting-icon"><Sun size={18} /></div><div className="setting-copy"><b>Appearance</b><p>Choose a theme that feels right for you.</p></div><div className="theme-choice"><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><Sun size={15} /> Light</button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><Moon size={15} /> Dark</button></div></section><section className="panel setting-row"><div className="setting-icon"><Zap size={18} /></div><div className="setting-copy"><b>Daily learning goal</b><p>Set a gentle reminder of how much time you’d like to spend learning.</p></div><div className="goal-choice"><select aria-label="Daily learning goal" value={state.profile?.dailyGoal || 20} onChange={(event) => setDailyGoal(Number(event.target.value))}><option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option></select></div></section><section className="panel setting-row danger-row"><div className="setting-icon"><ShieldCheck size={18} /></div><div className="setting-copy"><b>Clear local learning data</b><p>Remove this device’s profile, notes, bookmarks, quiz history, and progress. This cannot be undone.</p></div><button className="button button-danger button-small" onClick={() => { if (window.confirm('Clear all Python Foundation learning data stored in this browser?')) { clearProgress(); setMessage('Local learning data has been cleared.'); navigate('/welcome') } }}>Clear local data</button></section></div>{message && <p className="form-success">{message}</p>}<div className="settings-help"><LockKeyhole size={16} /><p><b>Account sign-in is optional.</b> This local build saves progress to browser storage. Set up Supabase credentials in <code>.env.local</code> to enable secure sign-up and login.</p><Link to="/login">Account sign-in <ArrowRight size={14} /></Link></div>
    </>
  )
}

function AboutPage() {
  return <PublicPage><div className="public-page-content"><p className="eyebrow">OUR PURPOSE</p><h1>Python, made more approachable.</h1><p className="public-page-lede">Python Foundation is an educational platform created to make Python programming easier to understand through structured lessons, practical examples, and hands-on coding.</p><div className="about-founder"><span className="founder-mark"><GraduationCap size={24} /></span><div><small>FOUNDER & CREATOR</small><b>VANDAVASI DILEEP</b><p>Designed and developed by VANDAVASI DILEEP.</p></div></div><h2>Our teaching philosophy</h2><p>Build understanding before memorization. Explain why code behaves the way it does. Give learners room to experiment, make mistakes, and learn from them. Keep the path structured, but let every learner move at their own pace.</p><h2>A course that keeps growing</h2><p>The roadmap covers Python fundamentals, professional practices, advanced language features, optional specializations, and capstone projects. Technical references link to official Python documentation where relevant.</p><div className="official-links"><a href="https://docs.python.org/3/" target="_blank" rel="noreferrer">Python documentation <ArrowUpRight size={14} /></a><a href="https://packaging.python.org/" target="_blank" rel="noreferrer">Python Packaging User Guide <ArrowUpRight size={14} /></a><a href="https://peps.python.org/" target="_blank" rel="noreferrer">Python Enhancement Proposals <ArrowUpRight size={14} /></a></div><p className="disclaimer">Python Foundation is an independent learning project and is not affiliated with or endorsed by the Python Software Foundation.</p></div></PublicPage>
}

function PublicPage({ children }: { children: ReactNode }) {
  return <div className="public-site public-subpage"><header className="public-nav"><Brand /><nav><Link to="/">Home</Link><Link to="/curriculum">Curriculum</Link><Link to="/about">About</Link></nav><div className="public-nav-actions"><Link className="text-link" to="/login">Log in</Link><Link className="button button-dark button-small" to="/welcome">Start learning <ArrowRight size={15} /></Link></div></header><main>{children}</main><PublicFooter /></div>
}

function LegalPage({ page }: { page: 'privacy' | 'terms' }) {
  const isPrivacy = page === 'privacy'
  return <PublicPage><div className="public-page-content legal-content"><p className="eyebrow">PYTHON FOUNDATION</p><h1>{isPrivacy ? 'Privacy policy' : 'Terms of use'}</h1><p className="legal-updated">Last updated: October 2026</p>{isPrivacy ? <><p>This local project build stores learning progress, notes, bookmarks, preferences, and snippets in your browser’s local storage. The project does not send this local learning data to a server.</p><h2>Optional accounts</h2><p>Secure account sign-in is available only when the project owner configures a Supabase project. If enabled, authentication information is handled by that provider. This local build does not store passwords.</p><h2>Code playground</h2><p>Code entered in the playground runs locally in a WebAssembly-based Python runtime inside a separate browser worker. Do not submit secrets or sensitive information in code examples.</p><h2>Contact</h2><p>No contact address has been configured for this project. The owner can add one before public launch.</p></> : <><p>Python Foundation is an independent educational project. Course material is provided for learning purposes and should be checked against official Python documentation where precise technical behavior matters.</p><h2>Using the playground</h2><p>Code executes in your browser for learning purposes. The playground is not a production execution service and should not be used for sensitive or critical workloads.</p><h2>Third-party references</h2><p>Links to official documentation and external services are provided for convenience. Python Foundation is not affiliated with or endorsed by the Python Software Foundation.</p><h2>Availability</h2><p>This project is provided as-is. Course content and features may change as the project develops.</p></>}</div></PublicPage>
}

function ContactPage() {
  return <PublicPage><div className="public-page-content"><p className="eyebrow">GET IN TOUCH</p><h1>Contact</h1><p className="public-page-lede">Contact information has not been configured for this project yet.</p><div className="contact-placeholder"><CircleHelp size={19} /><p>The project owner can add a verified contact address before the site is published publicly.</p></div><Link className="button button-outline" to="/">Back to Python Foundation</Link></div></PublicPage>
}

function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { saveProfile } = useLearning()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const [recovering, setRecovering] = useState(false)
  const isSignUp = location.pathname === '/signup'
  const isRecoveryPage = location.pathname === '/forgot-password'

  useEffect(() => {
    let active = true
    if (isRecoveryPage && supabase) {
      supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) setError(`Could not verify the recovery session: ${sessionError.message}`)
        setRecovering(Boolean(data.session) || searchParams.get('type') === 'recovery')
      }).catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not verify the recovery session.')
      })
    }
    return () => { active = false }
  }, [isRecoveryPage, searchParams])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    if (!supabase) {
      setError('Account sign-in is not configured. Continue with a local learning profile, or configure Supabase using the setup guide.')
      setBusy(false)
      return
    }
    try {
      if (isRecoveryPage && recovering) {
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) setError(updateError.message)
        else {
          setMessage('Your password has been updated. You can now log in.')
          setRecovering(false)
        }
      } else if (isRecoveryPage) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/forgot-password` })
        if (resetError) setError(resetError.message)
        else setMessage('If that address is registered, a password recovery link is on its way.')
      } else if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/dashboard` },
        })
        if (signUpError) setError(signUpError.message)
        else if (data.session) {
          saveProfile({ name: name.trim(), experience: 'Just getting started', goal: 'Build my foundations', dailyGoal: 20 })
          navigate('/dashboard')
        } else setMessage('Account created. Check your inbox to verify your email, then log in.')
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) setError(loginError.message)
        else if (data.user) {
          const profileName = data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'Learner'
          saveProfile({ name: profileName, experience: 'Just getting started', goal: 'Build my foundations', dailyGoal: 20 })
          navigate('/dashboard')
        } else setError('Login did not return a user. Please try again.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The authentication request failed.')
    } finally {
      setBusy(false)
    }
  }

  const title = isRecoveryPage ? recovering ? 'Choose a new password' : 'Reset your password' : isSignUp ? 'Create your account' : 'Welcome back'
  return <div className="auth-screen"><div className="auth-side"><Brand light /><div className="auth-side-copy"><span className="auth-quote-mark">“</span><h2>Understanding grows<br />one question at a time.</h2><p>Take the next step in your Python journey.</p><div className="auth-side-footer"><BookOpen size={16} /> 32 modules · beginner to advanced</div></div><div className="auth-side-art"><span>def</span><span>learn</span><i>(python):</i></div></div><div className="auth-main"><Link className="auth-home-link" to="/"><ArrowLeftIcon /> Back to home</Link><div className="auth-form-wrap"><div className="auth-icon"><LockKeyhole size={19} /></div><p className="eyebrow">YOUR LEARNING SPACE</p><h1>{title}</h1><p className="auth-lede">{isRecoveryPage ? 'We’ll help you get back to learning.' : isSignUp ? 'Save your progress and make this course yours.' : 'Pick up where your Python journey left off.'}</p>{!supabase && <div className="auth-config-notice"><ShieldCheck size={17} /><p><b>Account sign-in needs setup.</b> Add the Supabase URL and anon key from your project settings to <code>.env.local</code>. You can use a local profile without an account.</p></div>}{error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="auth-success" role="status">{message}</div>}<form className="stacked-form auth-form" onSubmit={submit}>{isSignUp && <label>Your name<input required maxLength={60} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}<label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>{(!isRecoveryPage || recovering) && <label>Password<input required minLength={8} type="password" autoComplete={isSignUp ? 'new-password' : recovering ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={recovering ? 'At least 8 characters' : 'At least 8 characters'} /></label>}{!isSignUp && !isRecoveryPage && <div className="auth-form-extra"><Link to="/forgot-password">Forgot password?</Link></div>}<button className="button button-primary button-full" disabled={busy} type="submit">{busy ? 'Please wait…' : isRecoveryPage ? recovering ? 'Update password' : 'Send recovery link' : isSignUp ? 'Create account' : 'Log in'} {!busy && <ArrowRight size={16} />}</button></form>{!isRecoveryPage && <p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to Python Foundation?'} <Link to={isSignUp ? '/login' : '/signup'}>{isSignUp ? 'Log in' : 'Create an account'}</Link></p>}{isRecoveryPage && <p className="auth-switch"><Link to="/login">Back to login</Link></p>}<div className="auth-local"><span /> or <span /></div><Link className="button button-outline button-full" to="/welcome">Continue with a local profile <ArrowRight size={15} /></Link><p className="auth-local-note"><LockKeyhole size={13} /> Progress stays in this browser on this device.</p></div></div></div>
}

function ArrowLeftIcon() {
  return <ChevronLeft size={15} />
}

function NotFoundPage() {
  return <div className="not-found"><span><CircleHelp size={24} /></span><p className="eyebrow">NOT FOUND</p><h1>We couldn’t find that page.</h1><p>The link may have changed, or the lesson may not exist.</p><Link className="button button-primary" to="/dashboard">Back to your dashboard <ArrowRight size={15} /></Link></div>
}

function StudioRoute({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/forgot-password" element={<AuthPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<LegalPage page="privacy" />} />
      <Route path="/terms" element={<LegalPage page="terms" />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/dashboard" element={<StudioRoute><DashboardPage /></StudioRoute>} />
      <Route path="/curriculum" element={<StudioRoute><CurriculumPage /></StudioRoute>} />
      <Route path="/lesson/:moduleId" element={<StudioRoute><LessonPage /></StudioRoute>} />
      <Route path="/roadmap" element={<StudioRoute><RoadmapPage /></StudioRoute>} />
      <Route path="/glossary" element={<StudioRoute><GlossaryPage /></StudioRoute>} />
      <Route path="/playground" element={<StudioRoute><PlaygroundPage /></StudioRoute>} />
      <Route path="/practice" element={<StudioRoute><PracticePage /></StudioRoute>} />
      <Route path="/quiz" element={<StudioRoute><QuizPage /></StudioRoute>} />
      <Route path="/projects" element={<StudioRoute><ProjectsPage /></StudioRoute>} />
      <Route path="/bookmarks" element={<StudioRoute><BookmarksPage /></StudioRoute>} />
      <Route path="/notes" element={<StudioRoute><NotesPage /></StudioRoute>} />
      <Route path="/analytics" element={<StudioRoute><AnalyticsPage /></StudioRoute>} />
      <Route path="/profile" element={<StudioRoute><ProfilePage /></StudioRoute>} />
      <Route path="/settings" element={<StudioRoute><SettingsPage /></StudioRoute>} />
      <Route path="*" element={<StudioRoute><NotFoundPage /></StudioRoute>} />
    </Routes>
  )
}

export default function App() {
  return <LearningProvider><BrowserRouter><AppRoutes /></BrowserRouter></LearningProvider>
}
