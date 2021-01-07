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

function input_validate(ev) {
    let elmnt = ev.target;
    if (elmnt.value == '') elmnt.classList.add('is-invalid');
    else elmnt.classList.remove('is-invalid');
    validate_fields();
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
    validate_fields();
}

function validate_fields() {
    let input_new_password = document.getElementById('input-new-password'),
        input_confirm_password = document.getElementById('input-confirm-password'),
        input_registry = document.getElementById('input-registry'),
        input_name = document.getElementById('input-name');

    let password_match = (input_new_password.value === input_confirm_password.value),
        passwords_not_empty = (input_new_password.value.trim().length > 0 && input_confirm_password.value.trim().length > 0),
        not_empty_fields = (input_registry.value.trim().length > 0 && input_name.value.trim().length > 0);

    let btn_save = document.getElementById('btn-save');

    if (password_match && not_empty_fields && passwords_not_empty) {
        btn_save.removeAttribute('disabled');
        btn_save.onclick = save_password;
    } else {
        btn_save.setAttribute('disabled', '');
        btn_save.onclick = (ev) => {};
    }
}

document.getElementById('btn-cancel').onclick = () => {
    remote.getCurrentWindow().close();
};

function save_password(ev) {
    ev.preventDefault();
    let input_confirm_password = document.getElementById('input-confirm-password'),
        input_registry = document.getElementById('input-registry'),
        input_name = document.getElementById('input-name');

    let elmnt = ev.target;
    let updated = false;
    // document.getElementById()
    if (!elmnt.hasAttribute('disabled')) {
        SQL_DRIVER.execute(MSSQL.QueryBuilder('UpdatePassword', input_registry.value, input_name.value, input_confirm_password.value), (data) => {
            updated = (updated || (data['Atualizado'].value == 'TRUE'));
        }).then(() => {
            show_dialog(updated);
        }).catch((e) => {
            show_dialog(false, e);
        });
    }
}

function show_dialog(updated, err) {
    if (updated) {
        ipc.send('show-dialog', {
            title: 'Não se esqueça agora!',
            type: 'info',
            content: `Sua nova senha foi salva!`
        });
        ipc.once('dialog-reply', (evt, arg) => { remote.getCurrentWindow().close() });
    } else {
        ipc.send('show-dialog', {
                    title: 'Opa!',
                    type: 'info',
                    content: `Problema ao atualizar a senha! As informações estão corretas? Lembre-se: o nome e o registro precisam coincidir com os dados salvos!
            ${typeof(err) !== 'undefined' ? `Erro: [${err}]` : ''}`
        });
    }
}