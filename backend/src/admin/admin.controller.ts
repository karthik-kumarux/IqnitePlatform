import { Controller, Get, Post, Delete, UseGuards, Query, Patch, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  getAllUsers(@Query() query: PaginationQueryDto, @Query('search') search?: string, @Query('role') role?: string, @Query('isActive') isActive?: string) {
    // Only use search if there's actual search criteria
    const hasFilters = (search && search.trim()) || (role && role.trim()) || (isActive && isActive.trim());
    
    if (hasFilters) {
      const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
      const cleanSearch = search?.trim() || '';
      const cleanRole = role?.trim() || '';
      return this.adminService.searchUsers(cleanSearch, cleanRole || undefined, isActiveBool, query.page, query.limit);
    }
    return this.adminService.getAllUsers(query.page, query.limit);
  }

  @Get('users/:id')
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateAdminUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() updateRoleDto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, updateRoleDto.role);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, updateStatusDto.isActive);
  }

  @Post('users/bulk/role')
  bulkUpdateUserRole(@Body('userIds') userIds: string[], @Body('role') role: string) {
    return this.adminService.bulkUpdateUserRole(userIds, role);
  }

  @Post('users/bulk/status')
  bulkUpdateUserStatus(@Body('userIds') userIds: string[], @Body('isActive') isActive: boolean) {
    return this.adminService.bulkUpdateUserStatus(userIds, isActive);
  }

  @Get('quizzes')
  getAllQuizzes(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.adminService.getAllQuizzes(pageNum, limitNum);
  }

  @Get('recent-activity')
  getRecentActivity(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.adminService.getRecentActivity(limitNum);
  }

  @Get('analytics')
  getAdvancedAnalytics() {
    return this.adminService.getAdvancedAnalytics();
  }

  @Get('audit-logs')
  getAuditLogs(@Query() query: PaginationQueryDto) {
    return this.adminService.getAuditLogs(query.page, query.limit);
  }

  @Delete('quizzes/:id')
  deleteQuiz(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.adminService.deleteQuiz(id, adminId);
  }

  @Post('quizzes/:id/transfer')
  transferQuizOwnership(
    @Param('id') quizId: string,
    @Body('newOrganizerId') newOrganizerId: string,
    @Body('adminId') adminId: string,
  ) {
    return this.adminService.transferQuizOwnership(quizId, newOrganizerId, adminId);
  }
}
