/* Local, illustrative interactions only. No ballots or questions leave this page. */
(() => {
  const byId = id => document.getElementById(id);
  const track = name => { if (typeof window.plausible === 'function') window.plausible(name); };
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.demo-panel')];
  function selectTab(name, focus = false) {
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = panel.id !== name + '-panel'; });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next].dataset.tab, true);
      }
    });
  });

  const choices = [...document.querySelectorAll('.vote-choice')];
  const labels = { yes: 'Yes', no: 'No', abstain: 'Abstain' };
  let voteOpen = true, selection = null, submitted = false, reviewing = false;
  function renderVote() {
    byId('vote-toggle').textContent = voteOpen ? 'Close vote' : 'Open vote';
    byId('vote-admin-status').textContent = voteOpen ? 'The sample vote is open. Members can review and submit a ballot.' : 'The sample vote is closed. New ballots cannot be submitted.';
    byId('vote-admin-status').className = 'admin-status' + (voteOpen ? ' is-live' : '');
    byId('vote-member-state').textContent = submitted ? 'Vote recorded' : voteOpen ? 'Vote is open' : 'Vote is closed';
    choices.forEach(choice => {
      choice.disabled = !voteOpen || submitted;
      choice.setAttribute('aria-pressed', String(choice.dataset.choice === selection));
      choice.classList.toggle('is-selected', choice.dataset.choice === selection);
    });
    byId('vote-choices').hidden = reviewing || submitted;
    byId('vote-review-button').hidden = reviewing || submitted;
    byId('vote-review-button').disabled = !voteOpen || selection === null;
    byId('vote-review').hidden = !reviewing || submitted;
    byId('vote-review-choice').textContent = selection ? labels[selection] : '';
    byId('vote-submit').disabled = !voteOpen;
    byId('vote-confirmation').hidden = !submitted;
    byId('vote-results').hidden = !submitted || voteOpen;
    byId('vote-progress').textContent = submitted ? '3 of 3 · Your sample vote is recorded.' : reviewing ? '2 of 3 · Check your selection, then submit.' : '1 of 3 · Choose Yes, No, or Abstain.';
    Object.keys(labels).forEach(choice => { byId(choice + '-count').textContent = submitted && choice === selection ? '1' : '0'; });
  }
  byId('vote-toggle').addEventListener('click', () => { voteOpen = !voteOpen; renderVote(); });
  choices.forEach(choice => choice.addEventListener('click', () => {
    if (!voteOpen || submitted) return;
    selection = choice.dataset.choice;
    renderVote();
  }));
  byId('vote-review-button').addEventListener('click', () => {
    if (!voteOpen || selection === null || submitted) return;
    reviewing = true;
    renderVote();
    byId('vote-submit').focus();
  });
  byId('vote-change').addEventListener('click', () => {
    reviewing = false;
    renderVote();
    choices.find(choice => choice.dataset.choice === selection)?.focus();
  });
  byId('vote-submit').addEventListener('click', () => {
    if (!voteOpen || selection === null || !reviewing || submitted) return;
    submitted = true;
    renderVote();
    byId('vote-confirmation').focus();
    track('Demo Vote Cast');
  });

  let qaOpen = true, questionSent = false, questionReviewed = false;
  function renderQa() {
    byId('qa-toggle').textContent = qaOpen ? 'Close Q&A' : 'Open Q&A';
    byId('qa-admin-status').textContent = !qaOpen ? 'Q&A is closed.' : questionReviewed ? 'The sample question has been approved for the presenter.' : questionSent ? 'One member question is waiting for review.' : 'Q&A is open. No questions have been submitted yet.';
    byId('qa-admin-status').className = 'admin-status' + (qaOpen ? ' is-action' : '');
    byId('qa-member-state').textContent = questionSent ? 'Question submitted' : qaOpen ? 'Questions are open' : 'Questions are closed';
    byId('qa-input').disabled = !qaOpen || questionSent;
    byId('qa-submit').disabled = !qaOpen || questionSent || !byId('qa-input').value.trim();
    byId('qa-confirmation').hidden = !questionSent;
    byId('qa-confirmation').textContent = questionReviewed ? 'Your sample question has been approved for the presenter.' : 'Your sample question is waiting for host review.';
  }
  byId('qa-input').addEventListener('input', renderQa);
  byId('qa-toggle').addEventListener('click', () => { qaOpen = !qaOpen; renderQa(); });
  byId('qa-submit').addEventListener('click', () => {
    const question = byId('qa-input').value.trim();
    if (!qaOpen || questionSent || !question) return;
    questionSent = true;
    byId('qa-empty').hidden = true;
    const item = document.createElement('li');
    const text = document.createElement('span');
    const approve = document.createElement('button');
    text.textContent = question;
    approve.type = 'button';
    approve.className = 'action';
    approve.textContent = 'Approve for presenter';
    approve.addEventListener('click', () => {
      questionReviewed = true;
      approve.textContent = 'Approved';
      approve.disabled = true;
      renderQa();
    });
    item.append(text, approve);
    byId('qa-list').append(item);
    renderQa();
    byId('qa-confirmation').focus();
    track('Demo Question Submitted');
  });

  let floorOpen = true, handRaised = false, speaking = false;
  function renderQueue() {
    byId('queue-toggle').textContent = floorOpen ? 'Close the floor' : 'Open the floor';
    byId('queue-admin-status').textContent = !floorOpen ? 'The floor is closed to new requests.' : speaking ? 'Member 1 has been called to speak.' : handRaised ? 'Member 1 is waiting. The chair can call the next speaker.' : 'The floor is open. Members can request to speak.';
    byId('queue-admin-status').className = 'admin-status' + (floorOpen ? ' is-queue' : '');
    byId('queue-member-state').textContent = speaking ? 'It is your turn' : handRaised ? 'You are in the queue' : floorOpen ? 'The floor is open' : 'The floor is closed';
    byId('raise-hand').disabled = !floorOpen || handRaised;
    byId('queue-confirmation').hidden = !handRaised;
    byId('queue-confirmation').textContent = speaking ? 'The chair has called you to speak.' : 'You are first in the queue. Wait for the chair to call you.';
    byId('queue-empty').hidden = handRaised;
    byId('queue-member').hidden = !handRaised || speaking;
    byId('call-speaker').disabled = !handRaised || speaking;
    byId('current-speaker').textContent = speaking ? 'You' : 'None';
    byId('queue-position').textContent = handRaised && !speaking ? '1' : '—';
  }
  byId('queue-toggle').addEventListener('click', () => { floorOpen = !floorOpen; renderQueue(); });
  byId('raise-hand').addEventListener('click', () => {
    if (!floorOpen || handRaised) return;
    handRaised = true;
    renderQueue();
    byId('queue-confirmation').focus();
    track('Demo Speaker Queue Joined');
  });
  byId('call-speaker').addEventListener('click', () => {
    if (!handRaised || speaking) return;
    speaking = true;
    renderQueue();
  });
  byId('tour-reset').addEventListener('click', () => {
    voteOpen = true; selection = null; submitted = false; reviewing = false;
    qaOpen = true; questionSent = false; questionReviewed = false;
    byId('qa-input').value = '';
    [...byId('qa-list').children].forEach(item => { if (item.id !== 'qa-empty') item.remove(); });
    byId('qa-empty').hidden = false;
    floorOpen = true; handRaised = false; speaking = false;
    document.querySelectorAll('details.host').forEach(details => { details.open = false; });
    renderVote(); renderQa(); renderQueue();
    selectTab('voting', true);
  });
  selectTab('voting'); renderVote(); renderQa(); renderQueue();
})();
