/* ============================================================
   Royal Blackjack — game.js
   Week 5: Bug Fixes
   Fixed:
   - Balance now correctly deducted on Deal
   - Double Down balance calculation corrected
   - setButtons handles 'over' phase properly
   - lose/bust correctly deduct from balance
   ============================================================ */

'use strict';

/* ── CONSTANTS ── */
const SUITS         = ['♠', '♥', '♦', '♣'];
const RANKS         = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const VALUES        = { A:11, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7,
                        '8':8, '9':9, '10':10, J:10, Q:10, K:10 };
const RED_SUITS     = ['♥', '♦'];
const DEALER_MIN    = 17;
const STARTING_BAL  = 1000;
const BLACKJACK_PAY = 1.5;
const DEAL_DELAY_MS = 300;
const LS_KEY        = 'royalBlackjack_bestBalance';  // LocalStorage key

/* ── STATE ── */
let deck         = [];
let playerHand   = [];
let dealerHand   = [];
let balance      = STARTING_BAL;
let currentBet   = 0;
let roundCount   = 1;
let wins         = 0;
let gamePhase    = 'betting';
let bestBalance  = STARTING_BAL;  // loaded from LocalStorage on init

/* ── DOM REFERENCES ── */
const elBalance      = document.getElementById('balance');
const elCurrentBet   = document.getElementById('current-bet');
const elRoundCount   = document.getElementById('round-count');
const elWins         = document.getElementById('wins');
const elDealerCards  = document.getElementById('dealer-cards');
const elPlayerCards  = document.getElementById('player-cards');
const elDealerScore  = document.getElementById('dealer-score');
const elPlayerScore  = document.getElementById('player-score');
const elResultBanner = document.getElementById('result-banner');
const elResultText   = document.getElementById('result-text');
const elHistoryBody  = document.getElementById('history-body');
const btnDeal        = document.getElementById('btn-deal');
const btnHit         = document.getElementById('btn-hit');
const btnStand       = document.getElementById('btn-stand');
const btnDouble      = document.getElementById('btn-double');
const elBestBalance  = document.getElementById('best-balance');

/* ════════════════════════════════════════
   DECK
════════════════════════════════════════ */

function buildDeck() {
  const d = [];
  for (const suit of SUITS)
    for (const rank of RANKS)
      d.push({ suit, rank, value: VALUES[rank] });
  return d;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function drawCard() {
  if (deck.length < 4) deck = shuffle(buildDeck());
  return deck.pop();
}

/* ════════════════════════════════════════
   SCORING
════════════════════════════════════════ */

function calcScore(hand) {
  let total = 0, aces = 0;
  for (const card of hand) {
    total += card.value;
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isBust(hand)      { return calcScore(hand) > 21; }
function isBlackjack(hand) { return hand.length === 2 && calcScore(hand) === 21; }

/* ════════════════════════════════════════
   CARD RENDERING
════════════════════════════════════════ */

function createCardEl(card, faceDown = false) {
  if (faceDown) {
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
  const div = document.createElement('div');
  div.className = `card card-face${RED_SUITS.includes(card.suit) ? ' red' : ''}`;
  div.setAttribute('role', 'listitem');
  div.setAttribute('aria-label', `${card.rank} of ${card.suit}`);
  div.innerHTML = `
    <span class="card-rank">${card.rank}</span>
    <span class="card-suit">${card.suit}</span>
    <span class="card-rank bottom">${card.rank}</span>`;
  return div;
}

function dealCardTo(container, card, faceDown = false) {
  const el = createCardEl(card, faceDown);
  el.classList.add('card-deal-in');
  container.appendChild(el);
  el.addEventListener('animationend', () => el.classList.remove('card-deal-in'), { once: true });
  return el;
}

function revealDealerCard() {
  const wrapper = elDealerCards.querySelector('.card-flip-wrapper');
  if (wrapper) wrapper.classList.add('flipped');
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

  if (showDealerFull) {
    elDealerScore.textContent = calcScore(dealerHand);
  } else {
    elDealerScore.textContent = dealerHand.length > 0 ? dealerHand[0].value : '?';
  }

  elPlayerScore.classList.toggle('blackjack', pScore === 21);
}

function showResult(text, type = 'win') {
  elResultText.textContent      = text;
  elResultBanner.hidden         = false;
  elResultBanner.style.color    = type === 'win'  ? 'var(--neon-gold)'
                                 : type === 'lose' ? 'var(--neon-magenta)'
                                 : 'var(--text-secondary)';
  elResultBanner.style.borderColor = elResultBanner.style.color;
  elResultBanner.style.boxShadow   = type === 'win'  ? 'var(--glow-gold)'
                                    : type === 'lose' ? 'var(--glow-magenta)'
                                    : 'none';
}

function hideResult() { elResultBanner.hidden = true; }

/* ════════════════════════════════════════
   LOCALSTORAGE — BEST BALANCE
════════════════════════════════════════ */

/** Load best balance from LocalStorage on page load */
function loadBestBalance() {
  const saved = localStorage.getItem(LS_KEY);
  bestBalance = saved ? parseInt(saved, 10) : STARTING_BAL;
  updateBestBalance();
}

/** Save best balance to LocalStorage if current balance beats it */
function checkAndSaveBestBalance() {
  if (balance > bestBalance) {
    bestBalance = balance;
    localStorage.setItem(LS_KEY, bestBalance);
    updateBestBalance();
    // Flash the Best chip to show new record
    if (elBestBalance) {
      elBestBalance.classList.add('updated');
      setTimeout(() => elBestBalance.classList.remove('updated'), 1500);
    }
  }
}

/** Update the Best chip display */
function updateBestBalance() {
  if (elBestBalance) {
    elBestBalance.textContent = `$${bestBalance.toLocaleString()}`;
  }
}

/* ── BUG FIX 4: setButtons now handles 'over' phase ── */
function setButtons(phase) {
  const playing   = phase === 'playing';
  const betting   = phase === 'betting';
  const inProgress = phase === 'playing' || phase === 'dealer';
  const canDouble  = playing && playerHand.length === 2 && balance >= currentBet;

  btnDeal.disabled   = inProgress;
  btnHit.disabled    = !playing;
  btnStand.disabled  = !playing;
  btnDouble.disabled = !canDouble;

  // 'over' and 'betting': Deal enabled only when there's a bet
  if (phase === 'over' || betting) {
    btnDeal.disabled = currentBet === 0;
  }
}

/* ════════════════════════════════════════
   HISTORY LOG
════════════════════════════════════════ */

function addHistoryRow(playerStr, dealerStr, resultLabel, net) {
  const tr        = document.createElement('tr');
  const netClass  = net > 0 ? 'positive' : net < 0 ? 'negative' : '';
  const netStr    = net > 0 ? `+$${net}` : net < 0 ? `-$${Math.abs(net)}` : '$0';
  const badgeClass = resultLabel === 'Bust' || resultLabel === 'Lose' ? 'bust'
                   : resultLabel === 'Push' ? 'pending' : 'win';

  tr.innerHTML = `
    <td>${roundCount}</td>
    <td>${playerStr}</td>
    <td>${dealerStr}</td>
    <td><span class="badge ${badgeClass}">${resultLabel}</span></td>
    <td class="${netClass}">${netStr}</td>`;

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
  const maxAdd = balance - currentBet;
  if (maxAdd <= 0) return;
  currentBet += Math.min(amount, maxAdd);
  updateStats();
  btnDeal.disabled = false;
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

function deal() {
  if (currentBet === 0 || gamePhase !== 'betting') return;

  /* ── BUG FIX 1: Deduct bet from balance on Deal ── */
  balance -= currentBet;

  playerHand = [];
  dealerHand = [];
  elPlayerCards.innerHTML = '';
  elDealerCards.innerHTML = '';
  hideResult();
  gamePhase = 'playing';
  setButtons('playing');
  updateStats();

  if (deck.length < 15) deck = shuffle(buildDeck());

  const sequence = [
    { hand: playerHand, container: elPlayerCards, faceDown: false },
    { hand: dealerHand, container: elDealerCards, faceDown: true  },
    { hand: playerHand, container: elPlayerCards, faceDown: false },
    { hand: dealerHand, container: elDealerCards, faceDown: false },
  ];

  sequence.forEach(({ hand, container, faceDown }, i) => {
    setTimeout(() => {
      const card = drawCard();
      hand.push(card);
      dealCardTo(container, card, faceDown);
      updateScores(false);
      if (i === 3) setTimeout(() => checkImmediateBlackjack(), 200);
    }, i * DEAL_DELAY_MS);
  });
}

function checkImmediateBlackjack() {
  const pBJ = isBlackjack(playerHand);
  const dBJ = isBlackjack(dealerHand);
  if (pBJ || dBJ) {
    revealDealerCard();
    updateScores(true);
    if (pBJ && dBJ) endRound('push');
    else if (pBJ)   endRound('blackjack');
    else             endRound('lose');
  }
}

function hit() {
  if (gamePhase !== 'playing') return;
  const card = drawCard();
  playerHand.push(card);
  dealCardTo(elPlayerCards, card);
  updateScores(false);
  btnDouble.disabled = true;

  if (isBust(playerHand)) {
    setTimeout(() => { revealDealerCard(); updateScores(true); endRound('bust'); }, 400);
  } else if (calcScore(playerHand) === 21) {
    setTimeout(() => stand(), 400);
  }
}

function stand() {
  if (gamePhase !== 'playing') return;
  gamePhase = 'dealer';
  setButtons('dealer');
  revealDealerCard();
  updateScores(true);
  dealerPlay();
}

/* ── BUG FIX 2: Double Down balance corrected ── */
function doubleDown() {
  if (gamePhase !== 'playing' || playerHand.length !== 2) return;
  // balance already had original bet deducted at deal()
  // now deduct the additional equal amount
  if (balance < currentBet) return;  // can't afford to double

  balance    -= currentBet;   // deduct the extra bet
  currentBet *= 2;            // total bet is now doubled
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

function dealerPlay() {
  if (calcScore(dealerHand) < DEALER_MIN) {
    setTimeout(() => {
      const card = drawCard();
      dealerHand.push(card);
      dealCardTo(elDealerCards, card);
      updateScores(true);
      dealerPlay();
    }, DEAL_DELAY_MS + 100);
  } else {
    setTimeout(() => determineWinner(), 400);
  }
}

function determineWinner() {
  const pScore = calcScore(playerHand);
  const dScore = calcScore(dealerHand);
  if      (isBust(dealerHand)) endRound('win');
  else if (pScore > dScore)    endRound('win');
  else if (pScore < dScore)    endRound('lose');
  else                         endRound('push');
}

/* ════════════════════════════════════════
   END ROUND
════════════════════════════════════════ */

/* ── BUG FIX 3: balance correctly handled for all outcomes ──
   At this point balance has already had currentBet deducted.
   win/blackjack: return bet + profit
   push:          return bet only
   lose/bust:     bet already gone, nothing to add
*/
function endRound(outcome) {
  gamePhase = 'over';
  updateScores(true);

  let net = 0, resultText = '', resultType = 'win';

  switch (outcome) {
    case 'blackjack':
      net        = Math.floor(currentBet * BLACKJACK_PAY);
      balance   += currentBet + net;   // return bet + 1.5× profit
      resultText = 'Blackjack! 🃏';
      wins++;
      break;
    case 'win':
      net        = currentBet;
      balance   += currentBet * 2;     // return bet + equal profit
      resultText = isBust(dealerHand) ? 'Dealer Busts! You Win!' : 'You Win!';
      wins++;
      break;
    case 'push':
      net        = 0;
      balance   += currentBet;         // return bet only
      resultText = 'Push — Tie!';
      resultType = 'push';
      break;
    case 'lose':
      net        = -currentBet;        // bet already gone
      resultText = isBlackjack(dealerHand) ? 'Dealer Blackjack!' : 'Dealer Wins!';
      resultType = 'lose';
      break;
    case 'bust':
      net        = -currentBet;        // bet already gone
      resultText = 'Bust!';
      resultType = 'lose';
      break;
  }

  showResult(resultText, resultType);
  addHistoryRow(
    handToString(playerHand),
    handToString(dealerHand),
    outcome === 'blackjack' ? 'Blackjack!'
      : outcome === 'win'   ? 'Win'
      : outcome === 'push'  ? 'Push'
      : outcome === 'bust'  ? 'Bust' : 'Lose',
    net
  );

  updateStats();
  checkAndSaveBestBalance();
    setTimeout(() => {
      showResult('Game Over — No Balance Left!', 'lose');
      btnDeal.disabled = true;
    }, 1500);
    return;
  }

  // Prepare for next round
  roundCount++;
  currentBet = 0;
  gamePhase  = 'betting';
  updateStats();
  setButtons('betting');
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */

function init() {
  deck       = shuffle(buildDeck());
  balance    = STARTING_BAL;
  currentBet = 0;
  roundCount = 1;
  wins       = 0;
  gamePhase  = 'betting';

  updateStats();
  setButtons('betting');
  hideResult();
  loadBestBalance();

  elHistoryBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center;color:var(--text-dim);
        font-family:var(--font-mono);font-size:0.8rem;padding:1.5rem;">
        No rounds played yet. Place a bet and deal to start!
      </td>
    </tr>`;

  document.querySelectorAll('.btn-chip[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => addBet(Number(btn.dataset.amount)));
  });
  document.querySelector('.btn-chip.clear')?.addEventListener('click', clearBet);

  btnDeal.addEventListener('click',   deal);
  btnHit.addEventListener('click',    hit);
  btnStand.addEventListener('click',  stand);
  btnDouble.addEventListener('click', doubleDown);

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

document.addEventListener('DOMContentLoaded', init);
