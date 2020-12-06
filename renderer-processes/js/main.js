// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, ColorMode } = require('../../officium-modules/officium');

const SQL_DRIVER = new MSSQL(remote.getGlobal('parameters')['sql'].config);

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
    SQL_DRIVER.select(MSSQL.QueryBuilder('Registry', registry), (data) => {
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
                                    ipc.send('open-workerScreen');
                                } else {
                                    warning('Senha incorreta!');
                                }
                            })
                    }
                } else {
                    remote.getGlobal('data').worker = worker;
                    ipc.send('open-workerScreen');
                }
            } else {
                passwordInput.style.display = 'none';
                registryInput.focus();
                warning('Registro não encontrado!');
            }
        });
}

function warning(sel) {
    let text = document.getElementById('instruction').textContent,
        instruction = document.getElementById('instruction');
    instruction.style = {
        display: 'none',
        transitionDuration: '500ms'
    };
    instruction.classList.add('text-danger');
    instruction.textContent = sel;
    instruction.style = {
        display: 'unset',
        opacity: '0'
    };
    instruction.style.opacity = '1';

    clearTimeout(this.delay);
    this.delay = setTimeout(() => {
        instruction.style.display = 'none';
        instruction.classList.remove('text-danger');
        instruction.textContent = text;
        instruction.style = {
            display: 'unset',
            opacity: '0'
        };
        instruction.style.opacity = '1';
    }, 3000);
    instruction.style.transitionDuration = '0s';
}

function welcome() {
    let d = new Date().getHours();
    return (d >= 18 ? 'Boa noite!' : d >= 12 ? 'Boa tarde!' : 'Bom dia!');
}