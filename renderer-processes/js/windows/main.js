const path = require('path');
// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, ColorMode } = require(path.resolve(__dirname, '../../../officium-modules/Officium'));

const SQL_DRIVER = new MSSQL();
const original_text = 'Insira seu registro';

let password_try = 0;

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
document.getElementById('btn-clear').onclick = () => {
    let registryInput = document.getElementById('input-registry'),
        passwordInput = document.getElementById('input-password');
    registryInput.value = '';
    registryInput.focus();
    passwordInput.value = '';
    passwordInput.style.display = 'none';
}

// Autenticar
document.getElementById('btn-auth').onclick = () => {
    let registry = document.getElementById('input-registry').value,
        password = document.getElementById('input-password').value;

    authenticate(registry, password);
}

function keyPress(ev) {
    if (ev.key == 'Enter') document.getElementById('btn-auth').onclick();
}

document.getElementById('input-registry').addEventListener('keypress', keyPress);
document.getElementById('input-password').addEventListener('keypress', keyPress);

// Autenticar
function authenticate(registry, password) {
    let registryInput = document.getElementById('input-registry'),
        passwordInput = document.getElementById('input-password');
    let worker = [];
    SQL_DRIVER.select(MSSQL.QueryBuilder('Worker', (registry || '0000')), (data) => {
            worker.push(data);
        })
        .then(() => {
            console.log(JSON.stringify(worker, null, '\t'));
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
                                try {
                                    authenticated = authenticated[0]['Autenticado'].value;
                                    if (authenticated === 'TRUE') {
                                        remote.getGlobal('data').worker = worker;
                                        ipc.send('show-worker-screen', 'main');
                                    } else {
                                        if (password_try++ < 3) warning('Senha incorreta!');
                                        else forgot_password();
                                    }
                                } catch (e) {
                                    warning('Você não possui senha!');
                                    remote.getGlobal('data').worker = worker;
                                    ipc.send('show-worker-screen', 'main');
                                }
                            })
                    }
                } else {
                    remote.getGlobal('data').worker = worker;
                    ipc.send('show-worker-screen', 'main');
                }
            } else {
                passwordInput.style.display = 'none';
                registryInput.focus();
                warning('Registro não encontrado!');
            }
        });
}


let delay;

function warning(text) {
    clearTimeout(delay);
    let instruction = document.getElementById('instruction');
    instruction.style.transitionDuration = '1s';
    instruction.classList.remove('text-danger');
    instruction.classList.add('text-warning');
    instruction.textContent = text;
    delay = setTimeout(() => {
        instruction.classList.remove('text-warning');
        instruction.textContent = original_text;
    }, 2000);
}

function forgot_password() {
    clearTimeout(delay);
    let instruction = document.getElementById('instruction');

    instruction.onclick = () => {
        ipc.send('forgot-password');
    };

    instruction.style.transitionDuration = '1s';
    instruction.classList.add('text-danger');
    instruction.textContent = 'Esqueceu sua senha? Clique aqui!';
    instruction.style.cursor = 'pointer';
}

function welcome() {
    let d = new Date().getHours();
    return (d >= 18 ? 'Boa noite!' : d >= 12 ? 'Boa tarde!' : 'Bom dia!');
}