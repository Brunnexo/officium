const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { ColorMode, MSSQL } = require('../../../officium-modules/Officium');

const SQL_DRIVER = new MSSQL();

window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));

    let input_registry = document.getElementById('input-registry'),
        input_name = document.getElementById('input-name'),
        input_confirm_password = document.getElementById('input-confirm-password');

    input_registry.onblur =
        input_name.onblur =
        input_validate;

    input_confirm_password.onblur = password_validate;

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });
}

document.getElementById('btn-cancel').onclick = () => {
    remote.getCurrentWindow().close();
};

async function updatePassword() {

}

function input_validate(ev) {
    let elmnt = ev.target;
    if (elmnt.value == '') elmnt.classList.add('is-invalid');
    else elmnt.classList.remove('is-invalid');
}

function password_validate(ev) {
    let input_new_password = document.getElementById('input-new-password'),
        input_confirm_password = document.getElementById('input-confirm-password');

    if (input_new_password.value === input_confirm_password.value) {
        input_confirm_password.classList.add('is-valid');
        input_confirm_password.classList.remove('is-invalid');
    } else {
        input_confirm_password.classList.add('is-invalid');
        input_confirm_password.classList.remove('is-valid');
    }
}

function enable_save_btn() {
    let btn_save = document.getElementById('btn-save');

}