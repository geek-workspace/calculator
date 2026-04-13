/* ──────────── Calculator Logic ──────────── */
const display_result = document.getElementById('result');
const display_expr   = document.getElementById('expression');

let currentVal  = '0';
let prevVal     = '';
let operator    = null;
let waitingNext = false;
let justEvaluated = false;

/* ──── Helpers ──────────────────────────────────────────────────────── */
function formatNumber(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return num;
  // Limit decimal display length
  if (Math.abs(n) >= 1e12) return n.toExponential(4);
  const str = n.toLocaleString('en-US', { maximumFractionDigits: 10 });
  return str;
}

function setDisplay(val) {
  display_result.textContent = formatNumber(val);
  // Scale font down for long numbers
  const len = String(val).replace(/,/g, '').length;
  if (len > 12)      display_result.style.fontSize = '22px';
  else if (len > 9)  display_result.style.fontSize = '30px';
  else if (len > 6)  display_result.style.fontSize = '38px';
  else               display_result.style.fontSize = '48px';
}

function pulsResult() {
  display_result.classList.remove('pulse');
  void display_result.offsetWidth; // reflow
  display_result.classList.add('pulse');
}

/* ──── Operator visual highlight ──────────────────────────────────────── */
function clearActiveOp() {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active-op'));
}
function highlightOp(val) {
  clearActiveOp();
  const map = { '÷': 'btn-div', '×': 'btn-mul', '−': 'btn-sub', '+': 'btn-add' };
  const id = map[val];
  if (id) document.getElementById(id)?.classList.add('active-op');
}

/* ──── Core actions ──────────────────────────────────────────────────── */
function inputNumber(val) {
  clearActiveOp();
  if (justEvaluated) {
    currentVal    = val;
    prevVal       = '';
    operator      = null;
    justEvaluated = false;
    display_expr.textContent = '';
  } else if (waitingNext) {
    currentVal  = val;
    waitingNext = false;
  } else {
    currentVal = (currentVal === '0') ? val : currentVal + val;
  }
  setDisplay(currentVal);
}

function inputDecimal() {
  if (justEvaluated) {
    currentVal    = '0.';
    justEvaluated = false;
    display_expr.textContent = '';
  } else if (waitingNext) {
    currentVal  = '0.';
    waitingNext = false;
  } else if (!currentVal.includes('.')) {
    currentVal += '.';
  }
  setDisplay(currentVal);
}

function inputOperator(op) {
  justEvaluated = false;

  if (operator && !waitingNext) {
    // chain calculation
    const result = calculate(parseFloat(prevVal), parseFloat(currentVal), operator);
    currentVal = String(result);
    setDisplay(currentVal);
    pulsResult();
  }

  prevVal     = currentVal;
  operator    = op;
  waitingNext = true;
  highlightOp(op);

  display_expr.textContent = `${formatNumber(prevVal)} ${op}`;
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? 'Error' : a / b;
    default:  return b;
  }
}

function doEquals() {
  if (!operator) return;

  const a = parseFloat(prevVal);
  const b = parseFloat(currentVal);
  const result = calculate(a, b, operator);

  display_expr.textContent = `${formatNumber(prevVal)} ${operator} ${formatNumber(currentVal)} =`;

  const resultStr = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
  currentVal    = resultStr;
  operator      = null;
  waitingNext   = false;
  justEvaluated = true;
  clearActiveOp();

  setDisplay(currentVal);
  pulsResult();
}

function doClear() {
  currentVal    = '0';
  prevVal       = '';
  operator      = null;
  waitingNext   = false;
  justEvaluated = false;
  clearActiveOp();
  display_expr.textContent  = '';
  setDisplay('0');
}

function doSign() {
  const n = parseFloat(currentVal);
  if (isNaN(n) || n === 0) return;
  currentVal = String(-n);
  setDisplay(currentVal);
}

function doPercent() {
  const n = parseFloat(currentVal);
  if (isNaN(n)) return;
  currentVal = String(n / 100);
  setDisplay(currentVal);
}

/* ──── Button click handler ─────────────────────────────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    switch (action) {
      case 'number':   inputNumber(value);   break;
      case 'decimal':  inputDecimal();        break;
      case 'operator': inputOperator(value);  break;
      case 'equals':   doEquals();            break;
      case 'clear':    doClear();             break;
      case 'sign':     doSign();              break;
      case 'percent':  doPercent();           break;
    }

    // ripple
    btn.classList.add('ripple');
    setTimeout(() => {
      btn.classList.remove('ripple');
      btn.classList.add('ripple-out');
      setTimeout(() => btn.classList.remove('ripple-out'), 500);
    }, 50);
  });
});

/* ──── Keyboard support ─────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  const key = e.key;
  const map = {
    '0':'btn-0','1':'btn-1','2':'btn-2','3':'btn-3','4':'btn-4',
    '5':'btn-5','6':'btn-6','7':'btn-7','8':'btn-8','9':'btn-9',
    '.':'btn-dot',',':'btn-dot',
    '+':'btn-add','-':'btn-sub','*':'btn-mul','/':'btn-div',
    'Enter':'btn-eq','=':'btn-eq',
    'Backspace':'btn-ac','Escape':'btn-ac','Delete':'btn-ac',
    '%':'btn-percent',
  };
  const btnId = map[key];
  if (btnId) {
    e.preventDefault();
    document.getElementById(btnId)?.click();
  }
});
