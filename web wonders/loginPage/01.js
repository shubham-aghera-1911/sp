function switchTab(mode) {
  document.getElementById('panel-login').classList.toggle('active', mode === 'login');
  document.getElementById('panel-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('tab-login').setAttribute('aria-selected', mode === 'login');
  document.getElementById('tab-signup').setAttribute('aria-selected', mode === 'signup');
}

function handleOAuth(provider) {
  // Replace with your real OAuth call, e.g.:
  // Firebase:   signInWithPopup(auth, new GoogleAuthProvider())
  // Passport:   window.location.href = '/api/auth/' + provider
  // Supabase:   supabase.auth.signInWithOAuth({ provider })
  alert('Hook this button up to your ' + provider + ' OAuth flow.');
}

function handleSubmit(e, mode) {
  e.preventDefault();
  alert((mode === 'login' ? 'Log in' : 'Sign up') + ' submitted — wire this to your auth backend.');
}

/* ---------- show / hide password ---------- */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.querySelector('.icon-eye').style.display = showing ? 'block' : 'none';
  btn.querySelector('.icon-eye-off').style.display = showing ? 'none' : 'block';
  btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

/* ---------- password strength meter ---------- */
function checkStrength(value) {
  const wrap = document.getElementById('strength-wrap');
  const label = document.getElementById('strength-label');

  if (!value) {
    wrap.className = 'strength';
    label.textContent = 'Password strength';
    return;
  }

  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  let tier = 'weak', text = 'Weak — try adding more characters';
  if (score >= 4) { tier = 'strong'; text = 'Strong password'; }
  else if (score === 3) { tier = 'good'; text = 'Good, could be stronger'; }
  else if (score === 2) { tier = 'fair'; text = 'Fair — add numbers or symbols'; }

  wrap.className = 'strength ' + tier;
  label.textContent = text;
}

/* ---------- remember me: prefill last used email ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const rememberBox = document.getElementById('remember-me');
  const loginEmail = document.querySelector('#panel-login input[type="email"]');
  const savedEmail = localStorage.getItem('studyos_remember_email');

  if (savedEmail && loginEmail) {
    loginEmail.value = savedEmail;
    rememberBox.checked = true;
  }

  const loginForm = document.querySelector('#panel-login form');
  loginForm.addEventListener('submit', () => {
    if (rememberBox.checked) {
      localStorage.setItem('studyos_remember_email', loginEmail.value);
    } else {
      localStorage.removeItem('studyos_remember_email');
    }
  });
});