document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var status = params.get('status');

  if (!status) return;

  var waiting = document.getElementById('state-waiting');
  var success = document.getElementById('state-success');
  var error = document.getElementById('state-error');

  if (status === 'success' && waiting && success) {
    waiting.style.display = 'none';
    success.style.display = 'block';
    var userEl = document.getElementById('username');
    if (userEl) userEl.textContent = decodeURIComponent(params.get('user') || 'Usuário');
  } else if (status === 'error' && waiting && error) {
    waiting.style.display = 'none';
    error.style.display = 'block';
    var msg = params.get('msg');
    var messages = {
      auth_denied: 'Você cancelou a autenticação. Tente novamente quando estiver pronto.',
      invalid_state: 'Sessão expirada ou inválida. Por favor, tente novamente.',
      server_error: 'Erro interno do servidor. Tente novamente mais tarde.',
    };
    var errorEl = document.getElementById('error-msg');
    if (errorEl) errorEl.textContent = messages[msg] || 'Ocorreu um erro inesperado.';
  }

  window.history.replaceState({}, '', '/');
});
