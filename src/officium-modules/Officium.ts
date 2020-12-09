import { remote } from 'electron';
import { RenderResume, RenderSR } from './ChartsRender';
import { ColorMode } from './ColorMode';
import { WorkerLabor } from './Labor';
import { MSSQL } from './MSSQL';
import { PageLoader } from './PageLoader';

const SQLConfig = remote.getGlobal('parameters')['sql'].config;

export { ColorMode, MSSQL, PageLoader, RenderResume, RenderSR, WorkerLabor, SQLConfig };

