const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

css = css.replace(/:root, \\.dark \{[\s\S]*?\}/, \:root, .theme-plum {
    color-scheme: light;
    --bg: #FFF3E6;
    --card: #FFF8F0;
    --border: rgba(56, 25, 50, 0.15);
    --primary: #381932;
    --primary-light: #572A4E;
    --text: #1C0C19;
    --text-muted: #6A5B67;
    --text-strong: #000000;
    --accent: #E6D5B8;
    
    --success: #2E7D32;
    --danger: #C62828;
    --warning: #D97706;

    --field-bg: rgba(255, 255, 255, 0.8);
    --surface-bg: rgba(255, 243, 230, 0.72);
    --soft-surface-bg: rgba(255, 248, 240, 0.58);
    --surface-hover-border: rgba(56, 25, 50, 0.35);
    --shadow-strong: rgba(56, 25, 50, 0.14);
    --shadow-hover: rgba(56, 25, 50, 0.2);
    --bg-atmo-1: rgba(230, 213, 184, 0.35);
    --bg-atmo-2: rgba(56, 25, 50, 0.1);
    --bg-gradient: linear-gradient(150deg, #FFF3E6 0%, #FFF8F0 55%, #F4E8D8 100%);

    --background: var(--bg);
    --foreground: var(--text);
    --card-foreground: var(--text);
    --popover: var(--card);
    --popover-foreground: var(--text);
    --primary-foreground: #FFF3E6;
    --secondary: var(--bg-atmo-1);
    --secondary-foreground: var(--text);
    --muted: var(--bg-atmo-2);
    --muted-foreground: var(--text-muted);
    --accent-foreground: var(--text);
    --destructive-foreground: #ffffff;
    --input: var(--border);
    --ring: var(--primary);
  }\);

css = css.replace(/\\.gold \{[\s\S]*?\}/, \.theme-cyprus {
    color-scheme: light;
    --bg: #F0EDE5;
    --card: #F9F8F6;
    --border: rgba(0, 70, 67, 0.15);
    --primary: #004643;
    --primary-light: #006662;
    --text: #002221;
    --text-muted: #4B6361;
    --text-strong: #000000;
    --accent: #B4CFC1;

    --success: #2E7D32;
    --danger: #C62828;
    --warning: #D97706;

    --field-bg: rgba(255, 255, 255, 0.8);
    --surface-bg: rgba(240, 237, 229, 0.72);
    --soft-surface-bg: rgba(249, 248, 246, 0.58);
    --surface-hover-border: rgba(0, 70, 67, 0.35);
    --shadow-strong: rgba(0, 70, 67, 0.14);
    --shadow-hover: rgba(0, 70, 67, 0.2);
    --bg-atmo-1: rgba(180, 207, 193, 0.35);
    --bg-atmo-2: rgba(0, 70, 67, 0.1);
    --bg-gradient: linear-gradient(145deg, #F0EDE5 0%, #F9F8F6 45%, #E2DFD6 100%);

    --background: var(--bg);
    --foreground: var(--text);
    --card-foreground: var(--text);
    --popover: var(--card);
    --popover-foreground: var(--text);
    --primary-foreground: #ffffff;
    --secondary: var(--bg-atmo-1);
    --secondary-foreground: var(--text);
    --muted: var(--bg-atmo-2);
    --muted-foreground: var(--text-muted);
    --accent-foreground: var(--text);
    --destructive-foreground: #ffffff;
    --input: var(--border);
    --ring: var(--primary);
  }\);

css = css.replace('html {', 'html {\\n  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;');
css = css.replace(/body\s*\{[^}]*\}/g, 'body {\\n  background-color: var(--bg);\\n  color: var(--text);\\n  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;\\n}');

fs.writeFileSync('src/app/globals.css', css);
console.log('Success');
