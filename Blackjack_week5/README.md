# ♠ Royal Blackjack

> A browser-based Blackjack (21) card game built as a progressive 5-week web development project.

!\[HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat\&logo=html5\&logoColor=white)
!\[CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat\&logo=css3\&logoColor=white)
!\[JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat\&logo=javascript\&logoColor=black)

\---

## 📖 About

Royal Blackjack is a single-player browser card game where the player competes against an automated dealer. The goal is to get a hand total as close to 21 as possible without exceeding it.

The project was built progressively over five weeks, with each stage layered on top of the previous one — HTML5 structure first, then CSS3 styling, then JavaScript game logic.

\---

## 🎮 How to Play

1. **Place a bet** using the chip buttons (+$10, +$25, +$50, +$100)
2. Click **Deal** to receive two cards
3. Choose your action:

   * **Hit** — draw another card
   * **Stand** — keep your current hand
   * **Double** — double your bet and receive exactly one more card
4. The dealer reveals the hidden card and draws until reaching 17+
5. Closest to 21 wins — go over and you **Bust**

### Card Values

|Card|Value|
|-|-|
|2 – 9|Face value|
|10, J, Q, K|10 points|
|A (Ace)|1 or 11 (auto-calculated)|

### Payouts

|Result|Payout|
|-|-|
|Win|1:1 (even money)|
|Blackjack|3:2 (1.5× bet)|
|Push|Bet returned|
|Lose / Bust|Bet forfeited|

### Keyboard Shortcuts

|Key|Action|
|-|-|
|`D`|Deal|
|`H`|Hit|
|`S`|Stand|
|`X`|Double Down|

\---

## 🚀 Getting Started

No installation required. This project runs entirely in the browser.

1. Clone or download this repository
2. Open `Blackjack\_week5/game.html` in any modern browser
3. Start playing

```bash
git clone https://github.com/wangw17-forfun/Blackjack\_simpleversion.git
```

> \*\*Note:\*\* An internet connection is required to load Google Fonts. The game works offline but will use fallback fonts.

\---

## 📁 Project Structure

```

## If there's only one file, The structure of the latest version shall prevail.


Blackjack\_simpleversion/
│
├── Blackjack week1\~2 html5/     # Week 1–2: HTML5 structure
│   ├── index (4).html
│   ├── game (8).html
│   ├── rules (4).html
│   ├── about (3).html
│   └── css/
│       └── style.css
│
├── Blackjack\_week3/             # Week 3: CSS3 advanced styling
│   ├── index.html
│   ├── game.html
│   ├── rules.html
│   ├── about.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       └── game.js
│
├── Blackjack\_week4/             # Week 4: JavaScript game logic (original)
│   ├── ...
│
└── Blackjack\_week5/             # Week 5: Final version ✅
    ├── index.html
    ├── game.html
    ├── rules.html
    ├── about.html
    ├── css/
    │   └── style.css
    └── js/
        ├── main.js              # Hamburger nav + Scroll Reveal
        └── game.js              # Full game logic
```

\---

## 🛠️ Technologies Used

### HTML5

* Semantic tags: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
* Accessibility: ARIA roles, `aria-live`, `aria-label`, `aria-expanded`
* Data attributes (`data-amount`) for JavaScript hooks
* `<table>` for round history and rules reference
* `<figure>` / `<figcaption>` for card legends
* `<dl>` / `<dt>` / `<dd>` for definition lists
* `<address>` for project documentation

### CSS3

* CSS Custom Properties (`--var`) for design tokens
* Google Fonts: Bebas Neue, Inter, Share Tech Mono
* CSS Grid with `grid-template-areas` for game layout
* Flexbox with `auto-fit minmax()` for responsive cards
* `@keyframes` animations (logo pulse, card deal, result banner)
* `transform: rotateY()` + `backface-visibility: hidden` for 3D card flip
* `backdrop-filter: blur()` for frosted glass navigation
* `box-shadow` stacking for neon glow effects
* Hamburger navigation with animated X transformation
* Scroll Reveal via `IntersectionObserver`
* `@media (prefers-reduced-motion)` for accessibility

### JavaScript

* Fisher-Yates shuffle algorithm
* Ace = 1 or 11 auto-calculation
* Dealer AI (hits until 17+) with recursive `setTimeout`
* Chip-based betting system with balance tracking
* 3D card flip animation trigger
* Win / Lose / Push / Blackjack / Bust detection
* Round history log (dynamic DOM manipulation)
* `localStorage` for best balance persistence across sessions
* Keyboard shortcuts
* Game reset functionality

\---

## ✨ Features

* 🃏 Full 52-card deck with fair Fisher-Yates shuffle
* 🤖 Automated dealer AI following standard casino rules
* 💰 Chip betting system with running balance
* 🏆 Best balance saved via `localStorage` — persists after page refresh
* 📜 Round history table updated after every hand
* 🔄 Reset button to start a fresh game
* ⌨️ Keyboard shortcuts for faster play
* 📱 Fully responsive — works on desktop, tablet, and mobile
* ♿ Accessible — ARIA roles and screen reader support
* 🎨 Neon dark theme with CSS animations

\---

## 📅 Development Roadmap

|Week|Focus|Status|
|-|-|-|
|1–2|HTML5 — semantic structure, ARIA, documentation|✅ Complete|
|2–3|CSS3 — neon theme, animations, responsive layout|✅ Complete|
|4–5|JavaScript — game logic, bug fixes, LocalStorage|✅ Complete|

\---

## 🐛 Bug Fixes (Week 5)

|Bug|Description|Fix|
|-|-|-|
|Balance not deducted|Bet was not subtracted from balance on Deal|Added `balance -= currentBet` in `deal()`|
|Double Down miscalculation|Double deducted only half the correct amount|Fixed after Bug 1 resolved|
|`setButtons('over')` unhandled|Button states undefined after round ends|Rewrote `setButtons()` to handle all phases|
|Game Over only shows once|Second bankruptcy did not trigger Game Over|Changed condition from `balance === 0 \&\& currentBet === 0` to `balance === 0`|
|Double always disabled|`setButtons('playing')` called before cards dealt|Added second `setButtons('playing')` call after all 4 cards are dealt|
|`confirm()` blocked|`file://` origin silently blocks `confirm()` in Chrome|Removed `confirm()`, reset executes directly|

\---

## 📚 References

|Resource|URL|
|-|-|
|MDN HTML5|https://developer.mozilla.org/en-US/docs/Web/HTML|
|MDN CSS3|https://developer.mozilla.org/en-US/docs/Web/CSS|
|MDN JavaScript|https://developer.mozilla.org/en-US/docs/Web/JavaScript|
|MDN localStorage|https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage|
|Google Fonts|https://fonts.google.com|
|Fisher-Yates Shuffle|https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates\_shuffle|
|Blackjack Rules|https://en.wikipedia.org/wiki/Blackjack|

\---

## 📝 License

This project was created for educational purposes as part of a web development course assignment. No real money is involved.

\---

*Web Development Individual Project — Week 1 to 5*

