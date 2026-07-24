import { Router } from 'express';
import { projectsRouter } from './projects';
import { columnsRouter } from './columns';
import { songsRouter } from './songs';
import { tasksRouter } from './tasks';
import { subtasksRouter } from './subtasks';
import { exportRouter } from './export';
import { importRouter } from './import';
import { soundcloudRouter } from './soundcloud';

export const router = Router();

router.use('/projects', projectsRouter);
router.use('/columns', columnsRouter);
router.use('/songs', songsRouter);
router.use('/tasks', tasksRouter);
router.use('/subtasks', subtasksRouter);
router.use('/export', exportRouter);
router.use('/import', importRouter);
router.use('/', soundcloudRouter);
