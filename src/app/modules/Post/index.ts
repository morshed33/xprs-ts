import { Router } from 'express';
import postRoutes from './post.routes';

export default function postModule(apiRouter: Router) {
    apiRouter.use('/posts', postRoutes());
}
