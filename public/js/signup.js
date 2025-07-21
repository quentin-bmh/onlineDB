document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      document.getElementById('signupError').textContent = data.message || "Erreur lors de l'inscription";
      document.getElementById('signupError').classList.remove('hidden');
    } else {
      window.location.href = '/login.html';
    }
  } catch (err) {
    document.getElementById('signupError').textContent = "Erreur réseau";
    document.getElementById('signupError').classList.remove('hidden');
  }
});
