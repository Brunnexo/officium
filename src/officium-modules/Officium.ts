import { remote } from 'electron';
import { Charts } from './Charts';
import { ColorMode } from './ColorMode';
import { WorkerLabor } from './Labor';
import { MSSQL } from './MSSQL';
import { PageLoader } from './PageLoader';
import { WorkerManager } from './Worker Manager';
const SQLConfig = remote.getGlobal('parameters')['sql'].config;

export { ColorMode, MSSQL, PageLoader, Charts, WorkerManager, WorkerLabor, SQLConfig };

