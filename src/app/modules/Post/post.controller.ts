import ApiResponse from "../../../shared/api-handlers/ApiResponse";
import catchAsync from "../../../shared/api-handlers/catchAsync";
import { StatusCodes } from "../../../shared/constants/http-status-code";
import PostService from "./post.service";


class PostController {
    private postService: PostService;

    constructor() {
        this.postService = new PostService();
    }
    createPost = catchAsync(async (req, res) => {
        const post = await this.postService.create(req.body);
        ApiResponse(res, StatusCodes.CREATED, 'Post created successfully', post);
    });
    getAllPosts = catchAsync(async (req, res) => {
        const posts = await this.postService.findAll();
        ApiResponse(res, StatusCodes.OK, 'Posts retrieved successfully', posts);
    });
    getPostById = catchAsync(async (req, res) => {
        const post = await this.postService.getById(req.params.id);
        ApiResponse(res, StatusCodes.OK, 'Post retrieved successfully', post);
    });
    softDeletePost = catchAsync(async (req, res) => {
        const post = await this.postService.softDelete(req.params.id);
        ApiResponse(res, StatusCodes.OK, 'Post deleted successfully', post);
    });
}

export default PostController;