const fs = require('fs');
const sql = require('tedious');

var SQL_VARIABLE = '@VAR';

module.exports.queryBuilder = function(sql, ...args) {
    let query = fs.readFileSync(`${__dirname}/SQL/${sql}.sql`, 'utf-8');
    let varCount = Number(query.split(SQL_VARIABLE).length - 1);

    if (varCount != args.length) {
        throw new Error(`The number of arguments does not match the SQL's necessary variables count!
        Number of arguments: ${args.length}
        Number of SQL variables: ${varCount}`);
    } else {
        if (varCount == 0) {
            return query;
        } else {
            for (i = 0; i < varCount; i++) {
                query = query.replace(`${SQL_VARIABLE}${i}`, args[i]);
            }
            return query;
        }
    }
};

module.exports.setSqlVariable = function(arg) {
    if (typeof(arg) == 'string') {
        SQL_VARIABLE = arg;
    } else {
        throw new Error('The SQL Variable must be a String sequencer! Example "@VAR" for @VAR0, @VAR1...');
    }
}

module.exports.MSSQL = class {
    constructor(config = {
        server: '127.0.0.1',
        authentication: {
            type: 'default',
            options: {
                userName: 'sa',
                password: 'sa'
            }
        },
        options: {
            encrypt: false,
            database: 'db',
            enableArithAbort: true,
            appName: 'appName',
            useColumnNames: true
        }
    }) {
        if (typeof(config) != 'object') {
            throw new Error(`SQL 'Tedious' configuration not defined! (${typeof(config)})`);
        } else {
            this.objects = {
                Configurations: config,
            };
        }
    };

    async connect() {
        let objects = this.objects;

        return new Promise((resolve, reject) => {
            if (!objects.Connected) {
                objects.Connection = new sql.Connection(objects.Configurations);
                objects.Connection.on('connect', function(err) {
                    if (err) {
                        reject(err.message);
                    } else {
                        objects.Connected = true;
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
        });
    };

    async select(query, row) {
        await this.connect();
        let Connection = this.objects.Connection;

        return new Promise((resolve, reject) => {
            Connection.execSql(
                new sql.Request(query, function(err) {
                    if (err) {
                        throw new Error(`${err.message}`);
                    }
                }).on('row', function(data) {
                    row(data);
                }).on('requestCompleted', function() {
                    resolve(true);
                }).on('error', function(err) {
                    reject(err);
                })
            );
        });
    };

    async execute(query) {
        await this.connect();
        let Connection = this.objects.Connection;

        return new Promise((resolve, reject) => {
            Connection.execSql(
                new sql.Request(query, function(err) {
                    if (err) {
                        reject(err.message);
                    }
                }).on('requestCompleted', function() {
                    resolve();
                })
            )
        });
    };
};