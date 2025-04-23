document.addEventListener('DOMContentLoaded', () => {
    const fetchB2VData = async (dateFilter) => {
      try {
        const url = dateFilter ? `/api/b2v?created_at=${dateFilter}` : '/api/b2v';
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.length) fillForm(data[0]);
      } catch (err) {
        console.error('Erreur fetch B2V:', err);
      }
    };
  
    const fillForm = (d) => {
      // Texte / selects simples
      document.getElementById('tangente').value = d.tangente;
      document.getElementById('modele').value   = d.modele;
      document.getElementById('plancher').value = d.plancher;
      document.getElementById('pose').value     = d.pose;
      document.getElementById('ecrg').value     = d.ecrg;
      document.getElementById('e2cg').value     = d.e2cg;
      document.getElementById('p2pg').value     = d.p2pg;
      document.getElementById('ecrd').value     = d.ecrd;
      document.getElementById('e2cd').value     = d.e2cd;
      document.getElementById('p2pd').value     = d.p2pd;
      document.getElementById('coeurn').value   = d.coeurn;
  
      // Checkboxes DMAR / Coussinet
      document.getElementById('dmar-oui').checked     = d.dmar === true;
      document.getElementById('dmar-non').checked     = d.dmar === false;
      document.getElementById('coussinet-oui').checked  = d.coussinet === true;
      document.getElementById('coussinet-non').checked  = d.coussinet === false;
  
      // Radios bavures
      document.getElementById(`bavureg-${d.bavureg}`).checked = true;
      document.getElementById(`bavured-${d.bavured}`).checked = true;
  
      // Usure Contre-Aiguille
      ['gt3','lt3','0'].forEach(s => {
        document.getElementById(`usure_1ag-${s}`).checked = (d.usure_1ag === (s==='gt3'?'> 3mm':s==='lt3'?'< 3mm':'0mm'));
        document.getElementById(`usure_1ad-${s}`).checked = (d.usure_1ad === (s==='gt3'?'> 3mm':s==='lt3'?'< 3mm':'0mm'));
      });
      document.getElementById('classement_cag').value = d.classement_cag;
      document.getElementById('classement_cad').value = d.classement_cad;
  
      // Usure 1b / 1c
      ['usure_1b','usure_1c'].forEach(pref => {
        ['ok','meulage','refuse'].forEach(opt => {
          document.getElementById(`${pref}g-${opt}`).checked = (d[`${pref}g`] === opt);
          document.getElementById(`${pref}d-${opt}`).checked = (d[`${pref}d`] === opt);
        });
      });
  
      // Usure Aiguille
      ['contact_fenteg','contact_fented'].forEach(id => {
        ['dessus','dessous'].forEach(pos => {
          document.getElementById(`${id}-${pos}`).checked = (d[id] === pos);
        });
      });
      document.getElementById('pente_usure_ag').value = d.pente_usure_ag;
      document.getElementById('pente_usure_ad').value = d.pente_usure_ad;
      document.getElementById('classement_ag').value   = d.classement_ag;
      document.getElementById('classement_ad').value   = d.classement_ad;
  
      // Ébréchure
      ['contact_ebrechureag','contact_ebrechuread'].forEach(id => {
        ['dessus','dessous'].forEach(pos => {
          document.getElementById(`${id}-${pos}`).checked = (d[id] === pos);
        });
      });
      document.getElementById('longeur_ebrechureg').value = d.longeur_ebrechureg;
      document.getElementById('longeur_ebrechured').value = d.longeur_ebrechured;
      document.getElementById('classement_eg').value = d.classement_eg;
      document.getElementById('classement_ed').value = d.classement_ed;
    };
  
    // Charger dates dans le <select>
    const loadDates = async () => {
      try {
        const resp = await fetch('/api/b2v/dates');
        const dates = await resp.json();
        const sel = document.getElementById('dateFilter');
        dates.forEach(r => sel.add(new Option(r.date, r.date)));
      } catch (e) {
        console.error('Erreur dates:', e);
      }
    };
  
    document.getElementById('dateFilter')
      .addEventListener('change', e => fetchB2VData(e.target.value));
  
    loadDates().then(() => {
      const first = document.getElementById('dateFilter').value;
      fetchB2VData(first);
    });
  });
  