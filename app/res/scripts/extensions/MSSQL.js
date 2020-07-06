const sql = require('tedious');



// Classes do SQL
var Connection = sql.Connection;
var Request = sql.Request;

// Interface de tipos de dados
var TYPES = sql.TYPES;

// Conexão do SQL
var connection;

function connectSQL(callback) {
    connection = new Connection({
        server: '127.0.0.1', //update me
        authentication: {
            type: 'default',
            options: {
                userName: 'SAT_LOGON', //update me
                password: 'pAcMaN2@' //update me
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: false,
            database: 'SAT', //update me
            enableArithAbort: true,
            appName: 'SAT',
            useColumnNames: true
        }
    })

    connection.on('connect', function(err) {
        if (err) {
            console.log("[MSSQL]: Erro de conexão!");
            console.log("[MSSQL]: " + err.message);
            callback(true);
        } else {
            console.log("[MSSQL]: Conectado!");
            callback(connection);
        }
    });
}

function selectSQL(sql, callback) {
    var resultJSON = [];
    connection.execSql(
        new Request(sql, function(err) {
            if (err) {
                console.log("[MSSQL]: Erro no SQL");
                console.log("[MSSQL]: " + err.message);
            }
        }).on('row', function(columns) {
            resultJSON.push(columns);
        }).on('requestCompleted', function() {
            callback(resultJSON);
        })
    );
    // connection.execSql(request);
}

function executeSQL(SQL, callback) {
    connection.execSql(
        new Request(SQL, function(err) {
            if (err) {
                console.log("[MSSQL]: Erro no SQL");
                console.log("[MSSQL]: " + err.message);
            }
        }).on('requestCompleted', function() {
            callback();
        })
    );
}

module.exports = {
    executeSQL,
    selectSQL,
    connectSQL
};