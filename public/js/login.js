document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 1. Récupération des valeurs du formulaire
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginError = document.getElementById('loginError'); // Assurez-vous d'avoir cet élément <p id="loginError"> dans votre HTML
  // Masquer les messages d'erreur précédents
  loginError.classList.add('hidden');
  loginError.textContent = '';
  try {
    // 2. Envoi de la requête de connexion
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    // 3. Traitement de la réponse
    const data = await res.json();
    if (res.ok) {
      // Connexion réussie (Statut 200 OK)
      const user = data.user;
    
      // Stocker le nom d'utilisateur pour affichage (facultatif, mais utile)
      localStorage.setItem('username', user.username || 'Utilisateur'); 
      // Redirection basée sur le rôle is_admin
      if (user && user.is_admin === true) {
        window.location.href = '/dashboard'; // Redirection Admin
      } else {
        window.location.href = '/index'; // Redirection Utilisateur Standard
      }
    } else {
      // Échec de la connexion (Statut 400, 401, etc.)
      loginError.textContent = data.message || "Connexion échouée. Veuillez vérifier vos identifiants.";
      loginError.classList.remove('hidden');
    }
  }catch (err) {
   // Erreur réseau ou de parsing
   console.error("Erreur réseau/serveur :", err);
   loginError.textContent = "Erreur de connexion au serveur. Veuillez réessayer.";
   loginError.classList.remove('hidden');
  }
});
