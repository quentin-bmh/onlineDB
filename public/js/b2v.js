document.addEventListener('DOMContentLoaded', () => {
  const advSelect = document.getElementById('advFilter');
  const submitButton = document.getElementById('saveButton');

  const fetchB2VData = async (advFilter) => {
    try {
      const url = advFilter ? `/api/b2v?adv=${encodeURIComponent(advFilter)}` : '/api/b2v';
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.length) {
        fillForm(data[0]);
      } else {
        console.warn("Aucune donnée B2V trouvée pour cet ADV.");
      }
    } catch (err) {
      console.error('Erreur fetch B2V:', err);
    }
  };

  const loadADVs = async () => {
    try {
      const resp = await fetch('/api/b2v/advs');
      const advs = await resp.json();
      advSelect.innerHTML = '';
      advs.forEach(r => {
        const opt = new Option(r.adv, r.adv);
        advSelect.appendChild(opt);
      });
      if (advSelect.value) {
        fetchB2VData(advSelect.value);
      }
    } catch (e) {
      console.error('Erreur chargement liste ADV:', e);
    }
  };

  advSelect.addEventListener('change', e => {
    fetchB2VData(e.target.value);
  });

  loadADVs();

  const fillForm = (d) => {
    try {
      ['adv','tangente','modele','plancher','pose','ecrg','e2cg','p2pg','ecrd','e2cd','p2pd','coeurn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = d[id];
      });
      document.getElementById('id').value = d.id;
      document.getElementById('dmar-oui').checked = d.dmar === true;
      document.getElementById('dmar-non').checked = d.dmar === false;
      document.getElementById('coussinet-oui').checked = d.coussinet === true;
      document.getElementById('coussinet-non').checked = d.coussinet === false;

      document.getElementById(`bavureg-${d.bavureg}`).checked = true;
      document.getElementById(`bavured-${d.bavured}`).checked = true;

      ['gt3','lt3','0'].forEach(s => {
        const val = s === 'gt3' ? '> 3mm' : s === 'lt3' ? '< 3mm' : '0mm';
        document.getElementById(`usure_1ag-${s}`).checked = (d.usure_1ag === val);
        document.getElementById(`usure_1ad-${s}`).checked = (d.usure_1ad === val);
      });

      document.getElementById('classement_cag').value = d.classement_cag;
      document.getElementById('classement_cad').value = d.classement_cad;

      ['usure_1b','usure_1c'].forEach(pref => {
        ['ok','meulage','refuse'].forEach(opt => {
          document.getElementById(`${pref}g-${opt}`).checked = (d[`${pref}g`] === opt);
          document.getElementById(`${pref}d-${opt}`).checked = (d[`${pref}d`] === opt);
        });
      });

      ['contact_fenteg','contact_fented'].forEach(id => {
        ['dessus','dessous'].forEach(pos => {
          const el = document.getElementById(`${id}-${pos}`);
          if (el) el.checked = (d[id] === pos);
        });
      });

      document.getElementById('pente_usure_ag').value = d.pente_usure_ag;
      document.getElementById('pente_usure_ad').value = d.pente_usure_ad;
      document.getElementById('classement_ag').value = d.classement_ag;
      document.getElementById('classement_ad').value = d.classement_ad;

      ['contact_ebrechureag','contact_ebrechuread'].forEach(id => {
        const value = (d[id] || "").trim().toLowerCase();
        ['dessus','dessous'].forEach(pos => {
          const radio = document.getElementById(`${id}-${pos}`);
          if (radio) radio.checked = value === pos;
        });
      });

      document.getElementById('longeur_ebrechureg').value = d.longeur_ebrechureg ?? '';
      document.getElementById('longeur_ebrechured').value = d.longeur_ebrechured ?? '';
      document.getElementById('classement_eg').value = d.classement_eg ?? '';
      document.getElementById('classement_ed').value = d.classement_ed ?? '';
    } catch (err) {
      console.error("💥 Erreur dans fillForm:", err);
    }
  };

  // ✅ Sauvegarde
  submitButton.addEventListener('click', async () => {
    const id = document.getElementById('id').value;
    const formEl = document.getElementById('data-container');
    const payload = {};

    const elements = formEl.querySelectorAll('input[id], select[id]');
    elements.forEach(el => {
      const { id: key, type } = el;
      if (type === 'radio') {
        if (el.checked) payload[key] = el.value;
      } else if (type === 'checkbox') {
        payload[key] = el.checked;
      } else {
        payload[key] = el.value;
      }
    });

    // Pour éviter les mauvaises valeurs :
    if (!payload.adv) {
      payload.adv = advSelect.value;
    }

    payload.id = id;

    console.log('🧭 Payload envoyé :', payload);

    try {
      const res = await fetch(`/api/b2v/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("✅ Modifications enregistrées !");
      } else {
        const err = await res.json();
        alert("❌ Échec de la mise à jour : " + (err.error || res.status));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau");
    }
  });
});
