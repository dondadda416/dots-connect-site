/* Local member demo. No accounts, real votes, questions, or queue requests. */
(() => {
  const byId = id => document.getElementById(id);
  const track = name => { if (typeof window.plausible === 'function') window.plausible(name); };
  function tabGroup(selector) {
    const tabs = [...document.querySelectorAll(selector)];
    const select = (name, focus = false) => {
      tabs.forEach(tab => {
        const active = tab.dataset.tab === name || tab.dataset.qaTab === name || tab.dataset.example === name;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        byId(tab.getAttribute('aria-controls')).hidden = !active;
        if (active && focus) tab.focus();
      });
      if (tabs[0]?.dataset.example) byId('ballot-screen-reference').hidden = name !== 'ballot';
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.tab || tab.dataset.qaTab || tab.dataset.example));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          select(tabs[next].dataset.tab || tabs[next].dataset.qaTab || tabs[next].dataset.example, true);
        }
      });
    });
    return select;
  }
  const selectTool = tabGroup('[data-tab]');
  const selectQuestions = tabGroup('[data-qa-tab]');
  const selectExample = tabGroup('[data-example]');
  const choices = [...document.querySelectorAll('.vote-choice')];
  const labels = { yes: 'In favour', no: 'Opposed', abstain: 'Abstain' };
  let selection = null, voteStep = 'select', questionSent = false, queued = false;
  function renderVote() {
    byId('vote-select').hidden = voteStep !== 'select';
    byId('vote-review').hidden = voteStep !== 'review';
    byId('vote-confirmation').hidden = voteStep !== 'submitted';
    choices.forEach(choice => {
      choice.setAttribute('aria-pressed', String(choice.dataset.choice === selection));
      choice.disabled = voteStep === 'submitted';
    });
    byId('vote-review-button').disabled = selection === null;
    byId('vote-review-choice').textContent = labels[selection] || '';
    byId('vote-submit').disabled = voteStep !== 'review';
  }
  choices.forEach(choice => choice.addEventListener('click', () => {
    if (voteStep !== 'select') return;
    selection = choice.dataset.choice;
    renderVote();
  }));
  byId('vote-review-button').addEventListener('click', () => {
    if (selection === null || voteStep !== 'select') return;
    voteStep = 'review'; renderVote(); byId('review-heading').focus();
  });
  byId('vote-change').addEventListener('click', () => {
    if (voteStep !== 'review') return;
    voteStep = 'select'; renderVote();
    choices.find(choice => choice.dataset.choice === selection).focus();
  });
  byId('vote-submit').addEventListener('click', () => {
    if (voteStep !== 'review' || selection === null) return;
    voteStep = 'submitted'; renderVote(); byId('vote-confirmation').focus();
    track('Demo Vote Cast');
  });
  function closeQuestion() {
    byId('qa-form').hidden = true;
    byId('qa-start').setAttribute('aria-expanded', 'false');
  }
  byId('qa-start').addEventListener('click', () => {
    if (questionSent) return;
    const opening = byId('qa-form').hidden;
    byId('qa-form').hidden = !opening;
    byId('qa-start').setAttribute('aria-expanded', String(opening));
    if (opening) byId('qa-input').focus();
  });
  byId('qa-cancel').addEventListener('click', () => { closeQuestion(); byId('qa-start').focus(); });
  byId('qa-input').addEventListener('input', () => {
    byId('qa-submit').disabled = questionSent || !byId('qa-input').value.trim();
  });
  byId('qa-form').addEventListener('submit', event => {
    event.preventDefault();
    const question = byId('qa-input').value.trim().slice(0, 280);
    if (!question || questionSent) return;
    questionSent = true;
    byId('qa-question-text').textContent = question;
    byId('qa-new-question').hidden = false;
    byId('qa-start').disabled = true;
    byId('qa-start').textContent = 'Question submitted';
    byId('qa-submit').disabled = true;
    closeQuestion(); selectQuestions('your'); byId('qa-confirmation').focus();
    track('Demo Question Submitted');
  });
  function renderQueue() {
    byId('queue-status').textContent = queued ? 'You’re in the queue. Your sample request is approved; you are number 1.' : 'The queue is open for speaker requests.';
    byId('raise-hand').hidden = queued;
    byId('leave-queue').hidden = !queued;
    byId('queue-empty').hidden = queued;
    byId('speaker-order').hidden = !queued;
  }
  function closeRequest() {
    byId('queue-request').hidden = true;
    byId('raise-hand').setAttribute('aria-expanded', 'false');
  }
  byId('raise-hand').addEventListener('click', () => {
    if (queued) return;
    byId('queue-request').hidden = false;
    byId('raise-hand').hidden = true;
    byId('raise-hand').setAttribute('aria-expanded', 'true');
    byId('queue-side').focus();
  });
  byId('queue-side').addEventListener('change', () => { byId('send-request').disabled = !byId('queue-side').value; });
  byId('cancel-request').addEventListener('click', () => {
    closeRequest(); renderQueue(); byId('raise-hand').focus();
  });
  byId('queue-request').addEventListener('submit', event => {
    event.preventDefault();
    if (queued || !['In favour', 'Opposed'].includes(byId('queue-side').value)) return;
    queued = true;
    byId('speaker-side').textContent = byId('queue-side').value;
    closeRequest(); renderQueue(); byId('leave-queue').focus();
    track('Demo Speaker Queue Joined');
  });
  byId('leave-queue').addEventListener('click', () => {
    queued = false; byId('speaker-side').textContent = '';
    byId('queue-side').selectedIndex = 0; byId('send-request').disabled = true;
    renderQueue(); byId('raise-hand').focus();
  });
  byId('member-home').addEventListener('click', () => {
    byId('event-workspace').hidden = true; byId('member-portal').hidden = false; byId('portal-title').focus();
  });
  byId('open-event').addEventListener('click', () => {
    byId('member-portal').hidden = true; byId('event-workspace').hidden = false;
    selectTool('voting', true);
  });
  byId('open-document').addEventListener('click', () => {
    byId('sample-document').hidden = false; byId('sample-document').focus();
  });
  byId('close-document').addEventListener('click', () => {
    byId('sample-document').hidden = true; byId('open-document').focus();
  });
  byId('tour-reset').addEventListener('click', () => {
    selection = null; voteStep = 'select'; questionSent = false; queued = false;
    byId('qa-input').value = ''; byId('qa-question-text').textContent = '';
    byId('qa-new-question').hidden = true; byId('qa-start').disabled = false;
    byId('qa-start').textContent = '＋ Ask a question'; byId('qa-submit').disabled = true;
    byId('sample-document').hidden = true;
    byId('queue-side').selectedIndex = 0; byId('send-request').disabled = true;
    byId('speaker-side').textContent = ''; closeRequest();
    selectExample('ballot'); byId('ballot-screen-reference').hidden = false;
    document.querySelectorAll('.member-app details').forEach(details => { details.open = false; });
    byId('member-portal').hidden = true; byId('event-workspace').hidden = false;
    closeQuestion(); renderVote(); renderQueue(); selectQuestions('your'); selectTool('voting', true);
  });
  renderVote(); renderQueue(); selectQuestions('your'); selectTool('voting');
})();
