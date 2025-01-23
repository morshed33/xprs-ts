import ApiResponse from "../../../shared/api-handlers/ApiResponse";
import catchAsync from "../../../shared/api-handlers/catchAsync";
import { StatusCodes } from "../../../shared/constants/http-status-code";
import UserService from "./user.service";


class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }
    createUser = catchAsync(async (req, res) => {
        const user = await this.userService.create(req.body);
        ApiResponse(res, StatusCodes.CREATED, 'User created successfully', user);
    });
    getAllUsers = catchAsync(async (req, res) => {
        const users = await this.userService.findAll();
        ApiResponse(res, StatusCodes.OK, 'Users retrieved successfully', users);
    });
    softDeleteUser = catchAsync(async (req, res) => {
        const user = await this.userService.softDelete(req.params.id);
        ApiResponse(res, StatusCodes.OK, 'User deleted successfully', user);
    });
}

export default UserController;