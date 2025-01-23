import { Router } from 'express';
import UserController from './user.controller';

export default function userRoutes() {
    const router = Router();
    const controller = new UserController();
    router.post('/', controller.createUser);
    router.get('/', controller.getAllUsers);
    router.delete('/:id', controller.softDeleteUser);
    return router;
}
