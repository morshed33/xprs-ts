import { Router } from 'express';
import PostController from './post.controller';

export default function postRoutes() {
    const router = Router();
    const controller = new PostController();
    router.post('/', controller.createPost);
    router.get('/', controller.getAllPosts);
    router.get('/:id', controller.getPostById);
    return router;
}
