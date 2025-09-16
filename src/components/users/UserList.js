'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { userService } from '@/lib/services/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ChevronLeft, ChevronRight, Info, Trash2, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { decodeToken } from '@/lib/utils/token';

// Action butonlarının yetkilendirme konfigürasyonu
const ACTION_CONFIG = {
  create: ['ADMIN'],
  edit: ['ADMIN'],
  delete: ['ADMIN'],
  view: ['ADMIN']
};

export function UserList() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt_desc'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = decodeToken(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Token decode error:', error);
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        ...filters,
        role: filters.role === 'all' ? '' : filters.role,
        status: filters.status === 'all' ? '' : filters.status
      };
      const response = await userService.getUsers(params);
      setUsers(response.users);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleRoleChange = (value) => {
    setFilters(prev => ({ ...prev, role: value, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t.deleteConfirmation)) {
      await userService.deleteUser(userId);
      fetchUsers();
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'DEMO_USER':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getRoleTranslation = (role) => {
    switch (role) {
      case 'ADMIN':
        return t.userRoleAdmin;
      case 'DEMO_USER':
        return t.userRoleDemo;
      default:
        return t.userRoleUser;
    }
  };

  const canPerformAction = (action) => {
    return ACTION_CONFIG[action]?.includes(userRole) || false;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t.usersTitle}</CardTitle>
            {canPerformAction('create') && (
              <Button onClick={() => router.push('/users/create')} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t.createUserButton}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.userSearchPlaceholder}
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filters.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.userRoleFilter} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.userAllRoles}</SelectItem>
                    <SelectItem value="USER">{t.userRoleUser}</SelectItem>
                    <SelectItem value="ADMIN">{t.userRoleAdmin}</SelectItem>
                    <SelectItem value="DEMO_USER">{t.userRoleDemo}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.userStatusFilter} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.userAllStatus}</SelectItem>
                    <SelectItem value="active">{t.userActiveStatus}</SelectItem>
                    <SelectItem value="inactive">{t.userInactiveStatus}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.userSortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc">{t.userNameAsc}</SelectItem>
                    <SelectItem value="name_desc">{t.userNameDesc}</SelectItem>
                    <SelectItem value="createdAt_desc">{t.userNewest}</SelectItem>
                    <SelectItem value="createdAt_asc">{t.userOldest}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.userName}</TableHead>
                    <TableHead>{t.userEmail}</TableHead>
                    <TableHead>{t.userRole}</TableHead>
                    <TableHead>{t.userStatus}</TableHead>
                    <TableHead>{t.userCreatedAt}</TableHead>
                    <TableHead>{t.userActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        {t.loading}
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        {t.noUsersFound}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleTranslation(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "success" : "destructive"}>
                            {user.isActive ? t.userActive : t.userInactive}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canPerformAction('edit') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/users/edit/${user.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canPerformAction('view') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/users/info/${user.id}`)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            )}
                            {canPerformAction('delete') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobil görünüm */}
            <div className="md:hidden">
              {isLoading ? (
                <div className="p-4 text-center">{t.loading}</div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center">{t.noUsersFound}</div>
              ) : (
                <div className="divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                        </div>
                        <Badge variant={user.isActive ? "success" : "destructive"}>
                          {user.isActive ? t.userActive : t.userInactive}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleTranslation(user.role)}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {canPerformAction('edit') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/users/edit/${user.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canPerformAction('view') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/users/info/${user.id}`)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {canPerformAction('delete') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                {t.showing} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t.of} {pagination.total} {t.items}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {t.page} {pagination.page} {t.of} {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 