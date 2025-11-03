document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  // ... (récupération des valeurs inchangée) ...
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
    
    // NOUVEAU TRAITEMENT: HTTP 202 = Demande soumise (en attente)
    if (res.status === 202) { 
      // Afficher un message de succès/attente plus clair, ne pas rediriger vers /login
      document.getElementById('signupError').textContent = data.message || "Demande d'inscription soumise. Vous serez notifié après validation.";
      document.getElementById('signupError').classList.remove('hidden');
      document.getElementById('signupError').classList.remove('text-red-500'); // Optionnel: changer de couleur pour succès
      document.getElementById('signupError').classList.add('text-green-500'); 

    } else if (!res.ok) {
      // Échec (400, 500, etc.)
      document.getElementById('signupError').textContent = data.message || "Erreur lors de l'inscription";
      document.getElementById('signupError').classList.remove('hidden');
      document.getElementById('signupError').classList.add('text-red-500');

    } else {
      // Cas non prévu (si le serveur retourne un 200/201, on redirige quand même pour une inscription directe, si ça avait été le cas)
      window.location.href = '/login'; 
    }
  } catch (err) {
    document.getElementById('signupError').textContent = "Erreur réseau";
    document.getElementById('signupError').classList.remove('hidden');
  }
});