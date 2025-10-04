const { useState, useEffect, useRef } = React;

// Application data
const appData = {
  "experiments": [
    {"id": "BRIC-24", "title": "Vacuole Formation in Microgravity", "description": "Studies how microgravity affects plant cell vacuole formation and fusion, essential for understanding plant growth in space", "impact": "Critical for developing sustainable food systems for long-duration Moon and Mars missions", "organism": "Arabidopsis plants", "mission": "ISS SpaceX CRS-22", "duration": "30 days", "category": "Plant Biology"},
    {"id": "BRIC-LED", "title": "Plant Defense Systems in Space", "description": "Investigates how plant defense mechanisms respond to bacterial threats in microgravity environment", "impact": "Ensures crop safety and disease resistance for space agriculture on Mars", "organism": "Tomato plants", "mission": "ISS Northrop Grumman CRS-20", "duration": "10 days", "category": "Plant Biology"},
    {"id": "RadGene", "title": "DNA Damage from Space Radiation", "description": "Examines p53-dependent gene expression and DNA repair mechanisms in space radiation environment", "impact": "Protects astronaut health during deep space missions to Mars by understanding radiation effects", "organism": "Human lymphoblastoid cells", "mission": "ISS Kibo facility", "duration": "133 days", "category": "Cell Biology"},
    {"id": "APEX-10", "title": "Plant-Microbe Interactions", "description": "Tests whether beneficial microbes can improve plant stress resilience in microgravity", "impact": "Increases plant productivity for sustainable life support systems on Moon and Mars", "organism": "Tomato plants with Trichoderma harzianum", "mission": "ISS Advanced Plant Experiments", "duration": "15 days", "category": "Plant Biology"},
    {"id": "BRIC-25", "title": "Bacterial Growth in Space", "description": "Studies how bacterial communication systems (quorum sensing) change in microgravity", "impact": "Safeguards astronaut health by understanding bacterial behavior in space environments", "organism": "Staphylococcus aureus", "mission": "ISS Northrop Grumman CRS-20", "duration": "21 days", "category": "Microbiology"},
    {"id": "RR-20", "title": "Estrogen Receptor Expression", "description": "Investigates changes in estrogen receptor expression that may influence bone loss in space", "impact": "Develops countermeasures for bone density loss during long-duration Mars missions", "organism": "Laboratory mice", "mission": "ISS SpaceX CRS-29", "duration": "60 days", "category": "Animal Biology"},
    {"id": "Mouse-ES", "title": "Embryonic Stem Cell Development", "description": "Observes mouse embryonic stem cell development and DNA damage in space radiation", "impact": "Understands reproductive health risks for multi-generational space colonization", "organism": "Mouse embryonic stem cells", "mission": "ISS Kibo facility", "duration": "180 days", "category": "Cell Biology"},
    {"id": "BRIC-SyNRGE", "title": "Symbiotic Root Nodulation", "description": "Studies how nitrogen-fixing bacteria form nodules with plant roots in microgravity", "impact": "Enables efficient nutrient cycling for sustainable agriculture on Mars", "organism": "Legume plants with Rhizobia", "mission": "ISS EXPRESS Rack", "duration": "28 days", "category": "Plant Biology"}
  ],
  "papers": [
    {"title": "GeneLab: Omics database for spaceflight experiments", "summary": "Comprehensive analysis of NASA's GeneLab database containing over 75 studies and 100+ omics datasets from space biology experiments, enabling systems biology approaches to understand spaceflight effects.", "url": "https://academic.oup.com/bioinformatics/article/35/10/1753/5134065", "relevance": 95},
    {"title": "Space Biology Research for Moon to Mars Exploration", "summary": "Review of NASA's strategy to advance understanding of biological responses to Moon, Mars, and deep space environments to support safe, productive human missions.", "url": "https://science.nasa.gov/biological-physical/programs/space-biology/", "relevance": 92},
    {"title": "Cellular responses to space radiation in human cultured cells", "summary": "Analysis of DNA damage, gene expression changes, and adaptive responses in human cells exposed to cosmic radiation during ISS experiments.", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4990110/", "relevance": 88}
  ],
  "fortuneCookies": [
    "🌱 Did you know? Plants grown in space have stronger cell walls but weaker roots - they're literally reaching for the stars!",
    "🧬 Space fact: Astronauts' DNA repair mechanisms work overtime in space, like having tiny molecular mechanics fixing cosmic damage!",
    "🦠 Microbe magic: Bacteria in space form biofilms 3x thicker than on Earth - they're building space condos!",
    "🌙 Lunar surprise: Moon dust is so abrasive it can damage spacesuits, but some plants might actually thrive in lunar soil!",
    "🧪 Space chemistry: Protein crystals grown in microgravity are larger and more perfect - space is nature's ultimate laboratory!",
    "🐭 Mouse mystery: Mice in space sleep 40% more but are more active when awake - the ultimate space power nap!",
    "🌿 Plant power: Space-grown lettuce has higher antioxidant levels - cosmic vegetables are superfoods!",
    "☀️ Solar secret: Plants in space photosynthesize differently because they can access sunlight from all angles!",
    "🦴 Bone biology: Astronauts lose 1-2% of bone mass per month in space - that's like aging 10 years in 6 months!",
    "🧬 Gene surprise: Over 1,000 genes change expression in space - your body literally rewrites itself among the stars!"
  ],
  "knowledgeGraph": {
    "nodes": [
      {"id": "microgravity", "label": "Microgravity", "type": "condition", "size": 20},
      {"id": "radiation", "label": "Space Radiation", "type": "condition", "size": 18},
      {"id": "plants", "label": "Plant Biology", "type": "organism", "size": 22},
      {"id": "cells", "label": "Cell Biology", "type": "organism", "size": 20},
      {"id": "microbes", "label": "Microbiology", "type": "organism", "size": 18},
      {"id": "dna-damage", "label": "DNA Damage", "type": "effect", "size": 16},
      {"id": "bone-loss", "label": "Bone Loss", "type": "effect", "size": 16},
      {"id": "immune-response", "label": "Immune Response", "type": "effect", "size": 15},
      {"id": "mars-mission", "label": "Mars Mission", "type": "application", "size": 19},
      {"id": "moon-mission", "label": "Moon Mission", "type": "application", "size": 17},
      {"id": "iss", "label": "International Space Station", "type": "platform", "size": 21}
    ],
    "links": [
      {"source": "microgravity", "target": "plants", "type": "affects"},
      {"source": "microgravity", "target": "cells", "type": "affects"},
      {"source": "microgravity", "target": "bone-loss", "type": "causes"},
      {"source": "radiation", "target": "dna-damage", "type": "causes"},
      {"source": "radiation", "target": "immune-response", "type": "affects"},
      {"source": "plants", "target": "mars-mission", "type": "enables"},
      {"source": "plants", "target": "moon-mission", "type": "enables"},
      {"source": "cells", "target": "mars-mission", "type": "informs"},
      {"source": "microbes", "target": "mars-mission", "type": "impacts"},
      {"source": "iss", "target": "plants", "type": "hosts"},
      {"source": "iss", "target": "cells", "type": "hosts"},
      {"source": "iss", "target": "microbes", "type": "hosts"}
    ]
  },
  "missionImpacts": [
    {"mission": "Moon", "experiment": "BRIC-24", "impact": "Understanding plant cell vacuole formation helps design hydroponic systems for lunar greenhouses", "timeline": "Critical for permanent lunar base food production by 2030"},
    {"mission": "Mars", "experiment": "APEX-10", "impact": "Beneficial microbes could reduce fertilizer needs by 60% for Mars agriculture", "timeline": "Essential for self-sustaining Mars colonies starting 2040"},
    {"mission": "Mars", "experiment": "RadGene", "impact": "DNA repair insights help develop radiation protection protocols for 6-month Mars journey", "timeline": "Prevents 15-30% increase in cancer risk during Mars transit"},
    {"mission": "Moon", "experiment": "RR-20", "impact": "Bone loss countermeasures prevent 20% bone density loss during 18-month lunar missions", "timeline": "Maintains astronaut mobility for surface operations by 2028"}
  ]
};

// Header Component (includes theme toggle)
const Header = () => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('color-scheme');
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-color-scheme', theme);
      localStorage.setItem('color-scheme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-text">🚀 Space Biology Dashboard</div>
          <div className="nasa-badge">NASA</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

// Search Section Component
const SearchSection = ({ searchQuery, setSearchQuery, onSearch, categoryFilter, setCategoryFilter, missionFilter, setMissionFilter }) => {
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch();
  };

  const suggestions = searchQuery
    ? appData.experiments
        .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 6)
    : [];

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
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
        />
        <button type="submit" className="search-btn">
          🔍
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="suggestions" role="listbox">
          {suggestions.map((s) => (
            <button key={s.id} className="suggestion-item" onClick={() => handleSuggestionClick(s.title)}>
              {s.title} <small className="suggestion-meta"> — {s.id}</small>
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
          </select>
        </div>
      </div>
    </div>
  );
};

// AI Summary Component
const AISummary = ({ searchQuery, isLoading }) => {
  if (!searchQuery) {
    return (
      <div className="ai-summary">
        <div className="summary-header">
          <div className="ai-icon">🤖</div>
          <h3>AI Research Assistant</h3>
        </div>
        <p className="summary-text">
          Ask me anything about space biology research! I can help you understand experiments, 
          their implications for space exploration, and connect you to relevant NASA papers.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ai-summary">
        <div className="loading">
          <div className="spinner"></div>
          Processing your question...
        </div>
      </div>
    );
  }

  // Generate contextual summary based on search query
  const generateSummary = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('plant') || lowerQuery.includes('grow')) {
      return {
        text: "Space biology research shows that plants face unique challenges in microgravity, including altered cell wall formation and weakened root systems. However, studies like BRIC-24 and APEX-10 demonstrate that plants can adapt and even thrive with proper support systems. This research is crucial for developing sustainable food production systems for Mars colonies.",
        relevantPapers: appData.papers.filter(p => p.relevance > 90)
      };
    } else if (lowerQuery.includes('radiation') || lowerQuery.includes('dna')) {
      return {
        text: "Space radiation poses significant risks to astronauts through DNA damage and cellular stress. The RadGene experiment reveals how p53-dependent repair mechanisms work overtime in space. Understanding these processes is essential for protecting crew health during long-duration missions to Mars.",
        relevantPapers: appData.papers.filter(p => p.title.toLowerCase().includes('radiation') || p.title.toLowerCase().includes('cellular'))
      };
    } else if (lowerQuery.includes('microbe') || lowerQuery.includes('bacteria')) {
      return {
        text: "Microbial behavior changes dramatically in space environments. The BRIC-25 study shows bacteria form thicker biofilms and alter their communication systems in microgravity. This research helps us understand both risks and opportunities for using beneficial microbes in space agriculture.",
        relevantPapers: appData.papers.slice(0, 2)
      };
    } else {
      return {
        text: "NASA's space biology research program investigates how living organisms respond to the unique conditions of spaceflight, including microgravity, radiation, and isolation. This research is fundamental to enabling safe, long-duration human missions to the Moon and Mars.",
        relevantPapers: appData.papers
      };
    }
  };

  const summary = generateSummary(searchQuery);

  return (
    <div className="ai-summary">
      <div className="summary-header">
        <div className="ai-icon">🤖</div>
        <h3>AI Analysis: "{searchQuery}"</h3>
      </div>
      <p className="summary-text">{summary.text}</p>
      <div className="paper-links">
        {summary.relevantPapers.map((paper, index) => (
          <a 
            key={index}
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="paper-link"
          >
            📄 {paper.title}
          </a>
        ))}
      </div>
    </div>
  );
};

// Knowledge Graph Component
const KnowledgeGraph = () => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 500;
    
    svg.attr("width", width).attr("height", height);

    const { nodes, links } = appData.knowledgeGraph;

    // Color mapping for node types
    const colorMap = {
      condition: '#3b82f6',
      organism: '#22c55e', 
      effect: '#ef4444',
      application: '#f59e0b',
      platform: '#8b5cf6'
    };

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => colorMap[d.type])
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("font-size", 12)
      .attr("fill", "#e2e8f0")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("pointer-events", "none");

    // Add drag behavior
    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Add hover effects
    node
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", d.size * 1.2);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("r", d.size);
      });

  }, []);

  return (
    <div className="knowledge-graph">
      <svg ref={svgRef} className="graph-svg"></svg>
    </div>
  );
};

// Experiment Card Component
const ExperimentCard = ({ experiment, onOpen }) => {
  const getCategoryClass = (category) => {
    const categoryMap = {
      'Plant Biology': 'category-plant',
      'Cell Biology': 'category-cell',
      'Microbiology': 'category-microbiology',
      'Animal Biology': 'category-animal'
    };
    return categoryMap[category] || 'category-plant';
  };

  return (
    <div className="experiment-card" tabIndex={0} role="button" onClick={() => onOpen(experiment)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(experiment); }}>
      <div className="card-header">
        <div className="experiment-id">{experiment.id}</div>
        <div className={`category-badge ${getCategoryClass(experiment.category)}`}>
          {experiment.category}
        </div>
      </div>
      <h3 className="experiment-title">{experiment.title}</h3>
      <p className="experiment-description">{experiment.description}</p>
      <div className="experiment-meta">
        <div><strong>Organism:</strong> {experiment.organism}</div>
        <div><strong>Duration:</strong> {experiment.duration}</div>
        <div><strong>Mission:</strong> {experiment.mission}</div>
        <div><strong>Impact:</strong> {experiment.impact}</div>
      </div>
    </div>
  );
};

// Experiments Grid Component
const ExperimentsGrid = ({ experiments, categoryFilter, missionFilter, onOpen }) => {
  const filteredExperiments = experiments.filter(exp => {
    const categoryMatch = !categoryFilter || exp.category === categoryFilter;
    const missionMatch = !missionFilter || exp.impact.toLowerCase().includes(missionFilter.toLowerCase());
    return categoryMatch && missionMatch;
  });

  return (
    <div className="experiments-grid">
      {filteredExperiments.map((experiment) => (
        <ExperimentCard key={experiment.id} experiment={experiment} onOpen={() => onOpen(experiment)} />
      ))}
    </div>
  );
};

// Impact Explorer Component
const ImpactExplorer = ({ missionFilter }) => {
  const filteredImpacts = appData.missionImpacts.filter(impact => 
    !missionFilter || impact.mission === missionFilter
  );

  const getMissionClass = (mission) => {
    return mission === 'Moon' ? 'mission-moon' : 'mission-mars';
  };

  return (
    <div className="impact-timeline">
      {filteredImpacts.map((impact, index) => (
        <div key={index} className="impact-item">
          <div className="impact-header">
            <div className={`mission-badge ${getMissionClass(impact.mission)}`}>
              {impact.mission} Mission
            </div>
            <div className="timeline-badge">{impact.timeline.split(' ').pop()}</div>
          </div>
          <h4>Experiment: {impact.experiment}</h4>
          <p>{impact.impact}</p>
          <small className="timeline-text">{impact.timeline}</small>
        </div>
      ))}
    </div>
  );
};

// Fortune Cookie Component
const FortuneCookie = () => {
  const [currentFact, setCurrentFact] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const nextFact = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentFact((prev) => (prev + 1) % appData.fortuneCookies.length);
      setIsVisible(true);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(nextFact, 10000); // Change every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fortune-cookie" onClick={nextFact} style={{ opacity: isVisible ? 1 : 0.5 }}>
      <div className="fortune-header">
        🥠 Space Biology Fortune Cookie
      </div>
      <div className="fortune-text">
        {appData.fortuneCookies[currentFact]}
      </div>
    </div>
  );
};

// Experiment Modal
const ExperimentModal = ({ experiment, onClose }) => {
  if (!experiment) return null;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>{experiment.title}</h2>
        <p className="modal-id">{experiment.id} • {experiment.category}</p>
        <p>{experiment.description}</p>
        <div className="modal-meta">
          <div><strong>Organism:</strong> {experiment.organism}</div>
          <div><strong>Duration:</strong> {experiment.duration}</div>
          <div><strong>Mission:</strong> {experiment.mission}</div>
        </div>
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats = ({ experiments }) => {
  const stats = {
    totalExperiments: experiments.length,
    plantExperiments: experiments.filter(e => e.category === 'Plant Biology').length,
    cellExperiments: experiments.filter(e => e.category === 'Cell Biology').length,
    avgDuration: Math.round(
      experiments.reduce((sum, e) => sum + parseInt(e.duration), 0) / experiments.length
    )
  };

  return (
    <div className="quick-stats">
      <div className="stats-header">Mission Stats</div>
      <div className="stat-item">
        <span className="stat-label">Total Experiments</span>
        <span className="stat-value">{stats.totalExperiments}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Plant Studies</span>
        <span className="stat-value">{stats.plantExperiments}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Cell Studies</span>
        <span className="stat-value">{stats.cellExperiments}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Avg Duration</span>
        <span className="stat-value">{stats.avgDuration} days</span>
      </div>
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
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setActiveTab('summary');
    
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const tabs = [
    { id: 'summary', label: '🤖 AI Summary', component: <AISummary searchQuery={searchQuery} isLoading={isLoading} /> },
    { id: 'graph', label: '🕸️ Knowledge Graph', component: <KnowledgeGraph /> },
    { id: 'experiments', label: '🧪 Experiments', component: <ExperimentsGrid experiments={appData.experiments} categoryFilter={categoryFilter} missionFilter={missionFilter} onOpen={(exp) => setSelectedExperiment(exp)} /> },
    { id: 'impact', label: '🚀 Impact Explorer', component: <ImpactExplorer missionFilter={missionFilter} /> }
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
          {tabs.map(tab => (
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
        {selectedExperiment && (
          <ExperimentModal experiment={selectedExperiment} onClose={() => setSelectedExperiment(null)} />
        )}
      </div>

      <div className="right-sidebar">
        <FortuneCookie />
        <QuickStats experiments={appData.experiments} />
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