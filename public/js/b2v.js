document.addEventListener('DOMContentLoaded', () => {
  const advSelect = document.getElementById('advFilter');
  const historySelect = document.getElementById('historyFilter');
  const submitButton = document.getElementById('saveButton');
  const formContainer = document.getElementById('data-container');

  let currentB2VData = null;

  const setFormDisabled = (disabled) => {
    const elements = formContainer.querySelectorAll('input, select, textarea, button');
    elements.forEach(el => {
      if (el !== advSelect && el !== historySelect && el !== submitButton) {
        el.disabled = disabled;
      }
    });
    submitButton.disabled = disabled;
  };
  const add1s = (isoDate) => {
    const d = new Date(isoDate);
    d.setSeconds(d.getSeconds() + 1);
    return d.toISOString();
  };

  const fetchHistoryDates = async (b2vId) => {
  try {
    const url = `/api/b2v_historique/${b2vId}/dates`;
    console.log('[fetchHistoryDates] URL appelée :', url);
    const resp = await fetch(url);
    const data = await resp.json();
    console.log('[fetchHistoryDates] Données reçues :', data);

    historySelect.innerHTML = '';

    const latestOpt = new Option("🔄 Dernière version", '');
    latestOpt.selected = true;
    historySelect.appendChild(latestOpt);

    if (data.length === 0) {
      const opt = new Option("Aucune donnée historique", "");
      opt.disabled = true;
      historySelect.appendChild(opt);
      historySelect.disabled = true;
    } else {
      historySelect.disabled = false;
      data.forEach(r => {
        const opt = new Option(new Date(r.snapshot_date).toLocaleString(), r.snapshot_date);
        historySelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Erreur chargement dates historiques:', err);
  }
};

const fetchHistoricalVersion = async (b2vId, snapshotDate) => {
  try {
    const url = `/api/b2v_historique/${b2vId}/date/${encodeURIComponent(snapshotDate)}`;
    console.log('[fetchHistoricalVersion] URL appelée :', url);
    const resp = await fetch(url);
    const data = await resp.json();
    console.log('[fetchHistoricalVersion] Données reçues :', data);

    if (data) {
      fillForm(data);
      setFormDisabled(true); // lecture seule
    }
  } catch (err) {
    console.error('Erreur chargement version historique:', err);
  }
};

const fetchB2VData = async (advFilter) => {
  try {
    const url = advFilter ? `/api/b2v?adv=${encodeURIComponent(advFilter)}` : '/api/b2v';
    console.log('[fetchB2VData] URL appelée :', url);
    const resp = await fetch(url);
    const data = await resp.json();
    console.log('[fetchB2VData] Données reçues :', data);

    if (data.length) {
      currentB2VData = data[0];
      
      fillForm(currentB2VData);
      setFormDisabled(false); // formulaire actif
      document.getElementById('id').value = currentB2VData.id;
      await fetchHistoryDates(currentB2VData.id);
    }
  } catch (err) {
    console.error('Erreur fetch B2V:', err);
  }
};

const loadADVs = async () => {
  try {
    const url = '/api/b2v/advs';
    console.log('[loadADVs] URL appelée :', url);
    const resp = await fetch(url);
    const advs = await resp.json();
    console.log('[loadADVs] Données reçues :', advs);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  historySelect.addEventListener('change', e => {
    const selectedDate = e.target.value;
    const b2vId = document.getElementById('id').value;
    if (!selectedDate) {
      // Affiche de nouveau la version actuelle
      if (currentB2VData) {
        fillForm(currentB2VData);
        setFormDisabled(false);
      }
    } else {
      const adjustedDate = add1s(selectedDate);
      fetchHistoricalVersion(b2vId, adjustedDate);
    }
  });

  const fillForm = (d) => {
    try {

      // Champs simples
      ['adv','tangente','modele','plancher','pose','ecrg','e2cg','p2pg','ecrd','e2cd','p2pd','coeurn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = d[id] ?? '';
      });

      // Champs booléens
      ['dmar', 'coussinet'].forEach(field => {
        const oui = document.getElementById(`${field}-oui`);
        const non = document.getElementById(`${field}-non`);
        if (oui) oui.checked = d[field] === true;
        if (non) non.checked = d[field] === false;
      });

      ['bavureg', 'bavured'].forEach(field => {
        const val = d[field];
        const el = document.getElementById(`${field}-${val}`);
        if (el) el.checked = true;
      });

      ['gt3','lt3','0'].forEach(s => {
        const val = s === 'gt3' ? '> 3mm' : s === 'lt3' ? '< 3mm' : '0mm';
        const ag = document.getElementById(`usure_1ag-${s}`);
        const ad = document.getElementById(`usure_1ad-${s}`);
        if (ag) ag.checked = (d.usure_1ag === val);
        if (ad) ad.checked = (d.usure_1ad === val);
      });

      ['classement_cag','classement_cad','pente_usure_ag', 'pente_usure_ad', 'classement_ag', 'classement_ad', 'longeur_ebrechureg','longeur_ebrechured','classement_eg','classement_ed'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = d[id] ?? '';
      });

      ['usure_1b','usure_1c'].forEach(pref => {
        ['ok','meulage','refuse'].forEach(opt => {
          const g = document.getElementById(`${pref}g-${opt}`);
          const dEl = document.getElementById(`${pref}d-${opt}`);
          if (g) g.checked = d[`${pref}g`] === opt;
          if (dEl) dEl.checked = d[`${pref}d`] === opt;
        });
      });

      ['contact_fenteg','contact_fented','contact_ebrechureag','contact_ebrechuread'].forEach(id => {
        ['dessus','dessous'].forEach(pos => {
          const radio = document.getElementById(`${id}-${pos}`);
          if (radio) radio.checked = d[id] === pos;
        });
      });

    } catch (err) {
      console.error("💥 Erreur dans fillForm:", err);
    }
  };


submitButton.addEventListener('click', async () => {
  const id = document.getElementById('id').value;
  const payload = {};

  // 1. Collecter les radios groupés par "name"
  const radioGroups = new Set();
  formContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
    radioGroups.add(radio.name);
  });

  radioGroups.forEach(groupName => {
    const checked = formContainer.querySelector(`input[name="${groupName}"]:checked`);
    if (checked) payload[groupName] = checked.value;
  });

  // 2. Inputs autres que radio
  const elements = formContainer.querySelectorAll('input:not([type="radio"])[id], select[id]');
  elements.forEach(el => {
    const { id: key, type } = el;
    if (type === 'checkbox') {
      payload[key] = el.checked;
    } else {
      payload[key] = el.value;
    }
  });

  // 3. Ajout de champs manquants
  payload.adv = payload.adv || advSelect.value;
  payload.id = id;

  // 4. Envoi au backend
  try {
    const res = await fetch(`/api/b2v/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("✅ Modifications enregistrées !");
      await fetchB2VData(advSelect.value);
    } else {
      const err = await res.json();
      alert("❌ Échec de la mise à jour : " + (err.error || res.status));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Erreur réseau");
  }
});


  loadADVs();
});
