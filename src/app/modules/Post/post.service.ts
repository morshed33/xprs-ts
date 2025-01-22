import { Post, Prisma } from '@prisma/client';
import GenericService from '../../../shared/utils/GenericService';
import prisma from '../../../shared/prisma';


type PostCreateInput = Prisma.PostCreateInput;


class PostService extends GenericService<Post, PostCreateInput, Prisma.PostWhereInput> {
    constructor() {
        super(prisma.post);
    }
}

export default PostService;
