// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, ColorMode } = require('../../../officium-modules/officium');

const SQL_DRIVER = new MSSQL();

const original_text = 'Insira seu registro';

// Página pronta
window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));
    document.getElementById('welcome').textContent = welcome();
    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });
}

// Processo inter-comunicação
ipc.on('adm-password-require', () => {
    let passwordInput = document.getElementById('input-password');
    passwordInput.style.display = 'unset';
    passwordInput.focus();
    warning('Insira a senha');
});

// Botões
// Fechar
document.querySelector('.close-btn').parentElement.onclick = () => {
    remote.getCurrentWindow().close();
}

// Limpar campos
document.getElementById('btnClear').onclick = () => {
    let registryInput = document.getElementById('input-registry'),
        passwordInput = document.getElementById('input-password');
    registryInput.value = '';
    registryInput.focus();
    passwordInput.value = '';
    passwordInput.style.display = 'none';
}

// Autenticar
document.getElementById('btnAuth').onclick = () => {
    let registry = document.getElementById('input-registry').value,
        password = document.getElementById('input-password').value;

    authenticate(registry, password);
}

function keyPress(ev) {
    if (ev.key == 'Enter') document.getElementById('btnAuth').onclick();
}

document.getElementById('input-registry').addEventListener('keypress', keyPress);
document.getElementById('input-password').addEventListener('keypress', keyPress);

// Autenticar
function authenticate(registry, password) {
    let registryInput = document.getElementById('input-registry'),
        passwordInput = document.getElementById('input-password');
    let worker = [];
    SQL_DRIVER.select(MSSQL.QueryBuilder('Worker', registry), (data) => {
            worker.push(data);
        })
        .then(() => {
            if (Object.keys(worker).length > 0) {
                worker = worker[0];
                let functions = worker['Funções'].value;
                if (functions.includes('A')) {
                    if (password == '') {
                        passwordInput.style.display = 'unset';
                        passwordInput.focus();
                        warning('Digite sua senha!');
                    } else {
                        let authenticated = [];
                        SQL_DRIVER.select(MSSQL.QueryBuilder('Authenticate', password, registry), (data) => {
                                authenticated.push(data);
                            })
                            .then(() => {
                                authenticated = authenticated[0]['Autenticado'].value;
                                if (authenticated === 'TRUE') {
                                    remote.getGlobal('data').worker = worker;
                                    ipc.send('open-worker-screen');
                                } else {
                                    warning('Senha incorreta!');
                                }
                            })
                    }
                } else {
                    remote.getGlobal('data').worker = worker;
                    ipc.send('open-worker-screen');
                }
            } else {
                passwordInput.style.display = 'none';
                registryInput.focus();
                warning('Registro não encontrado!');
            }
        });
}

function warning(text) {
    clearTimeout(this.delay);
    let instruction = document.getElementById('instruction');
    instruction.style.transitionDuration = '1s';
    instruction.classList.add('text-warning');
    instruction.textContent = text;
    this.delay = setTimeout(() => {
        instruction.classList.remove('text-warning');
        instruction.textContent = original_text;
    }, 2000);
}

function welcome() {
    let d = new Date().getHours();
    return (d >= 18 ? 'Boa noite!' : d >= 12 ? 'Boa tarde!' : 'Bom dia!');
}