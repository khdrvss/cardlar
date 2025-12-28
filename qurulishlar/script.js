const { useEffect, useMemo, useState } = React;

const API_BASE = window.API_BASE_URL || 'http://localhost:8000/api';

const fallbackProjects = [
    {
        id: 1,
        title: 'Campus Food Rescue',
        description: 'Connecting cafeterias with students to reduce food waste.',
        stage: 'prototype',
        category: 'Sustainability',
        skills_needed: 'React, UX design, partnerships',
        owner: 'ava',
    },
    {
        id: 2,
        title: 'StudyBuddy Match',
        description: 'AI-assisted study group matching across universities.',
        stage: 'idea',
        category: 'EdTech',
        skills_needed: 'Machine learning, backend, marketing',
        owner: 'sam',
    },
];

const fallbackProfiles = [
    {
        id: 1,
        user: 'Ava Chen',
        skills: 'Product strategy, user research, community building',
        university: 'Stanford University',
        role_preference: 'Product lead',
    },
    {
        id: 2,
        user: 'Sam Patel',
        skills: 'Python, NLP, data science',
        university: 'Georgia Tech',
        role_preference: 'ML engineer',
    },
];

const stageOptions = [
    { value: '', label: 'All stages' },
    { value: 'idea', label: 'Idea' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'building', label: 'Building' },
    { value: 'launched', label: 'Launched' },
];

function App() {
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [skillsFilter, setSkillsFilter] = useState('');
    const [authModal, setAuthModal] = useState(null);
    const [applyModal, setApplyModal] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        return token ? { token, username } : null;
    });
    const [notice, setNotice] = useState('');

    useEffect(() => {
        Promise.all([fetchProjects(), fetchProfiles()]);
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_BASE}/projects/`);
            if (!response.ok) {
                throw new Error('Failed to load projects');
            }
            const data = await response.json();
            setProjects(data);
            setNotice('');
        } catch (error) {
            setProjects(fallbackProjects);
            setNotice('Showing sample data. Connect your Django API to load live projects.');
        }
    };

    const fetchProfiles = async () => {
        try {
            const response = await fetch(`${API_BASE}/profiles/`);
            if (!response.ok) {
                throw new Error('Failed to load profiles');
            }
            const data = await response.json();
            setProfiles(data);
        } catch (error) {
            setProfiles(fallbackProfiles);
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch = [project.title, project.description, project.category, project.skills_needed]
                .join(' ')
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesStage = stageFilter ? project.stage === stageFilter : true;
            const matchesCategory = categoryFilter
                ? project.category.toLowerCase().includes(categoryFilter.toLowerCase())
                : true;
            const matchesSkills = skillsFilter
                ? project.skills_needed.toLowerCase().includes(skillsFilter.toLowerCase())
                : true;
            return matchesSearch && matchesStage && matchesCategory && matchesSkills;
        });
    }, [projects, search, stageFilter, categoryFilter, skillsFilter]);

    const handleLogin = async (payload) => {
        const response = await fetch(`${API_BASE.replace('/api', '')}/api/auth/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        const data = await response.json();
        localStorage.setItem('token', data.access);
        localStorage.setItem('username', payload.username);
        setAuth({ token: data.access, username: payload.username });
        setAuthModal(null);
    };

    const handleSignup = async (payload) => {
        const response = await fetch(`${API_BASE.replace('/api', '')}/api/auth/signup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Signup failed');
        }
        await handleLogin({ username: payload.username, password: payload.password });
    };

    const handleCreateProject = async (payload) => {
        if (!auth) {
            setAuthModal('login');
            return;
        }
        const response = await fetch(`${API_BASE}/projects/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Failed to create project');
        }
        await fetchProjects();
        setCreateModal(false);
    };

    const handleApply = async (payload) => {
        if (!auth) {
            setAuthModal('login');
            return;
        }
        const response = await fetch(`${API_BASE}/applications/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Failed to apply');
        }
        setApplyModal(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setAuth(null);
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <h1>Cardlar Collaboration Hub</h1>
                    <p>Discover student-led projects and build your dream team.</p>
                </div>
                <div className="auth-actions">
                    {auth ? (
                        <>
                            <span className="auth-pill">Signed in as {auth.username}</span>
                            <button className="button button-secondary" onClick={handleLogout}>
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="button button-secondary" onClick={() => setAuthModal('login')}>
                                Log in
                            </button>
                            <button className="button button-primary" onClick={() => setAuthModal('signup')}>
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            </header>

            {notice && <div className="notice">{notice}</div>}

            <div className="nav-tabs">
                <button
                    className={activeTab === 'projects' ? 'active' : ''}
                    onClick={() => setActiveTab('projects')}
                >
                    Projects
                </button>
                <button
                    className={activeTab === 'people' ? 'active' : ''}
                    onClick={() => setActiveTab('people')}
                >
                    People
                </button>
            </div>

            <section className="panel">
                {activeTab === 'projects' && (
                    <>
                        <div className="toolbar">
                            <input
                                className="search-input"
                                placeholder="Search projects, categories, or skills"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <select
                                className="select-input"
                                value={stageFilter}
                                onChange={(event) => setStageFilter(event.target.value)}
                            >
                                {stageOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                className="search-input"
                                placeholder="Filter by category"
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                            />
                            <input
                                className="search-input"
                                placeholder="Filter by skills"
                                value={skillsFilter}
                                onChange={(event) => setSkillsFilter(event.target.value)}
                            />
                            <button className="button button-primary" onClick={() => setCreateModal(true)}>
                                + Create project
                            </button>
                        </div>
                        {filteredProjects.length ? (
                            <div className="cards-grid">
                                {filteredProjects.map((project) => (
                                    <div className="card" key={project.id}>
                                        <div className="badge">
                                            <i className="fas fa-flag"></i>
                                            {project.stage}
                                        </div>
                                        <h3>{project.title}</h3>
                                        <p>{project.description}</p>
                                        <p><strong>Skills needed:</strong> {project.skills_needed}</p>
                                        <div className="card-footer">
                                            <span>{project.category}</span>
                                            <button
                                                className="button button-secondary"
                                                onClick={() => setApplyModal(project)}
                                            >
                                                Apply to join
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3>No projects match your filters</h3>
                                <p>Try adjusting your search or add a new project.</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'people' && (
                    <>
                        <div className="toolbar">
                            <input
                                className="search-input"
                                placeholder="Search people by skills or university"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <div className="cards-grid">
                            {profiles
                                .filter((profile) =>
                                    [profile.user, profile.skills, profile.university, profile.role_preference]
                                        .join(' ')
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                )
                                .map((profile) => (
                                    <div className="card" key={profile.id}>
                                        <h3>{profile.user}</h3>
                                        <p><strong>Skills:</strong> {profile.skills || 'Add skills'}</p>
                                        <p><strong>University:</strong> {profile.university || 'Add university'}</p>
                                        <p><strong>Preferred role:</strong> {profile.role_preference || 'Add role'}</p>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </section>

            {authModal && (
                <AuthModal
                    mode={authModal}
                    onClose={() => setAuthModal(null)}
                    onLogin={handleLogin}
                    onSignup={handleSignup}
                />
            )}

            {applyModal && (
                <ApplyModal
                    project={applyModal}
                    onClose={() => setApplyModal(null)}
                    onSubmit={handleApply}
                />
            )}

            {createModal && (
                <CreateProjectModal
                    onClose={() => setCreateModal(false)}
                    onSubmit={handleCreateProject}
                />
            )}
        </div>
    );
}

function AuthModal({ mode, onClose, onLogin, onSignup }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            if (mode === 'signup') {
                await onSignup({ username, email, password });
            } else {
                await onLogin({ username, password });
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
                    <button className="button button-secondary" onClick={onClose}>Close</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                    {error && <p className="notice">{error}</p>}
                    <div className="modal-actions">
                        <button className="button button-secondary" type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="button button-primary" type="submit">
                            {mode === 'signup' ? 'Sign up' : 'Log in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ApplyModal({ project, onClose, onSubmit }) {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await onSubmit({ project: project.id, message });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Apply to {project.title}</h2>
                    <button className="button button-secondary" onClick={onClose}>Close</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Share why you want to join this project"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        required
                    />
                    {error && <p className="notice">{error}</p>}
                    <div className="modal-actions">
                        <button className="button button-secondary" type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="button button-primary" type="submit">
                            Send application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CreateProjectModal({ onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stage, setStage] = useState('idea');
    const [category, setCategory] = useState('');
    const [skills, setSkills] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await onSubmit({
                title,
                description,
                stage,
                category,
                skills_needed: skills,
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Create a new project</h2>
                    <button className="button button-secondary" onClick={onClose}>Close</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Project title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Describe the project vision"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        required
                    />
                    <select value={stage} onChange={(event) => setStage(event.target.value)}>
                        {stageOptions.filter((option) => option.value).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Skills needed (comma-separated)"
                        value={skills}
                        onChange={(event) => setSkills(event.target.value)}
                        required
                    />
                    {error && <p className="notice">{error}</p>}
                    <div className="modal-actions">
                        <button className="button button-secondary" type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="button button-primary" type="submit">
                            Publish project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
