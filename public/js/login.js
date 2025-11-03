document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginError = document.getElementById('loginError'); 
  loginError.classList.add('hidden');
  loginError.textContent = '';
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    
    if (res.ok) {
      const user = data.user;
    
      localStorage.setItem('username', user.username || 'Utilisateur'); 
      if (user && user.is_admin === true) {
        window.location.href = '/dashboard'; 
      } else {
        window.location.href = '/index'; 
      }
    } else {
      if (data.code === 'PENDING_APPROVAL') {
        loginError.textContent = "Votre demande d'inscription est en attente de validation par un administrateur. Veuillez patienter.";
        loginError.classList.remove('text-red-500'); 
        loginError.classList.add('text-yellow-500'); 
      } else {
        loginError.textContent = data.message || "Connexion échouée. Veuillez vérifier vos identifiants.";
        loginError.classList.remove('text-yellow-500'); 
        loginError.classList.add('text-red-500'); 
      }
      
      loginError.classList.remove('hidden');
    }
  }catch (err) {
   console.error("Erreur réseau/serveur :", err);
   loginError.textContent = "Erreur de connexion au serveur. Veuillez réessayer.";
   loginError.classList.remove('hidden');
  }
});