/* ============================================================
   Royal Blackjack — game.js
   Week 4–5: Full JavaScript Game Logic
   Features:
   - 52-card deck with Fisher-Yates shuffle
   - Deal, Hit, Stand, Double Down
   - Ace = 1 or 11 (auto-calculated)
   - Dealer AI: hits until 17+
   - Chip-based betting system
   - Balance tracking
   - Win / Lose / Push / Blackjack / Bust detection
   - Round history log
   - Card deal animation (CSS class)
   - Card flip animation on dealer reveal
   ============================================================ */

'use strict';

/* ── CONSTANTS ── */
const SUITS  = ['♠', '♥', '♦', '♣'];
const RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const VALUES = { A:11, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7,
                 '8':8, '9':9, '10':10, J:10, Q:10, K:10 };
const RED_SUITS     = ['♥', '♦'];
const DEALER_MIN    = 17;
const STARTING_BAL  = 1000;
const BLACKJACK_PAY = 1.5;   // 3:2 payout
const DEAL_DELAY_MS = 300;   // ms between each card dealt

/* ── STATE ── */
let deck         = [];
let playerHand   = [];
let dealerHand   = [];
let balance      = STARTING_BAL;
let currentBet   = 0;
let roundCount   = 1;
let wins         = 0;
let gamePhase    = 'betting';  // 'betting' | 'playing' | 'dealer' | 'over'

/* ── DOM REFERENCES ── */
const elBalance     = document.getElementById('balance');
const elCurrentBet  = document.getElementById('current-bet');
const elRoundCount  = document.getElementById('round-count');
const elWins        = document.getElementById('wins');
const elDealerCards = document.getElementById('dealer-cards');
const elPlayerCards = document.getElementById('player-cards');
const elDealerScore = document.getElementById('dealer-score');
const elPlayerScore = document.getElementById('player-score');
const elResultBanner= document.getElementById('result-banner');
const elResultText  = document.getElementById('result-text');
const elHistoryBody = document.getElementById('history-body');
const btnDeal       = document.getElementById('btn-deal');
const btnHit        = document.getElementById('btn-hit');
const btnStand      = document.getElementById('btn-stand');
const btnDouble     = document.getElementById('btn-double');

/* ════════════════════════════════════════
   DECK
════════════════════════════════════════ */

/** Build a fresh 52-card deck */
function buildDeck() {
  const d = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      d.push({ suit, rank, value: VALUES[rank] });
    }
  }
  return d;
}

/** Fisher-Yates in-place shuffle */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Draw one card from top of deck; rebuild if empty */
function drawCard() {
  if (deck.length === 0) deck = shuffle(buildDeck());
  return deck.pop();
}

/* ════════════════════════════════════════
   SCORING
════════════════════════════════════════ */

/** Calculate best hand score (Ace = 11 or 1) */
function calcScore(hand) {
  let total = 0;
  let aces  = 0;
  for (const card of hand) {
    total += card.value;
    if (card.rank === 'A') aces++;
  }
  // Reduce Aces from 11 → 1 while over 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBust(hand)       { return calcScore(hand) > 21; }
function isBlackjack(hand)  { return hand.length === 2 && calcScore(hand) === 21; }

/* ════════════════════════════════════════
   DOM — CARD RENDERING
════════════════════════════════════════ */

/**
 * Create a card element.
 * @param {object} card  - { suit, rank } or null for face-down
 * @param {boolean} faceDown - render as card-back
 */
function createCardEl(card, faceDown = false) {
  if (faceDown) {
    // Face-down card uses flip wrapper so JS can reveal it later
    const wrapper = document.createElement('div');
    wrapper.className = 'card-flip-wrapper';
    wrapper.setAttribute('role', 'listitem');
    wrapper.setAttribute('aria-label', 'Hidden card');
    wrapper.dataset.suit = card.suit;
    wrapper.dataset.rank = card.rank;

    wrapper.innerHTML = `
      <div class="card-inner">
        <div class="card card-back card-front"></div>
        <div class="card card-face${RED_SUITS.includes(card.suit) ? ' red' : ''} card-back-face">
          <span class="card-rank">${card.rank}</span>
          <span class="card-suit">${card.suit}</span>
          <span class="card-rank bottom">${card.rank}</span>
        </div>
      </div>`;
    return wrapper;
  }

  const isRed  = RED_SUITS.includes(card.suit);
  const div    = document.createElement('div');
  div.className = `card card-face${isRed ? ' red' : ''}`;
  div.setAttribute('role', 'listitem');
  div.setAttribute('aria-label', `${card.rank} of ${card.suit}`);
  div.innerHTML = `
    <span class="card-rank">${card.rank}</span>
    <span class="card-suit">${card.suit}</span>
    <span class="card-rank bottom">${card.rank}</span>`;
  return div;
}

/** Animate a card into the given container */
function dealCardTo(container, card, faceDown = false) {
  const el = createCardEl(card, faceDown);
  el.classList.add('card-deal-in');
  container.appendChild(el);
  // Remove animation class after it plays
  el.addEventListener('animationend', () => el.classList.remove('card-deal-in'), { once: true });
  return el;
}

/** Flip the dealer's hidden card */
function revealDealerCard() {
  const wrapper = elDealerCards.querySelector('.card-flip-wrapper');
  if (wrapper) {
    wrapper.classList.add('flipped');
  }
}

/* ════════════════════════════════════════
   UI UPDATES
════════════════════════════════════════ */

function updateStats() {
  elBalance.textContent    = `$${balance.toLocaleString()}`;
  elCurrentBet.textContent = `$${currentBet.toLocaleString()}`;
  elRoundCount.textContent = roundCount;
  elWins.textContent       = wins;
}

function updateScores(showDealerFull = false) {
  const pScore = calcScore(playerHand);
  elPlayerScore.textContent = pScore;

  // Dealer: show '?' for hidden card unless round over
  if (showDealerFull) {
    const dScore = calcScore(dealerHand);
    elDealerScore.textContent = dScore;
  } else {
    // Show only the face-up card's value
    const visibleScore = dealerHand.length > 1
      ? dealerHand[0].value
      : '?';
    elDealerScore.textContent = visibleScore;
  }

  // Highlight 21 on player badge
  if (pScore === 21) {
    elPlayerScore.classList.add('blackjack');
  } else {
    elPlayerScore.classList.remove('blackjack');
  }
}

function showResult(text, type = 'win') {
  elResultText.textContent = text;
  elResultBanner.hidden    = false;
  // Colour the banner by result type
  elResultBanner.style.color       = type === 'win'  ? 'var(--neon-gold)'
                                    : type === 'lose' ? 'var(--neon-magenta)'
                                    : 'var(--text-secondary)';  // push
  elResultBanner.style.borderColor = elResultBanner.style.color;
  elResultBanner.style.boxShadow   = type === 'win'
    ? 'var(--glow-gold)' : type === 'lose'
    ? 'var(--glow-magenta)' : 'none';
}

function hideResult() {
  elResultBanner.hidden = true;
}

function setButtons(phase) {
  // betting phase: only Deal enabled
  // playing phase: Hit, Stand, Double enabled; Deal disabled
  // over phase: Deal enabled (new round); others disabled
  const betting  = phase === 'betting';
  const playing  = phase === 'playing';
  const canDouble= playing && playerHand.length === 2 && balance >= currentBet;

  btnDeal.disabled   = playing || phase === 'dealer';
  btnHit.disabled    = !playing;
  btnStand.disabled  = !playing;
  btnDouble.disabled = !canDouble;
}

/* ════════════════════════════════════════
   HISTORY LOG
════════════════════════════════════════ */

function addHistoryRow(playerStr, dealerStr, resultText, net) {
  // Remove placeholder rows on first real round
  if (roundCount === 1) {
    elHistoryBody.innerHTML = '';
  }

  const tr = document.createElement('tr');
  const netClass = net > 0 ? 'positive' : net < 0 ? 'negative' : '';
  const netStr   = net > 0 ? `+$${net}` : net < 0 ? `-$${Math.abs(net)}` : '$0';

  let badgeClass = 'win';
  if (resultText === 'Bust' || resultText === 'Lose') badgeClass = 'bust';
  if (resultText === 'Push') badgeClass = 'pending';

  tr.innerHTML = `
    <td>${roundCount}</td>
    <td>${playerStr}</td>
    <td>${dealerStr}</td>
    <td><span class="badge ${badgeClass}">${resultText}</span></td>
    <td class="${netClass}">${netStr}</td>`;

  // Prepend so newest is on top
  elHistoryBody.insertBefore(tr, elHistoryBody.firstChild);
}

function handToString(hand) {
  return hand.map(c => `${c.rank}${c.suit}`).join(' + ') + ` = ${calcScore(hand)}`;
}

/* ════════════════════════════════════════
   BETTING
════════════════════════════════════════ */

function addBet(amount) {
  if (gamePhase !== 'betting') return;
  if (currentBet + amount > balance) {
    amount = balance - currentBet; // cap at balance
  }
  if (amount <= 0) return;
  currentBet += amount;
  updateStats();
  // Enable Deal button once there's a bet
  btnDeal.disabled = currentBet === 0;
}

function clearBet() {
  if (gamePhase !== 'betting') return;
  currentBet = 0;
  updateStats();
  btnDeal.disabled = true;
}

/* ════════════════════════════════════════
   CORE GAME FLOW
════════════════════════════════════════ */

/** Start a new round */
function deal() {
  if (currentBet === 0) return;
  if (gamePhase !== 'betting' && gamePhase !== 'over') return;

  // Reset state
  playerHand = [];
  dealerHand = [];
  elPlayerCards.innerHTML = '';
  elDealerCards.innerHTML = '';
  hideResult();
  gamePhase = 'playing';
  setButtons('playing');

  // Ensure fresh deck
  if (deck.length < 15) deck = shuffle(buildDeck());

  // Deal: player, dealer(face-down hole), player, dealer
  const sequence = [
    { hand: playerHand, container: elPlayerCards, faceDown: false },
    { hand: dealerHand, container: elDealerCards, faceDown: true  },  // hole card
    { hand: playerHand, container: elPlayerCards, faceDown: false },
    { hand: dealerHand, container: elDealerCards, faceDown: false },
  ];

  sequence.forEach(({ hand, container, faceDown }, i) => {
    setTimeout(() => {
      const card = drawCard();
      hand.push(card);
      dealCardTo(container, card, faceDown);
      updateScores(false);

      // After all 4 cards dealt, check for immediate Blackjack
      if (i === 3) {
        setTimeout(() => checkImmediateBlackjack(), 200);
      }
    }, i * DEAL_DELAY_MS);
  });
}

/** Check if player or dealer has Blackjack immediately */
function checkImmediateBlackjack() {
  const pBJ = isBlackjack(playerHand);
  const dBJ = isBlackjack(dealerHand);

  if (pBJ || dBJ) {
    revealDealerCard();
    updateScores(true);

    if (pBJ && dBJ) {
      endRound('push');
    } else if (pBJ) {
      endRound('blackjack');
    } else {
      endRound('lose');
    }
  }
}

/** Player hits */
function hit() {
  if (gamePhase !== 'playing') return;

  const card = drawCard();
  playerHand.push(card);
  dealCardTo(elPlayerCards, card);
  updateScores(false);

  // Disable Double after first hit
  btnDouble.disabled = true;

  if (isBust(playerHand)) {
    setTimeout(() => {
      revealDealerCard();
      updateScores(true);
      endRound('bust');
    }, 400);
  } else if (calcScore(playerHand) === 21) {
    // Auto-stand on 21
    setTimeout(() => stand(), 400);
  }
}

/** Player stands — dealer plays out */
function stand() {
  if (gamePhase !== 'playing') return;
  gamePhase = 'dealer';
  setButtons('dealer');

  revealDealerCard();
  updateScores(true);

  // Dealer draws with delay between cards
  dealerPlay();
}

/** Player doubles down */
function doubleDown() {
  if (gamePhase !== 'playing' || playerHand.length !== 2) return;
  if (balance < currentBet) return;

  balance    -= currentBet;
  currentBet *= 2;
  updateStats();

  const card = drawCard();
  playerHand.push(card);
  dealCardTo(elPlayerCards, card);
  updateScores(false);

  setTimeout(() => {
    if (isBust(playerHand)) {
      revealDealerCard();
      updateScores(true);
      endRound('bust');
    } else {
      stand();
    }
  }, 500);
}

/** Dealer draws cards recursively with delays */
function dealerPlay() {
  const dScore = calcScore(dealerHand);

  if (dScore < DEALER_MIN) {
    setTimeout(() => {
      const card = drawCard();
      dealerHand.push(card);
      dealCardTo(elDealerCards, card);
      updateScores(true);
      dealerPlay(); // recurse
    }, DEAL_DELAY_MS + 100);
  } else {
    // Dealer is done — determine winner
    setTimeout(() => determineWinner(), 400);
  }
}

/** Compare hands and end round */
function determineWinner() {
  const pScore = calcScore(playerHand);
  const dScore = calcScore(dealerHand);
  const dBust  = isBust(dealerHand);

  if (dBust) {
    endRound('win');
  } else if (pScore > dScore) {
    endRound('win');
  } else if (pScore < dScore) {
    endRound('lose');
  } else {
    endRound('push');
  }
}

/* ════════════════════════════════════════
   END ROUND
════════════════════════════════════════ */

function endRound(outcome) {
  gamePhase = 'over';
  setButtons('over');
  updateScores(true);

  let net         = 0;
  let resultText  = '';
  let resultType  = 'win';

  switch (outcome) {
    case 'blackjack':
      net        = Math.floor(currentBet * BLACKJACK_PAY);
      balance   += currentBet + net;
      resultText = 'Blackjack! 🃏';
      resultType = 'win';
      wins++;
      break;

    case 'win':
      net        = currentBet;
      balance   += currentBet * 2;
      resultText = isBust(dealerHand) ? 'Dealer Busts! You Win!' : 'You Win!';
      resultType = 'win';
      wins++;
      break;

    case 'push':
      net        = 0;
      balance   += currentBet;
      resultText = 'Push — Tie!';
      resultType = 'push';
      break;

    case 'lose':
      net        = -currentBet;
      // balance already reduced (bet was deducted at deal time below)
      resultText = isBlackjack(dealerHand) ? 'Dealer Blackjack!' : 'Dealer Wins!';
      resultType = 'lose';
      break;

    case 'bust':
      net        = -currentBet;
      resultText = 'Bust!';
      resultType = 'lose';
      break;
  }

  showResult(resultText, resultType);
  addHistoryRow(
    handToString(playerHand),
    handToString(dealerHand),
    outcome === 'blackjack' ? 'Blackjack!' :
    outcome === 'win'       ? 'Win'        :
    outcome === 'push'      ? 'Push'       :
    outcome === 'bust'      ? 'Bust'       : 'Lose',
    net
  );

  updateStats();

  // Check if player is out of money
  if (balance === 0) {
    setTimeout(() => {
      showResult('Game Over — No Balance Left!', 'lose');
      btnDeal.disabled = true;
    }, 1500);
    return;
  }

  // Reset for next round
  roundCount++;
  currentBet = 0;
  gamePhase  = 'betting';
  setButtons('betting');
  updateStats();
  btnDeal.disabled = true;
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */

function init() {
  // Build and shuffle deck
  deck = shuffle(buildDeck());

  // Set initial state
  balance    = STARTING_BAL;
  currentBet = 0;
  roundCount = 1;
  wins       = 0;
  gamePhase  = 'betting';

  updateStats();
  setButtons('betting');
  hideResult();

  // Clear placeholder history rows
  elHistoryBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; color:var(--text-dim); font-family:var(--font-mono); font-size:0.8rem; padding:1.5rem;">
        No rounds played yet. Place a bet and deal to start!
      </td>
    </tr>`;

  // ── BUTTON EVENT LISTENERS ──

  // Bet chips
  document.querySelectorAll('.btn-chip[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => addBet(Number(btn.dataset.amount)));
  });

  // Clear bet
  document.querySelector('.btn-chip.clear')
    ?.addEventListener('click', clearBet);

  // Game actions
  btnDeal.addEventListener('click',  deal);
  btnHit.addEventListener('click',   hit);
  btnStand.addEventListener('click', stand);
  btnDouble.addEventListener('click', doubleDown);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.key.toLowerCase()) {
      case 'd': if (!btnDeal.disabled)   deal();       break;
      case 'h': if (!btnHit.disabled)    hit();        break;
      case 's': if (!btnStand.disabled)  stand();      break;
      case 'x': if (!btnDouble.disabled) doubleDown(); break;
    }
  });
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', init);
