document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // login.js
  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user?.username || 'Utilisateur');
        window.location.href = '/index.html';
      } else {
        alert('Connexion échouée');
      }
    })
    .catch(err => {
      console.error("Erreur de connexion :", err);
      alert("Erreur serveur");
    });

});
