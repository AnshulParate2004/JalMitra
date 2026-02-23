# Household Water Quality – Mermaid Diagrams

## Whole architecture (single diagram)

```mermaid
flowchart TB
    subgraph Device["Device"]
        ESP32["ESP32 / sensors"]
    end

    subgraph Backend["FastAPI Backend"]
        API["POST /api/readings"]
        API --> Store["Store reading"]
        Store --> Check{"Threshold\nbreach?"}
        Check -->|Yes| AlertDB["Save alert"]
        Check -->|Yes| SMS["Send SMS (Twilio)"]
        Check -->|No| Broadcast
        AlertDB --> Broadcast["WebSocket broadcast"]
        Store --> Broadcast
    end

    subgraph Storage["Storage"]
        Supabase[("Supabase\nwater_readings\nwater_alerts")]
    end

    subgraph Client["Client"]
        React["React Dashboard\n(live + history + alerts)"]
    end

    ESP32 -->|"pH, turbidity, TDS"| API
    Store --> Supabase
    AlertDB --> Supabase
    SMS --> User["User phone"]
    Broadcast -->|"reading / alert"| React

    style ESP32 fill:lightblue,stroke:steelblue
    style API fill:coral,stroke:darkorange
    style Store fill:plum,stroke:purple
    style Check fill:lightyellow,stroke:gold
    style AlertDB fill:mistyrose,stroke:indianred
    style SMS fill:lightgreen,stroke:green
    style Broadcast fill:lightcyan,stroke:teal
    style React fill:palegreen,stroke:darkgreen
    style Supabase fill:lavender,stroke:mediumpurple
    style User fill:lightgray,stroke:gray
```

---

## 1. High-level architecture (flowchart)

```mermaid
flowchart LR
    subgraph Device["🖥️ Device"]
        ESP32[ESP32 / Wi-Fi]
    end

    subgraph Backend["⚙️ FastAPI Backend"]
        API[POST /api/readings]
        DB[(Supabase)]
        WS[WebSocket /ws]
        SMS[SMS Twilio]
        API --> DB
        API --> WS
        API --> SMS
    end

    subgraph Client["🖼️ Client"]
        React[React Dashboard]
    end

    ESP32 -->|HTTP POST| API
    WS -->|broadcast reading/alert| React
```

---

## 2. Sequence: one reading (no alert)

```mermaid
sequenceDiagram
    participant E as ESP32
    participant API as FastAPI
    participant DB as Supabase
    participant WS as WebSocket
    participant R as React

    E->>API: POST /api/readings (ph, turbidity, tds)
    API->>DB: insert water_readings
    DB-->>API: ok
    API->>WS: broadcast { type: "reading", data }
    WS->>R: message
    R->>R: update latest reading (live)
    API-->>E: 201 Created

    rect rgb(179, 229, 252)
        Note over E: Device
    end
    rect rgb(255, 204, 128)
        Note over API,WS: Backend
    end
    rect rgb(206, 147, 216)
        Note over DB: Storage
    end
    rect rgb(200, 230, 201)
        Note over R: React UI
    end
```

---

## 3. Sequence: reading triggers alert (SMS + WebSocket)

```mermaid
sequenceDiagram
    participant E as ESP32
    participant API as FastAPI
    participant DB as Supabase
    participant SMS as Twilio
    participant WS as WebSocket
    participant R as React
    participant U as User (phone)

    E->>API: POST /api/readings (e.g. ph out of range)
    API->>DB: insert water_readings
    DB-->>API: ok
    API->>API: check thresholds
    API->>DB: insert water_alerts
    API->>SMS: send alert SMS
    SMS->>U: SMS
    API->>WS: broadcast { type: "reading", data }
    API->>WS: broadcast { type: "alert", data }
    WS->>R: reading + alert messages
    R->>R: update latest + add to alerts list
    API-->>E: 201 Created

    rect rgb(179, 229, 252)
        Note over E: Device
    end
    rect rgb(255, 204, 128)
        Note over API,WS: Backend
    end
    rect rgb(206, 147, 216)
        Note over DB: Storage
    end
    rect rgb(165, 214, 167)
        Note over SMS,U: SMS
    end
    rect rgb(200, 230, 201)
        Note over R: React UI
    end
```

---

## 4. React WebSocket lifecycle

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting: connect()
    Connecting --> Connected: open
    Connecting --> Disconnected: error/close
    Connected --> Disconnected: close/error
    Connected --> Connected: onmessage (reading/alert)

    classDef disconnected fill:lightcoral,stroke:crimson
    classDef connecting fill:lightyellow,stroke:gold
    classDef connected fill:palegreen,stroke:green
    class Disconnected disconnected
    class Connecting connecting
    class Connected connected
```

---

## 5. Data flow (simplified)

```mermaid
flowchart TD
    A[ESP32 sends reading] --> B[Backend stores in Supabase]
    B --> C{Threshold breach?}
    C -->|Yes| D[Insert alert + Send SMS]
    C -->|No| E[Broadcast reading only]
    D --> E
    B --> E
    E --> F[WebSocket broadcast]
    F --> G[React: live latest + alerts]

    style A fill:lightblue,stroke:steelblue
    style B fill:coral,stroke:darkorange
    style C fill:lightyellow,stroke:gold
    style D fill:mistyrose,stroke:indianred
    style E fill:lightcyan,stroke:teal
    style F fill:skyblue,stroke:steelblue
    style G fill:palegreen,stroke:darkgreen
```

---

You can paste any of these blocks into a Markdown file or a Mermaid-compatible viewer (e.g. GitHub, Notion, [Mermaid Live Editor](https://mermaid.live)).
