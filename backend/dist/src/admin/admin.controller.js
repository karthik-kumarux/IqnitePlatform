"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const admin_service_1 = require("./admin.service");
const create_admin_user_dto_1 = require("./dto/create-admin-user.dto");
const update_user_role_dto_1 = require("./dto/update-user-role.dto");
const update_user_status_dto_1 = require("./dto/update-user-status.dto");
const pagination_query_dto_1 = require("./dto/pagination-query.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getSystemStats() {
        return this.adminService.getSystemStats();
    }
    getAllUsers(query, search, role, isActive) {
        const hasFilters = (search && search.trim()) || (role && role.trim()) || (isActive && isActive.trim());
        if (hasFilters) {
            const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
            const cleanSearch = search?.trim() || '';
            const cleanRole = role?.trim() || '';
            return this.adminService.searchUsers(cleanSearch, cleanRole || undefined, isActiveBool, query.page, query.limit);
        }
        return this.adminService.getAllUsers(query.page, query.limit);
    }
    getUserDetails(id) {
        return this.adminService.getUserDetails(id);
    }
    createUser(createUserDto) {
        return this.adminService.createUser(createUserDto);
    }
    deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    updateUserRole(id, updateRoleDto) {
        return this.adminService.updateUserRole(id, updateRoleDto.role);
    }
    updateUserStatus(id, updateStatusDto) {
        return this.adminService.updateUserStatus(id, updateStatusDto.isActive);
    }
    bulkUpdateUserRole(userIds, role) {
        return this.adminService.bulkUpdateUserRole(userIds, role);
    }
    bulkUpdateUserStatus(userIds, isActive) {
        return this.adminService.bulkUpdateUserStatus(userIds, isActive);
    }
    getAllQuizzes(page, limit) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;
        return this.adminService.getAllQuizzes(pageNum, limitNum);
    }
    getRecentActivity(limit) {
        const limitNum = limit ? parseInt(limit) : 50;
        return this.adminService.getRecentActivity(limitNum);
    }
    getAdvancedAnalytics() {
        return this.adminService.getAdvancedAnalytics();
    }
    getAuditLogs(query) {
        return this.adminService.getAuditLogs(query.page, query.limit);
    }
    deleteQuiz(id, adminId) {
        return this.adminService.deleteQuiz(id, adminId);
    }
    transferQuizOwnership(quizId, newOrganizerId, adminId) {
        return this.adminService.transferQuizOwnership(quizId, newOrganizerId, adminId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSystemStats", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserDetails", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_user_dto_1.CreateAdminUserDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_role_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Post)('users/bulk/role'),
    __param(0, (0, common_1.Body)('userIds')),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bulkUpdateUserRole", null);
__decorate([
    (0, common_1.Post)('users/bulk/status'),
    __param(0, (0, common_1.Body)('userIds')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Boolean]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bulkUpdateUserStatus", null);
__decorate([
    (0, common_1.Get)('quizzes'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllQuizzes", null);
__decorate([
    (0, common_1.Get)('recent-activity'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAdvancedAnalytics", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Delete)('quizzes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('adminId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteQuiz", null);
__decorate([
    (0, common_1.Post)('quizzes/:id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newOrganizerId')),
    __param(2, (0, common_1.Body)('adminId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "transferQuizOwnership", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map