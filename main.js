/* ============================================================
   LEADMAGNET HERO – main.js
   Finavio · Funnel Steuern sparen
   ============================================================ */

// ── Supabase-Konfiguration ──
const SB_URL = 'https://exjkhvjyeiemivkktuta.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4amtodmp5ZWllbWl2a2t0dXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDE5NDQsImV4cCI6MjA5MDkxNzk0NH0.ooNzSB6LKscyLgtgmIXaTt1mZrqp9XVJYq8VJBdWMw8';

document.addEventListener('DOMContentLoaded', function () {

  var overlay     = document.getElementById('lm-modal-overlay');
  var progressBar = document.getElementById('lm-progress-bar');
  var closeBtn    = document.getElementById('lm-modal-close');
  var leadData    = { beruf: '', einkommen: '', name: '', email: '', phone: '', source: 'Finavio V1 Leadmagnet' };

  var PROGRESS = { 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 100, 6: 100 };

  // ── Modal öffnen / schließen ──
  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showStep(0);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showStep(n) {
    overlay.querySelectorAll('.lm-modal-step').forEach(function (s) { s.classList.remove('is-active'); });
    var target = overlay.querySelector('[data-step="' + n + '"]');
    if (target) {
      target.classList.add('is-active');
      var inp = target.querySelector('input');
      if (inp) setTimeout(function () { inp.focus(); }, 80);
    }
    progressBar.style.width = (PROGRESS[n] || 0) + '%';
  }

  // ── Validierung: Input darf nicht leer sein ──
  function validateInput(inp) {
    if (!inp) return true;
    var val = inp.value.trim();
    if (!val) {
      inp.classList.add('is-error');
      inp.focus();
      inp.addEventListener('input', function () { inp.classList.remove('is-error'); }, { once: true });
      return false;
    }
    // E-Mail-Format prüfen
    if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      inp.classList.add('is-error');
      inp.focus();
      inp.addEventListener('input', function () { inp.classList.remove('is-error'); }, { once: true });
      return false;
    }
    return true;
  }

  // ── CTA-Buttons & Mockup öffnen Modal ──
  document.querySelectorAll('.lm-btn-primary').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });

  var mockup = document.querySelector('.lm-mockup-img');
  if (mockup) {
    mockup.style.cursor = 'pointer';
    mockup.addEventListener('click', openModal);
  }

  // ── Schließen ──
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // ── Weiter-Buttons ──
  overlay.querySelectorAll('.lm-modal-btn-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var activeStep = overlay.querySelector('.lm-modal-step.is-active');
      var inp = activeStep ? activeStep.querySelector('input') : null;
      if (!validateInput(inp)) return;
      if (inp) leadData[inp.id] = inp.value.trim();
      showStep(parseInt(btn.getAttribute('data-next'), 10));
    });
  });

  // ── Enter-Taste ──
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var activeStep = overlay.querySelector('.lm-modal-step.is-active');
    if (!activeStep) return;
    var nextBtn = activeStep.querySelector('.lm-modal-btn-next, .lm-modal-btn-submit');
    if (nextBtn) nextBtn.click();
  });

  // ── Einkommen-Auswahl → automatisch weiter ──
  overlay.querySelectorAll('.lm-modal-choice').forEach(function (btn) {
    btn.addEventListener('click', function () {
      overlay.querySelectorAll('.lm-modal-choice').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      leadData.einkommen = btn.getAttribute('data-value');
      setTimeout(function () { showStep(parseInt(btn.getAttribute('data-next'), 10)); }, 280);
    });
  });

  // ── Absenden ──
  var submitBtn = document.getElementById('lm-modal-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async function () {
      var activeStep = overlay.querySelector('.lm-modal-step.is-active');
      var inp = activeStep ? activeStep.querySelector('input') : null;
      if (!validateInput(inp)) return;
      if (inp) leadData[inp.id] = inp.value.trim();

      submitBtn.textContent = 'Wird gesichert…';
      submitBtn.disabled = true;

      var payload = {
        beruf:    (document.getElementById('lm-input-beruf')    || {}).value || '',
        einkommen: leadData.einkommen || '',
        name:     (document.getElementById('lm-input-name')     || {}).value || '',
        email:    (document.getElementById('lm-input-email')    || {}).value || '',
        phone:    (document.getElementById('lm-input-whatsapp') || {}).value || '',
        source:   'Finavio V1 Leadmagnet'
      };

      try {
        var response = await fetch(SB_URL + '/rest/v1/leads', {
          method: 'POST',
          headers: {
            'apikey': SB_KEY,
            'Authorization': 'Bearer ' + SB_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          var nameEl = document.getElementById('lm-thanks-name');
          if (nameEl) nameEl.textContent = leadData.name;
          showStep(6);
        } else {
          alert('Fehler beim Speichern. Bitte versuch es nochmal.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Videoanleitung sichern →';
        }
      } catch (err) {
        console.error('Fehler:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Videoanleitung sichern →';
      }
    });
  }

});
