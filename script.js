// ------------------------------------
// Cytoscape style configuration
// ------------------------------------
const cyStyles = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#1e293b',
      'border-width': 2,
      'border-color': '#6366f1',
      'color': '#e2e8f0',
      'font-family': 'Inter, sans-serif',
      'font-size': '12px',
      'font-weight': '600',
      'width': 48,
      'height': 48,
    }
  },
  {
    selector: 'node.start',
    style: {
      'border-color': '#a78bfa',
      'border-width': 3,
      'background-color': '#312e81',
    }
  },
  {
    selector: 'node.accept',
    style: {
      'border-color': '#10b981',
      'border-width': 3,
      'background-color': '#064e3b',
    }
  },
  {
    selector: 'node.accept.start',
    style: {
      'border-color': '#34d399',
      'background-color': '#065f46',
    }
  },
  {
    selector: 'node.highlighted',
    style: {
      'background-color': '#f59e0b',
      'border-color': '#fbbf24',
      'color': '#1f2937',
    }
  },
  {
    selector: 'edge',
    style: {
      label: 'data(label)',
      'width': 2,
      'line-color': '#4f46e5',
      'target-arrow-color': '#4f46e5',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'color': '#94a3b8',
      'font-size': '11px',
      'text-background-color': '#0f111a',
      'text-background-opacity': 0.7,
      'text-background-padding': '3px',
    }
  },
  {
    selector: 'edge.highlighted',
    style: {
      'line-color': '#f59e0b',
      'target-arrow-color': '#f59e0b',
      'width': 3,
    }
  }
];

// ------------------------------------
// Initialize Cytoscape instances
// ------------------------------------
const cyNfa = cytoscape({
  container: document.getElementById('cy-nfa'),
  style: cyStyles,
  layout: { name: 'breadthfirst', directed: true, padding: 20 },
  userZoomingEnabled: true,
  userPanningEnabled: true,
  elements: []
});

const cyDfa = cytoscape({
  container: document.getElementById('cy-dfa'),
  style: cyStyles,
  layout: { name: 'breadthfirst', directed: true, padding: 20 },
  userZoomingEnabled: true,
  userPanningEnabled: true,
  elements: []
});

// ------------------------------------
// State
// ------------------------------------
let dfaTrace = [];

// ------------------------------------
// Build Automata Button
// ------------------------------------
document.getElementById('buildBtn').addEventListener('click', async () => {
  const regex = document.getElementById('regexInput').value.trim();
  if (!regex) {
    alert('Please enter a regular expression.');
    return;
  }

  const btn = document.getElementById('buildBtn');
  btn.innerHTML = '<span>Building...</span>';
  btn.disabled = true;

  try {
    const response = await fetch('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regex })
    });
    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    // Display parse steps
    document.getElementById('parseSteps').textContent =
      `Concatenated: ${data.with_concat}   →   Postfix: ${data.postfix}`;

    // Render NFA
    cyNfa.elements().remove();
    cyNfa.add(data.nfa_elements);
    cyNfa.layout({ name: 'breadthfirst', directed: true, padding: 30 }).run();
    cyNfa.fit();

    // Render DFA
    cyDfa.elements().remove();
    cyDfa.add(data.dfa_elements);
    cyDfa.layout({ name: 'breadthfirst', directed: true, padding: 30 }).run();
    cyDfa.fit();

    document.getElementById('simResult').classList.add('hidden');

  } catch (e) {
    alert('Error communicating with the server: ' + e.message);
  } finally {
    btn.innerHTML = '<span>Build Automata</span>';
    btn.disabled = false;
  }
});

// ------------------------------------
// Simulate Button
// ------------------------------------
document.getElementById('simBtn').addEventListener('click', async () => {
  const testStr = document.getElementById('testInput').value;

  const btn = document.getElementById('simBtn');
  btn.innerHTML = '<span>Simulating...</span>';
  btn.disabled = true;

  try {
    const response = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_string: testStr })
    });
    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    dfaTrace = data.trace;
    const accepted = data.is_accepted;

    // Show verdict
    const resultDiv = document.getElementById('simResult');
    const verdict = document.getElementById('simVerdict');
    resultDiv.classList.remove('hidden');

    verdict.textContent = accepted
      ? `✅  ACCEPTED — "${testStr}" matches the expression`
      : `❌  REJECTED — "${testStr}" does not match the expression`;

    verdict.className = accepted ? 'status-accepted' : 'status-rejected';

    // Build trace display
    const traceDiv = document.getElementById('simTrace');
    traceDiv.innerHTML = '';

    // Show steps (first step is "START" sentinel)
    for (let i = 1; i < dfaTrace.length - 1; i++) {
      const [from, char, to] = dfaTrace[i];
      const stepEl = document.createElement('span');
      stepEl.className = 'trace-step';
      stepEl.textContent = `d${from}`;
      traceDiv.appendChild(stepEl);

      const arrowEl = document.createElement('span');
      arrowEl.className = 'trace-arrow';
      arrowEl.textContent = ` —${char}→ `;
      traceDiv.appendChild(arrowEl);

      if (i === dfaTrace.length - 2) {
        const finalEl = document.createElement('span');
        finalEl.className = `trace-step ${accepted ? 'status-accepted' : 'status-rejected'}`;
        finalEl.textContent = to !== null ? `d${to}` : '∅';
        traceDiv.appendChild(finalEl);
      }
    }

    // Handle empty string edge case
    if (dfaTrace.length === 2) {
      const [from] = dfaTrace[0];
      const stepEl = document.createElement('span');
      stepEl.className = `trace-step ${accepted ? 'status-accepted' : 'status-rejected'}`;
      stepEl.textContent = `d0 (empty string)`;
      traceDiv.appendChild(stepEl);
    }


    // Animate DFA traversal
    animateTrace(dfaTrace, cyDfa);

  } catch (e) {
    alert('Error: ' + e.message);
  } finally {
    btn.innerHTML = '<span>Simulate</span>';
    btn.disabled = false;
  }
});

// ------------------------------------
// Animate trace on the DFA diagram
// ------------------------------------
function animateTrace(trace, cy) {
  // Reset all highlighting
  cy.elements().removeClass('highlighted');

  let step = 0;

  function highlightStep() {
    if (step >= trace.length - 1) return; // Stop before the END sentinel

    const [from, char, to] = trace[step];

    // For "START" sentinel, just highlight start node
    if (from === 'START') {
      const nextNode = cy.$(`#d${to}`);
      nextNode.addClass('highlighted');
      step++;
      setTimeout(highlightStep, 700);
      return;
    }

    // Highlight the current state node
    cy.$(`#d${from}`).addClass('highlighted');

    // Highlight edge with matching label
    const edges = cy.$(`edge[source = "d${from}"]`).filter(e =>
      e.data('label') === char
    );
    edges.addClass('highlighted');

    if (to !== null && typeof to === 'number') {
      cy.$(`#d${to}`).addClass('highlighted');
    }

    step++;
    setTimeout(highlightStep, 700);
  }

  highlightStep();
}
