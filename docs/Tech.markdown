# **Tech.txt: Technische Spezifikation für Red-Pill-Terminal**

## **Überblick**
*Red-Pill-Terminal* ist ein psychologisches Horror-Edutainment-Spiel, das in einer immersiven, terminalbasierten Umgebung spielt. Es kombiniert Linux-Training mit einer narrativen Reise, die den Spieler dazu anregt, die Natur der Realität zu hinterfragen, inspiriert von philosophischen Konzepten (*Pure_Story.txt*: Unix-Philosophie, Quantenbewusstsein, hermetische Prinzipien). Die technische Architektur ist darauf ausgelegt, eine Matrix-ähnliche Atmosphäre mit CRT-Effekten, Glitch-Mechaniken und einem dynamischen Dateisystem zu schaffen, das auf Spieleraktionen reagiert (*Pure_Story.txt*: „Reality-Bleed“).

Dieses Dokument beschreibt die technische Raffinesse des Projekts, einschließlich Frontend, Backend, Sandbox, Dateisystem, UI-Effekte, und Kommunikationsmechanismen. Es dient als Grundlage für die Weiterentwicklung und stellt sicher, dass alle Komponenten modular, testbar und mit der Vision des Spiels abgestimmt sind.

---

## **Technische Anforderungen**

### **Zielplattform**
- **Primär**: Linux-Native (Ubuntu, Debian)
- **Sekundär**: Windows/macOS (über WSL oder plattformübergreifende Kompatibilität)
- **Anwendung**: Desktop-App via Electron, mit terminalbasierter UI

### **Technologie-Stack**
- **Frontend**: 
  - Electron (Node.js) für plattformübergreifende Desktop-Apps
  - `@xterm/xterm.js` für Terminal-UI
  - WebGL/Canvas für CRT- und Glitch-Effekte
  - CSS für responsive Design und visuelle Effekte
- **Backend**:
  - Python für Spiel-Logik, Missions-Engine und Sandbox-Interpreter
  - `pyfilesystem2` für virtuelles Dateisystem
- **Kommunikation**: Inter-Process Communication (IPC) via stdin/stdout zwischen Electron und Python
- **Abhängigkeiten**:
  - Node.js: `xterm`, `xterm-addon-fit`
  - Python: `pyfilesystem2`
  - Fonts: Fira Mono, JetBrains Mono (für Matrix-Ästhetik)

### **Dateistruktur**
Basierend auf `Tree.txt`:
```
Red-Pill-Terminal/
├── src/
│   ├── backend/
│   │   ├── main.py
│   │   ├── vfs.py
│   │   ├── sandbox.py
│   │   ├── missions/
│   │   │   └── engine.py
│   │   └── mentors/
│   │       └── mentor.py
│   ├── frontend/
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── renderer.js
│   │   ├── assets/
│   │   │   └── fonts/
│   │   │       └── matrix.ttf
│   │   └── styles/
│   │       └── terminal.css
├── venv/
├── package.json
├── README.md
├── Pure_Story.txt
└── Tech.txt
```

---

## **Frontend**

### **Electron**
- **Rolle**: Plattformübergreifende Desktop-App, die die Terminal-UI hostet.
- **Implementierung**: 
  - `main.js`: Konfiguriert das Electron-Hauptfenster (`BrowserWindow`) mit:
    - Standardgröße: 1280x720px, resizable
    - `frame: false` für rahmenloses Design (Matrix-Ästhetik)
    - `nodeIntegration: true`, `contextIsolation: false` (für Entwicklung, später sicherer konfigurieren)
  - `index.html`: Minimalistische HTML-Struktur mit Container für `xterm.js` (`#terminal`) und dekorativen Layern (`#portal-shell`, `#crt-glow`, `#crt-scanlines`).
- **Zukünftige Verbesserungen**:
  - Sicherheitskonfiguration (`nodeIntegration: false`, `contextIsolation: true`)
  - Vollbild-Option mit ESC-Unterstützung

### **Terminal-UI (xterm.js)**
- **Rolle**: Interaktive Terminal-Oberfläche mit Matrix-ähnlicher Ästhetik.
- **Implementierung** (`renderer.js`):
  - **xterm.js**: Initialisiert mit:
    - `theme`: Transparenter Hintergrund, `#ff3447` (rot) für Text und Cursor
    - `fontFamily`: Fira Mono, JetBrains Mono
    - `cursorBlink: true`, `cursorStyle: block` für hypnotischen Cursor
    - `scrollOnUserInput: true`, `scrollback: 1000` für Scroll-Verhalten
  - **FitAddon**: Dynamische Anpassung an Fenstergröße (`fitAddon.fit()` bei `resize`).
  - **Eingabeverarbeitung**: 
    - `onData` behandelt Eingaben (Enter, Backspace, Ctrl+C, druckbare Zeichen).
    - `inputBuffer` speichert Eingaben vor der Verarbeitung.
  - **Focus-Management**: Event-Listener (`click`, `keydown`, `mousemove`) halten Fokus auf Terminal.
  - **Glitch-Effekte**: `randomGlitch()` erzeugt zufällige Unicode-Glitches (z. B. `▒▓█■`) für Horror-Atmosphäre.
- **Zukünftige Verbesserungen**:
  - WebGL-basierte Glitch-Animationen
  - Tastenkombinationen für Story-Trigger (z. B. `Ctrl+R` für „Reality-Break“)

### **CSS und visuelle Effekte (terminal.css)**
- **Rolle**: Matrix-ähnliche Ästhetik mit CRT-Effekten und hypnotischem Cursor.
- **Implementierung**:
  - **Responsive Design**:
    - `body`: `display: flex`, `height: 100vh` für Vollbild-Layout
    - `#terminal`: `height: calc(100vh - 40px)`, `overflow-y: auto` für Scrollen
  - **CRT-Effekte**:
    - `#portal-shell`: Radialer Farbverlauf, animierter `box-shadow` (`portalRedPulse`)
    - `#crt-glow`: Pulsierender Glow-Effekt (`crtGlow`)
    - `#crt-scanlines`: Scanlines via `repeating-linear-gradient`
  - **Hypnotischer Cursor**: `.xterm-cursor-block` mit `hypnoticBlink`-Animation (pulsierende Opazität, Skalierung, Glow).
  - **Text-Styling**: Neonartiger Text mit `text-shadow` und `#ff3447`-Farbe.
- **Zukünftige Verbesserungen**:
  - WebGL-Shader für dynamische Portal-Effekte
  - Partikelanimationen für Reality-Bleed-Effekte

---

## **Backend**

### **Python-Backend**
- **Rolle**: Verarbeitet Spiel-Logik, Sandbox-Befehle und Missions-Engine.
- **Implementierung** (`main.py`, `vfs.py`, `sandbox.py`):
  - **main.py**: Einstiegspunkt, empfängt Befehle von Electron via stdin und gibt JSON-Antworten aus.
  - **vfs.py**: Virtuelles Dateisystem mit `pyfilesystem2` (MemoryFS):
    - Verzeichnisse: `/home/neo`, `/home/neo/.Trinity`, `/home/neo/.rabbithole`, `/var/log`
    - Dateien: Story-relevante Inhalte (z. B. `welcome.txt`, `mor7h3u5.enc`, `the_white_rabbit`)
    - Dynamische Dateien: Unterstützen Reality-Feedback-Loop (z. B. neue Dateien nach `chmod +x the_white_rabbit`)
  - **sandbox.py**: Sicherer Bash-Interpreter:
    - Unterstützte Befehle: `ls`, `cat`, `pwd`, `chmod`, `man`, `help`
    - Optionen: `ls -l`, `ls -la`
    - Sicherheit: Interception gefährlicher Befehle (z. B. `rm`, `reboot`)
- **Zukünftige Verbesserungen**:
  - Erweiterung um `cd`, `grep`, `touch`, `decode` (*Pure_Story.txt*: Phase 2)
  - Persistentes Dateisystem für Spielstände
  - Integration von `ps aux` für Process-NPCs

### **Missions-Engine**
- **Rolle**: Steuert Story-Missionen (*Pure_Story.txt*: „follow_the_white_rabbit“).
- **Implementierung**: Noch in Entwicklung (`missions/engine.py`):
  - Kapitelweise Freischaltung von Befehlen
  - Trigger für Story-Events (z. B. Glitch nach `./the_white_rabbit`)
- **Zukünftige Verbesserungen**:
  - Fraktale Missionsstrukturen (Mandebrot-ähnlich, *Pure_Story.txt*: Phase 2)
  - Integration mit Mentoren-System

### **Mentoren-System**
- **Rolle**: Dynamische Dialoge basierend auf Spieleraktionen (*Pure_Story.txt*: Phase 3).
- **Implementierung**: Noch in Entwicklung (`mentors/mentor.py`):
  - State-Machine für Mentoren (Smith, Trinity, Morpheus, Neo, Orakel)
  - Trigger: Fehler (Smith), Erfolge (Trinity), komplexe Befehle (Morpheus)
- **Zukünftige Verbesserungen**:
  - Philosophische Dialoge mit psychologischen Triggern
  - Reaktion auf Spielerverhalten (z. B. wiederholtes Ausführen von `the_white_rabbit`)

---

## **Inter-Process Communication (IPC)**
- **Rolle**: Kommunikation zwischen Electron-Frontend und Python-Backend.
- **Implementierung**:
  - **Mechanism**: Electron spawnt Python-Prozess (`child_process.spawn`) und kommuniziert via stdin/stdout.
  - **Format**: JSON (`{ "output": "..." }`) für strukturierte Antworten.
  - **Beispiel**:
    - Eingabe: `ls`
    - Ausgabe: `{"output": "welcome.txt diary.txt reality.txt"}`
- **Zukünftige Verbesserungen**:
  - Optimierung durch persistente Prozesse (statt `spawn` pro Befehl)
  - Fehlerbehandlung für IPC-Ausfälle
  - Unterstützung für asynchrone Story-Events

---

## **Virtuelles Dateisystem**
- **Rolle**: Simuliert ein Linux-Dateisystem mit Story-Elementen (*Pure_Story.txt*: Phase 2).
- **Implementierung** (`vfs.py`):
  - **Bibliothek**: `pyfilesystem2` (MemoryFS für Sicherheit)
  - **Struktur**:
    - `/home/neo`: Hauptverzeichnis mit Dateien wie `welcome.txt`, `diary.txt`, `reality.txt`
    - `/home/neo/.Trinity`: Verstecktes Verzeichnis mit `the_white_rabbit`
    - `/home/neo/.rabbithole`: Verstecktes Verzeichnis mit Story-Hinweisen
    - `/var/log/system.log`: Dynamische Logs für Horror-Atmosphäre
  - **Dateiinhalte**:
    - Story-Dateien: `unix_philosophy_beyond_ken_thompson.md`, `quantum_consciousness_observer_effect.pdf`, etc.
    - Kryptografische Rätsel: `mor7h3u5.enc` (binär verschlüsselt)
    - Ausführbare Dateien: `rabbit_hint.sh`, `the_white_rabbit` (mit `rwxr-xr-x`)
  - **Reality-Feedback-Loop**: Dateien ändern sich basierend auf Spieleraktionen (z. B. neue Dateien nach `chmod +x the_white_rabbit`).
- **Zukünftige Verbesserungen**:
  - „Atmende“ Dateien (dynamische Größenänderung)
  - Fake Surveillance (Logs, die Spieleraktionen „beobachten“)
  - Cron-Jobs für zeitgesteuerte Events

---

## **Sandbox-Engine**
- **Rolle**: Sicherer Bash-Interpreter für Linux-Lernziele (*Tech.txt*: „Kontrollierte Bash-Befehle“).
- **Implementierung** (`sandbox.py`):
  - **Befehle**: `ls`, `cat`, `pwd`, `chmod`, `man`, `help`
  - **Sicherheit**: Interception gefährlicher Befehle (z. B. `rm`, `reboot`) via Wrapper
  - **Kapitelsteuerung**: Befehle werden kapitelweise freigeschaltet (*Pure_Story.txt*: Phase 1–3)
- **Zukünftige Verbesserungen**:
  - Erweiterung um `cd`, `grep`, `touch`, `decode`
  - Simulation virtueller Prozesse (`ps aux`)
  - Symlink-Unterstützung für Story-Puzzle

---

## **Visuelle und narrative Raffinesse**
- **Matrix-Ästhetik**: 
  - Farben: `#ff3447` (rot), `#050106` (schwarz), `#64a4cb` (blaugrau)
  - Schrift: Fira Mono, JetBrains Mono
  - Glitches: Zufällige Unicode-Zeichen (`randomGlitch` in `renderer.js`)
- **CRT-Effekte**:
  - Scanlines: `repeating-linear-gradient` in `terminal.css`
  - Glow: Pulsierende `box-shadow` (`portalRedPulse`, `crtGlow`)
  - Hypnotischer Cursor: `hypnoticBlink`-Animation mit pulsierendem Glow
- **Narrative Integration**:
  - Initialtext: „SYSTEM FAILURE DETECTED...“, „Hat jemand da draußen einen weißen Hasen gesehen?“ (*Pure_Story.txt*: Phase 1–2)
  - Reality-Feedback-Loop: Dynamische Dateiänderungen für Horror-Atmosphäre
  - Mentoren-Dialoge: Philosophische Texte, die auf Spielerverhalten reagieren (*Pure_Story.txt*: Phase 3)

---

## **Zukünftige Entwicklungsziele**
1. **Sandbox-Erweiterung**:
   - Neue Befehle: `cd`, `grep`, `touch`, `decode`
   - Process-NPCs: Simulation von `ps aux`
   - Symlinks und virtuelle Prozesse
2. **Missions-Engine**:
   - Fraktale Missionsstrukturen (*Pure_Story.txt*: „Mandebrot-ähnlich“)
   - Trigger für Story-Events (z. B. Glitch nach `./the_white_rabbit`)
3. **Mentoren-System**:
   - Dynamische Dialoge mit State-Machine
   - Philosophische Tiefe und psychologische Trigger
4. **UI-Effekte**:
   - WebGL-Shader für Portal-Effekte
   - Partikelanimationen für Reality-Break
5. **Spielstände**:
   - Persistentes Dateisystem für Fortschrittsspeicherung
   - Konfigurationsdatei für Kapitelsteuerung
6. **Mehrsprachigkeit**:
   - Unterstützung für Englisch, Deutsch, etc.
7. **Spracherkennung**:
   - Integration von Sprachbefehlen für immersive Interaktion

---

## **Technische Herausforderungen**
- **Größenanpassung**:
  - **Problem**: Der Prompt wurde am unteren Bildschirmrand abgeschnitten.
  - **Lösung**: `terminal.css` mit `height: calc(100vh - 40px)` und `overflow-y: auto` angepasst; `fitAddon.fit()` und `scrollToBottom()` in `renderer.js` optimiert.
- **Focus-Management**:
  - **Problem**: Fokus ging verloren, erforderte Maustaste.
  - **Lösung**: `click`, `keydown`, `mousemove`-Listener in `renderer.js`; `#portal-shell` mit `pointer-events: none` in `terminal.css`.
- **Performance**:
  - **Problem**: `spawn` pro Befehl in `renderer.js` ist ineffizient.
  - **Lösung**: Persistenter Python-Prozess für IPC in zukünftigen Iterationen.
- **Sicherheit**:
  - **Problem**: `nodeIntegration: true`, `contextIsolation: false` sind unsicher.
  - **Lösung**: Sicherheitskonfiguration in späteren Versionen implementieren.

---

## **Test- und Debugging-Strategie**
- **Unit-Tests**:
  - Backend: `pytest` für `vfs.py`, `sandbox.py`
  - Frontend: `jest` für `renderer.js` (zukünftig)
- **Integrationstests**:
  - IPC: Teste Kommunikation zwischen `main.py` und `renderer.js`
  - UI: Manuelle Tests mit `npm start` und Entwicklerkonsole (`Ctrl+Shift+I`)
- **Debugging**:
  - Electron DevTools für UI-Fehler
  - `console.log` in `renderer.js` für Fokus- und Scroll-Probleme
  - Python-Logs für Backend-Fehler

---

## **Anweisungen für Grok 3**
- **Vision verstehen**: *Red-Pill-Terminal* ist ein psychologisches Horror-Edutainment-Spiel, das Linux-Lernen mit Realitäts-Hinterfragung kombiniert (*Pure_Story.txt*).
- **Technischer Kontext**: 
  - Frontend: Electron, `xterm.js`, WebGL/CSS für Effekte
  - Backend: Python, `pyfilesystem2`, Sandbox-Interpreter
  - IPC: JSON über stdin/stdout
- **Story-Integration**: 
  - Subtile Hinweise („Hat jemand da draußen einen weißen Hasen gesehen?“)
  - Reality-Feedback-Loop für dynamische Dateiänderungen
  - Mentoren-Dialoge mit philosophischer Tiefe
- **Prioritäten**:
  - Stabilisierung der UI (Größe, Fokus, Cursor)
  - Erweiterung der Sandbox und Missions-Engine
  - Implementierung von Glitch- und Portal-Effekten

---

## **Referenzen**
- [xterm.js Dokumentation](https://xtermjs.org/)
- [Electron Dokumentation](https://www.electronjs.org/)
- [PyFilesystem2 Dokumentation](https://docs.pyfilesystem.org/)
- [Unix-Philosophie](https://en.wikipedia.org/wiki/Unix_philosophy)
- [Matrix-Ästhetik Inspiration](https://en.wikipedia.org/wiki/The_Matrix)