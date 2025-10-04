
// enhanced_app.js - Updated React Frontend with Backend Integration

const { useState, useEffect, useRef } = React;

// Configuration
const API_BASE_URL = '/api';
const WEBSOCKET_URL = `ws://${window.location.host}`;

// API Service Class
class APIService {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Experiment APIs
    static getExperiments(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/experiments?${params}`);
    }

    static getExperiment(id) {
        return this.request(`/experiments/${id}`);
    }

    static createExperiment(data) {
        return this.request('/experiments', {
            method: 'POST',
            body: data,
        });
    }

    // Data Points APIs
    static getDataPoints(experimentId) {
        return this.request(`/data-points/${experimentId}`);
    }

    static addDataPoint(data) {
        return this.request('/data-points', {
            method: 'POST',
            body: data,
        });
    }

    // Papers APIs
    static getPapers(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/papers?${params}`);
    }

    // Analytics APIs
    static getAnalytics() {
        return this.request('/analytics');
    }

    // AI APIs
    static analyzeText(text) {
        return this.request('/ai/analyze-text', {
            method: 'POST',
            body: { text },
        });
    }

    static predictOutcome(experimentData) {
        return this.request('/ai/predict-outcome', {
            method: 'POST',
            body: experimentData,
        });
    }

    // External Data APIs
    static getNASAData() {
        return this.request('/external/nasa-data');
    }
}

// WebSocket Service
class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
        this.reconnectDelay = 1000;
        this.maxReconnectDelay = 30000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        try {
            this.ws = new WebSocket(WEBSOCKET_URL);

            this.ws.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.notifyListeners(data.type || 'message', data);
            };

            this.ws.onclose = () => {
                console.log('❌ WebSocket disconnected');
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('🚫 WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                console.log(`🔄 Reconnecting WebSocket (attempt ${this.reconnectAttempts})...`);
                this.connect();
            }, this.reconnectDelay);

            this.reconnectDelay = Math.min(
                this.reconnectDelay * 2, 
                this.maxReconnectDelay
            );
        }
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}

// Initialize WebSocket service
const wsService = new WebSocketService();

// Enhanced Header Component
const Header = () => {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('color-scheme');
            if (saved) return saved;
        } catch (e) {
            // ignore
        }

        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        try {
            document.documentElement.setAttribute('data-color-scheme', theme);
            localStorage.setItem('color-scheme', theme);
        } catch (e) {
            // ignore
        }
    }, [theme]);

    useEffect(() => {
        // Connect WebSocket
        wsService.connect();

        const handleConnection = () => setConnectionStatus('connected');
        const handleDisconnection = () => setConnectionStatus('disconnected');

        wsService.subscribe('connection', handleConnection);
        wsService.subscribe('disconnection', handleDisconnection);

        return () => {
            wsService.unsubscribe('connection', handleConnection);
            wsService.unsubscribe('disconnection', handleDisconnection);
        };
    }, []);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-text">🚀 Space Biology Dashboard</div>
                    <div className="nasa-badge">NASA</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Connection Status */}
                    <div className={`connection-status ${connectionStatus}`}>
                        <div className="status-dot"></div>
                        <span>{connectionStatus === 'connected' ? 'Live' : 'Offline'}</span>
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    >
                        {theme === 'dark' ? '🌞' : '🌙'}
                    </button>
                </div>
            </div>
        </header>
    );
};

// Enhanced Search Section with Backend Integration
const SearchSection = ({ 
    searchQuery, setSearchQuery, onSearch, 
    categoryFilter, setCategoryFilter, 
    missionFilter, setMissionFilter 
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSearch();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const results = await APIService.getExperiments({ 
                        search: searchQuery, 
                        limit: 5 
                    });
                    setSuggestions(results.slice(0, 5));
                } catch (error) {
                    console.error('Search suggestions error:', error);
                    setSuggestions([]);
                }
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const handleSuggestionClick = (title) => {
        setSearchQuery(title);
        setSuggestions([]);
        onSearch();
    };

    return (
        <div className="search-section">
            <form onSubmit={handleSearch} className="search-box">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Ask about space biology research..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className="search-btn" disabled={isLoading}>
                    {isLoading ? '⟳' : '🔍'}
                </button>
            </form>

            {suggestions.length > 0 && (
                <div className="suggestions" role="listbox">
                    {suggestions.map((s) => (
                        <button 
                            key={s.id} 
                            className="suggestion-item" 
                            onClick={() => handleSuggestionClick(s.title)}
                        >
                            {s.title}
                            <small className="suggestion-meta">{s.id}</small>
                        </button>
                    ))}
                </div>
            )}

            <div className="filters">
                <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <select 
                        className="filter-select form-control"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Plant Biology">Plant Biology</option>
                        <option value="Cell Biology">Cell Biology</option>
                        <option value="Microbiology">Microbiology</option>
                        <option value="Animal Biology">Animal Biology</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Mission</label>
                    <select 
                        className="filter-select form-control"
                        value={missionFilter}
                        onChange={(e) => setMissionFilter(e.target.value)}
                    >
                        <option value="">All Missions</option>
                        <option value="Moon">Moon</option>
                        <option value="Mars">Mars</option>
                        <option value="ISS">ISS</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

// Enhanced AI Summary Component with Backend Integration
const AISummary = ({ searchQuery, isLoading }) => {
    const [analysis, setAnalysis] = useState(null);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        if (searchQuery && searchQuery.length > 10) {
            analyzeQuery();
        }
    }, [searchQuery]);

    const analyzeQuery = async () => {
        try {
            const textAnalysis = await APIService.analyzeText(searchQuery);
            setAnalysis(textAnalysis);

            // Get AI insights based on analysis
            const analyticsData = await APIService.getAnalytics();
            setInsights(analyticsData.aiInsights || []);
        } catch (error) {
            console.error('AI analysis error:', error);
        }
    };

    if (!searchQuery) {
        return (
            <div className="ai-summary">
                <div className="summary-header">
                    <div className="ai-icon">🤖</div>
                    <h3>AI Research Assistant</h3>
                </div>
                <p className="summary-text">
                    Ask me anything about space biology research! I can help you understand 
                    experiments, their implications for space exploration, and connect you to 
                    relevant NASA papers.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="ai-summary">
                <div className="loading">
                    <div className="spinner"></div>
                    Processing your question with AI...
                </div>
            </div>
        );
    }

    return (
        <div className="ai-summary">
            <div className="summary-header">
                <div className="ai-icon">🤖</div>
                <h3>AI Analysis: "{searchQuery}"</h3>
            </div>

            {analysis && (
                <div className="analysis-results">
                    <div className="analysis-metrics">
                        <span className="metric">
                            Sentiment: {(analysis.sentiment * 100).toFixed(0)}%
                        </span>
                        <span className="metric">
                            Complexity: {analysis.complexity.toFixed(1)}/10
                        </span>
                        <span className="metric">
                            Keywords: {analysis.keywords.length}
                        </span>
                    </div>

                    {analysis.keywords.length > 0 && (
                        <div className="keywords">
                            <strong>Key Terms:</strong>
                            {analysis.keywords.slice(0, 5).map(keyword => (
                                <span key={keyword} className="keyword-tag">{keyword}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {insights.length > 0 && (
                <div className="ai-insights">
                    <h4>Related Insights</h4>
                    {insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="insight-item">
                            <span className="insight-confidence">
                                {(insight.confidence * 100).toFixed(0)}%
                            </span>
                            {insight.insight}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Enhanced Experiments Grid with Backend Data
const ExperimentsGrid = ({ categoryFilter, missionFilter, searchQuery }) => {
    const [experiments, setExperiments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExperiment, setSelectedExperiment] = useState(null);

    useEffect(() => {
        loadExperiments();
    }, [categoryFilter, missionFilter, searchQuery]);

    const loadExperiments = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const filters = {};
            if (categoryFilter) filters.category = categoryFilter;
            if (missionFilter) filters.mission = missionFilter;
            if (searchQuery) filters.search = searchQuery;

            const data = await APIService.getExperiments(filters);
            setExperiments(data);
        } catch (error) {
            console.error('Error loading experiments:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryClass = (category) => {
        const categoryMap = {
            'Plant Biology': 'category-plant',
            'Cell Biology': 'category-cell',
            'Microbiology': 'category-microbiology',
            'Animal Biology': 'category-animal'
        };
        return categoryMap[category] || 'category-plant';
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading experiments...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>❌ Error loading experiments: {error}</p>
                <button onClick={loadExperiments} className="btn btn--primary">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="experiments-grid">
                {experiments.map((experiment) => (
                    <ExperimentCard
                        key={experiment.id || experiment._id}
                        experiment={experiment}
                        onOpen={() => setSelectedExperiment(experiment)}
                        getCategoryClass={getCategoryClass}
                    />
                ))}

                {experiments.length === 0 && (
                    <div className="no-results">
                        <p>No experiments found matching your criteria.</p>
                    </div>
                )}
            </div>

            {selectedExperiment && (
                <ExperimentModal
                    experiment={selectedExperiment}
                    onClose={() => setSelectedExperiment(null)}
                />
            )}
        </>
    );
};

// Enhanced Experiment Card with AI Analysis
const ExperimentCard = ({ experiment, onOpen, getCategoryClass }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
        }
    };

    return (
        <div 
            className="experiment-card" 
            tabIndex={0}
            role="button"
            onClick={onOpen}
            onKeyDown={handleKeyDown}
        >
            <div className="card-header">
                <div className="experiment-id">{experiment.id}</div>
                <div className={`category-badge ${getCategoryClass(experiment.category)}`}>
                    {experiment.category}
                </div>
            </div>

            <h3 className="experiment-title">{experiment.title}</h3>
            <p className="experiment-description">{experiment.description}</p>

            {/* AI Analysis Indicators */}
            {experiment.aiAnalysis && (
                <div className="ai-indicators">
                    {experiment.aiAnalysis.predictions?.successProbability && (
                        <div className="ai-indicator">
                            <span className="indicator-label">Success Rate:</span>
                            <span className="indicator-value">
                                {(experiment.aiAnalysis.predictions.successProbability * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}
                    {experiment.aiAnalysis.complexity && (
                        <div className="ai-indicator">
                            <span className="indicator-label">Complexity:</span>
                            <span className="indicator-value">
                                {experiment.aiAnalysis.complexity.toFixed(1)}/10
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="experiment-meta">
                <div><strong>Organism:</strong> {experiment.organism}</div>
                <div><strong>Duration:</strong> {experiment.duration}</div>
                <div><strong>Mission:</strong> {experiment.mission}</div>
                <div><strong>Impact:</strong> {experiment.impact}</div>
            </div>
        </div>
    );
};

// Real-time Data Component
const RealTimeData = () => {
    const [realtimeData, setRealtimeData] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const handleRealTimeUpdate = (data) => {
            setRealtimeData(data);
            setLastUpdate(new Date());
        };

        wsService.subscribe('real-time-update', handleRealTimeUpdate);

        return () => {
            wsService.unsubscribe('real-time-update', handleRealTimeUpdate);
        };
    }, []);

    if (!realtimeData) {
        return (
            <div className="realtime-data">
                <h3>📡 Real-time Data</h3>
                <p>Waiting for live updates...</p>
            </div>
        );
    }

    return (
        <div className="realtime-data">
            <h3>📡 Live Data Stream</h3>
            <div className="data-metrics">
                <div className="metric">
                    <span className="metric-label">Data Points:</span>
                    <span className="metric-value">{realtimeData.dataPoints}</span>
                </div>
                <div className="metric">
                    <span className="metric-label">Last Update:</span>
                    <span className="metric-value">
                        {lastUpdate?.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {realtimeData.latestData && (
                <div className="latest-measurement">
                    <h4>Latest Measurement</h4>
                    <p>
                        <strong>{realtimeData.latestData.measurementType}:</strong> 
                        {realtimeData.latestData.value} {realtimeData.latestData.unit}
                    </p>
                </div>
            )}
        </div>
    );
};

// Enhanced Quick Stats with Backend Data
const QuickStats = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const analytics = await APIService.getAnalytics();
            setStats(analytics);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="quick-stats">
                <div className="loading">
                    <div className="spinner"></div>
                    Loading stats...
                </div>
            </div>
        );
    }

    return (
        <div className="quick-stats">
            <div className="stats-header">📊 Mission Stats</div>

            {stats && (
                <>
                    <div className="stat-item">
                        <span className="stat-label">Total Experiments</span>
                        <span className="stat-value">{stats.totalExperiments}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Active Studies</span>
                        <span className="stat-value">{stats.activeExperiments}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Data Points</span>
                        <span className="stat-value">{stats.dataPointsProcessed?.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Success Rate</span>
                        <span className="stat-value">
                            {stats.activeExperiments > 0 
                                ? Math.round((stats.activeExperiments / stats.totalExperiments) * 100)
                                : 0}%
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [missionFilter, setMissionFilter] = useState('');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setActiveTab('summary');

        // Simulate AI processing
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    const tabs = [
        {
            id: 'summary',
            label: '🤖 AI Summary',
            component: <AISummary searchQuery={searchQuery} isLoading={isLoading} />
        },
        {
            id: 'experiments',
            label: '🧪 Experiments',
            component: (
                <ExperimentsGrid
                    categoryFilter={categoryFilter}
                    missionFilter={missionFilter}
                    searchQuery={searchQuery}
                />
            )
        },
        {
            id: 'realtime',
            label: '📡 Real-time',
            component: <RealTimeData />
        }
    ];

    return (
        <div className="dashboard">
            <div className="left-sidebar">
                <SearchSection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={handleSearch}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    missionFilter={missionFilter}
                    setMissionFilter={setMissionFilter}
                />
            </div>

            <div className="main-content">
                <div className="tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {tabs.find(tab => tab.id === activeTab)?.component}
                </div>
            </div>

            <div className="right-sidebar">
                <QuickStats />
            </div>
        </div>
    );
};

// Enhanced Modal Component
const ExperimentModal = ({ experiment, onClose }) => {
    const [dataPoints, setDataPoints] = useState([]);
    const [aiPrediction, setAiPrediction] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (experiment) {
            loadExperimentData();
        }
    }, [experiment]);

    const loadExperimentData = async () => {
        try {
            setIsLoadingData(true);

            // Load data points
            const data = await APIService.getDataPoints(experiment.id);
            setDataPoints(data);

            // Get AI prediction
            const prediction = await APIService.predictOutcome(experiment);
            setAiPrediction(prediction);
        } catch (error) {
            console.error('Error loading experiment data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!experiment) return null;

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                <h2>{experiment.title}</h2>
                <p className="modal-id">{experiment.id} • {experiment.category}</p>
                <p>{experiment.description}</p>

                <div className="modal-meta">
                    <div><strong>Organism:</strong> {experiment.organism}</div>
                    <div><strong>Duration:</strong> {experiment.duration}</div>
                    <div><strong>Mission:</strong> {experiment.mission}</div>
                </div>

                {/* AI Analysis Section */}
                {!isLoadingData && aiPrediction && (
                    <div className="ai-analysis-section">
                        <h3>🤖 AI Analysis</h3>
                        <div className="prediction-metrics">
                            <div className="metric">
                                <span className="metric-label">Success Probability:</span>
                                <span className="metric-value">
                                    {(aiPrediction.successProbability * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Confidence:</span>
                                <span className="metric-value">
                                    {(aiPrediction.confidenceLevel * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        {aiPrediction.riskFactors?.length > 0 && (
                            <div className="risk-factors">
                                <strong>Risk Factors:</strong>
                                <ul>
                                    {aiPrediction.riskFactors.map((risk, index) => (
                                        <li key={index}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {aiPrediction.recommendations?.length > 0 && (
                            <div className="recommendations">
                                <strong>Recommendations:</strong>
                                <ul>
                                    {aiPrediction.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Data Points Section */}
                {dataPoints.length > 0 && (
                    <div className="data-points-section">
                        <h3>📊 Recent Data ({dataPoints.length} points)</h3>
                        <div className="data-points-summary">
                            {dataPoints.slice(0, 5).map((point, index) => (
                                <div key={index} className="data-point">
                                    <span className="data-type">{point.measurementType}:</span>
                                    <span className="data-value">{point.value} {point.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isLoadingData && (
                    <div className="loading">
                        <div className="spinner"></div>
                        Loading experiment data...
                    </div>
                )}
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    return (
        <div>
            <Header />
            <Dashboard />
        </div>
    );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
