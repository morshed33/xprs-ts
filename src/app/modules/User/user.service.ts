import { PrismaClient, User, Prisma } from '@prisma/client';
import GenericService from '../../../shared/utils/GenericService';
import prisma from '../../../shared/prisma';


type UserCreateInput = Prisma.UserCreateInput;


class UserService extends GenericService<User, UserCreateInput, Prisma.UserWhereInput> {
    constructor() {
        super(prisma.user);
    }

    async getByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({ where: { email } });
    }
}

export default UserService;
