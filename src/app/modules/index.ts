import { Router } from 'express';
import userModule from './User';
import postModule from './Post';

export default function loadAllModules(apiRouter: Router) {
    userModule(apiRouter);
    postModule(apiRouter);
}
