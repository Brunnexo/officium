"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Render = void 0;
const electron_1 = require("electron");
const Officium_1 = require("./Officium");
const Menu = electron_1.remote.Menu;
const MenuItem = electron_1.remote.MenuItem;
const borderColor = 'rgba(255, 255, 255, 0.5)';
class Render {
    static updateInfo(info) {
        Object.keys(info).forEach((d) => {
            Render[d] = info[d];
        });
    }
    static resume(date) {
        return __awaiter(this, void 0, void 0, function* () {
            let SQL = Render.SQL_DRIVER, info = Render.info, data = Render.data;
            data = [];
            yield SQL.select(Officium_1.MSSQL.QueryBuilder('History', info.registry, date), (row) => {
                data.push(row);
            }).then(() => {
                data.forEach((d) => {
                });
            });
        });
    }
    static timeRemain() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.Render = Render;
