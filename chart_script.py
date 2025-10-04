# Create a cleaner, more readable system architecture diagram
diagram_code = '''
graph TD
    subgraph Infrastructure["🏗️ INFRASTRUCTURE LAYER"]
        direction LR
        F1[Docker<br/>Containers]
        F2[Nginx<br/>Proxy]
        F3[Redis<br/>Cache]
        F4[SSL/TLS]
    end
    
    subgraph Frontend["🖥️ FRONTEND LAYER"]
        direction LR
        A1[React<br/>Dashboard]
        A2[D3.js<br/>Visualizations]
        A3[WebSocket<br/>Client]
    end
    
    subgraph API["🔗 API LAYER"]
        direction LR
        B1[Express<br/>Server]
        B2[RESTful<br/>API]
        B3[WebSocket<br/>Server]
        B4[Authentication]
    end
    
    subgraph Services["🤖 AI/ML SERVICES"]
        direction LR
        C1[Text<br/>Analysis]
        C2[Predictive<br/>Modeling]
        C3[Pattern<br/>Recognition]
        C4[Data<br/>Processing]
    end
    
    subgraph Database["💾 DATABASE LAYER"]
        direction LR
        D1[MongoDB]
        D2[Experiments]
        D3[DataPoints]
        D4[Papers]
        D5[Analytics]
    end
    
    subgraph External["🌐 EXTERNAL SERVICES"]
        direction LR
        E1[NASA<br/>OSDR API]
        E2[GeneLab<br/>Database]
        E3[Real-time<br/>Feeds]
    end
    
    %% Main data flow - simplified and thicker
    Frontend ==> API
    API ==> Services
    API ==> Database
    API ==> External
    Infrastructure ==> API
    Services ==> Database
    
    %% Styling with better contrast and spacing
    classDef frontend fill:#B3E5EC,stroke:#1FB8CD,stroke-width:4px,color:#000
    classDef api fill:#A5D6A7,stroke:#2E8B57,stroke-width:4px,color:#000
    classDef services fill:#FFCDD2,stroke:#DB4545,stroke-width:4px,color:#000
    classDef database fill:#FFEB8A,stroke:#D2BA4C,stroke-width:4px,color:#000
    classDef external fill:#D4AFDF,stroke:#8B5CF6,stroke-width:4px,color:#000
    classDef infra fill:#E5E7EB,stroke:#374151,stroke-width:4px,color:#000
    
    class A1,A2,A3 frontend
    class B1,B2,B3,B4 api
    class C1,C2,C3,C4 services
    class D1,D2,D3,D4,D5 database
    class E1,E2,E3 external
    class F1,F2,F3,F4 infra
'''

# Create the cleaner mermaid diagram with optimal sizing
png_path, svg_path = create_mermaid_diagram(
    diagram_code, 
    png_filepath='nasa_dashboard_clean.png',
    svg_filepath='nasa_dashboard_clean.svg',
    width=1800,
    height=1400
)

print(f"Clean architecture diagram saved as: {png_path} and {svg_path}")