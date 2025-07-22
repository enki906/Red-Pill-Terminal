const { Terminal } = require('@xterm/xterm');
const { FitAddon } = require('@xterm/addon-fit');

const RED = '\x1b[38;2;255;52;71m';
const BLUEGREY = '\x1b[38;2;96;130;185m';
const RESET = '\x1b[0m';

const PROMPT = `${BLUEGREY}Mindprisoner42@Red-Pill-Terminal${RESET}${RED} $:${RESET} `;

let inputBuffer = '';

const terminal = new Terminal({
  theme: {
    background: '#050106',
    foreground: '#ff3447',
    cursor: '#ff3447',
    selection: '#ff344755'
  },
  fontFamily: 'Fira Mono, JetBrains Mono, monospace',
  fontWeightBold: 'bold',
  cursorBlink: true,
  cursorStyle: 'block',
  rendererType: 'canvas'
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

function showPrompt() {
  terminal.write('\r\n' + PROMPT);
}

function handleInput() {
  terminal.onData(e => {
    switch (e) {
      case '\u0003': // Ctrl+C
        terminal.write('^C\r\n');
        inputBuffer = '';
        showPrompt();
        break;
      case '\r': // Enter
        terminal.write('\r\n');
        handleCommand(inputBuffer.trim());
        inputBuffer = '';
        showPrompt();
        break;
      case '\u007F': // Backspace
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          terminal.write('\b \b');
        }
        break;
      default:
        if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E)) {
          inputBuffer += e;
          terminal.write(e);
        }
    }
  });
}

function handleCommand(cmd) {
  if (!cmd) return;
  switch (cmd) {
    case 'help':
      terminal.writeln(`${BLUEGREY}Available commands: help, redpill, reality, clear, ls, cat, pwd, chmod${RESET}`);
      break;
    case 'redpill':
      terminal.writeln(`${RED}[Die Realität löst sich auf, als hättest du die ROTE PILLE genommen...]${RESET}`);
      break;
    case 'reality':
      terminal.writeln(`${BLUEGREY}What is real, Neo?${RESET}`);
      break;
    case 'clear':
      terminal.clear();
      showPrompt();
      break;
    case 'ls':
      terminal.writeln('the_white_rabbit mor7h3u5.enc r3d_p1ll.dat');
      break;
    case 'cat the_white_rabbit':
      terminal.writeln('Follow the white rabbit...');
      break;
    case 'pwd':
      terminal.writeln('/home/neo');
      break;
    case 'chmod +x the_white_rabbit':
      terminal.writeln('[ERROR] File system integrity compromised...');
      terminal.writeln('[WARNING] Reality.dll has stopped responding...');
      terminal.writeln('[INFO] Relocating quantum signature to secure location...');
      terminal.writeln('[SUCCESS] Welcome to the desert of the real.');
      break;
    default:
      terminal.writeln(`${RED}Command not found: ${cmd}${RESET}`);
  }
}

function randomGlitch() {
  if (Math.random() > 0.985) {
    const garble = [
      '\u2592\u2593\u2588\u25A0', // ▒▓█■
      '\u2206\u03A9\u2248\u00A7\u00B6', // ∆Ω≈§¶
      '\u2E18\u21AF\u2630\u2622\u21D4', // ⸘↯☰☲⇔
      '%#@*'
    ];
    terminal.write(`\x1b[38;2;96;130;185m${garble[Math.floor(Math.random() * garble.length)]}${RESET}`);
    terminal.write(`\r${PROMPT}${inputBuffer}`); // Prompt zurücksetzen
  }
  setTimeout(randomGlitch, 2600 + Math.random() * 1500);
}

window.addEventListener('DOMContentLoaded', () => {
  const terminalElem = document.getElementById('terminal');
  terminal.open(terminalElem);
  fitAddon.fit();
  terminal.focus();
  terminal.writeln(`${RED}SYSTEM FAILURE DETECTED...`);
  terminal.writeln(`${BLUEGREY}EMERGENCY RED-PILL TERMINAL ONLINE...${RESET}`);
  terminal.writeln('');
  showPrompt();
  handleInput();
  randomGlitch();
});

window.addEventListener('resize', () => {
  fitAddon.fit();
  terminal.focus();
});