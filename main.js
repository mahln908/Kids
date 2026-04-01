function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 11) {
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
        valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
        input.value = valor;
    }
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function mostrarMensagem(elementoId, mensagem, tipo) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensagem;
        elemento.className = `mensagem ${tipo}`;
        elemento.style.display = 'block';
        setTimeout(() => {
            elemento.style.display = 'none';
        }, 5000);
    }
}

function carregarVagas() {
    const vagasContainer = document.getElementById('vagas-lista');
    if (vagasContainer) {
        const vagas = JSON.parse(localStorage.getItem('vagas') || '[]');
        vagasContainer.innerHTML = '';
        
        const vagasRecentes = vagas.slice(-3).reverse();
        
        vagasRecentes.forEach(vaga => {
            const div = document.createElement('div');
            div.className = 'vaga-item';
            div.innerHTML = `
                <h3>${vaga.titulo}</h3>
                <div class="vaga-empresa">${vaga.nomeEmpresa}</div>
                <div class="vaga-local">📍 ${vaga.cidade}</div>
                <div class="vaga-contato">
                    📞 ${vaga.telefoneContato}<br>
                    📧 ${vaga.emailContato}
                </div>
                <a href="cadastro.html" class="btn-candidatar">Candidatar-se</a>
            `;
            vagasContainer.appendChild(div);
        });
        
        if (vagasRecentes.length === 0) {
            vagasContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Nenhuma vaga cadastrada ainda.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    carregarVagas();
    
    const urlParams = new URLSearchParams(window.location.search);
    const tipoUsuario = urlParams.get('tipo');
    
    if (tipoUsuario && window.location.pathname.includes('cadastro.html')) {
        const radioEmpregador = document.getElementById('tipo-empregador');
        if (radioEmpregador) {
            radioEmpregador.checked = true;
            const camposEmpresa = document.getElementById('campos-empresa');
            if (camposEmpresa) {
                camposEmpresa.style.display = 'block';
            }
        }
    }
    
    const radioEmpregador = document.getElementById('tipo-empregador');
    const radioCandidato = document.getElementById('tipo-candidato');
    
    if (radioEmpregador && radioCandidato) {
        radioEmpregador.addEventListener('change', function() {
            const camposEmpresa = document.getElementById('campos-empresa');
            if (camposEmpresa) {
                camposEmpresa.style.display = this.checked ? 'block' : 'none';
            }
        });
        
        radioCandidato.addEventListener('change', function() {
            const camposEmpresa = document.getElementById('campos-empresa');
            if (camposEmpresa) {
                camposEmpresa.style.display = 'none';
            }
        });
    }
});

window.formatarTelefone = formatarTelefone;
window.validarEmail = validarEmail;
window.mostrarMensagem = mostrarMensagem;
