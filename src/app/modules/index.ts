import { Router } from 'express';
import userModule from './User';

export default function loadAllModules(apiRouter: Router) {
    userModule(apiRouter);
}
