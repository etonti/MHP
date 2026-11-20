document.addEventListener('DOMContentLoaded', () => {
  const messageList = document.getElementById('messageList');
  const notifBadge = document.getElementById('notifBadge');
  const notifBell = document.getElementById('notifBell');
  const clearBtn = document.getElementById('clearMessages');

  // 1. Récupérer les messages depuis le localStorage
  let messages = JSON.parse(localStorage.getItem('mhp_messages') || '[]');

  // Trier du plus récent au plus ancien
  messages.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 2. Fonction d'affichage
  function renderMessages() {
    messageList.innerHTML = '';

    if (messages.length === 0) {
      messageList.innerHTML = `
        <div class="empty-state">
          <p class="mono">Aucun message pour le moment.</p>
        </div>
      `;
      updateBadge();
      return;
    }

    messages.forEach((msg, index) => {
      const dateObj = new Date(msg.date);
      const dateStr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      const card = document.createElement('div');
      card.className = `msg-card ${msg.read ? '' : 'is-unread'}`;
      card.id = `msg-${msg.id}`; // ID unique pour le scroll
      
      card.innerHTML = `
        <div class="msg-card__header">
          <div class="msg-card__meta">
            <span class="msg-card__name">${msg.name}</span>
            <span class="msg-card__org">${msg.org}</span>
          </div>
          <div class="msg-card__time">
            ${dateStr}<br>${timeStr}
          </div>
        </div>
        
        <div class="msg-card__details">
          <div class="msg-card__detail">
            <span class="mono">Email:</span> <strong><a href="mailto:${msg.email}">${msg.email}</a></strong>
          </div>
          <div class="msg-card__detail">
            <span class="mono">Secteur:</span> <strong>${msg.sector}</strong>
          </div>
        </div>

        <div class="msg-card__body">
          ${msg.msg.replace(/\n/g, '<br>')}
        </div>
      `;

      // Si on clique sur le message, il devient "lu"
      card.addEventListener('click', () => {
        if (!msg.read) {
          msg.read = true;
          saveMessages();
          card.classList.remove('is-unread');
          updateBadge();
        }
      });

      messageList.appendChild(card);
    });

    updateBadge();
  }

  // 3. Mettre à jour la cloche de notification
  function updateBadge() {
    const unreadCount = messages.filter(m => !m.read).length;
    notifBadge.textContent = unreadCount;
    
    if (unreadCount > 0) {
      notifBadge.classList.add('is-active');
      // Faire sonner la cloche
      notifBell.classList.add('is-ringing');
      setTimeout(() => notifBell.classList.remove('is-ringing'), 1000);
    } else {
      notifBadge.classList.remove('is-active');
    }
  }

  // 4. Sauvegarder l'état des messages
  function saveMessages() {
    localStorage.setItem('mhp_messages', JSON.stringify(messages));
  }

  // 5. Clic sur la cloche : aller au premier message non lu
  notifBell.addEventListener('click', () => {
    const firstUnread = messages.find(m => !m.read);
    if (firstUnread) {
      const el = document.getElementById(`msg-${firstUnread.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // On le marque comme lu automatiquement après le scroll
        setTimeout(() => {
          firstUnread.read = true;
          saveMessages();
          el.classList.remove('is-unread');
          updateBadge();
        }, 800);
      }
    } else {
      // S'il n'y a pas de non-lus, on scroll tout en haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // 6. Bouton "Vider" (pour nettoyer pendant les tests)
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment supprimer tous les messages ?')) {
        messages = [];
        saveMessages();
        renderMessages();
      }
    });
  }

  // Initialisation
  renderMessages();
});