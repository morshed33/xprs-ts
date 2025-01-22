import { Router } from 'express';
import userRoutes from './user.routes';

export default function userModule(apiRouter: Router) {
    apiRouter.use('/users', userRoutes());
}
