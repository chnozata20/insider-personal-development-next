'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { productService } from '@/lib/services/product';
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
  view: ['ADMIN', 'USER', 'DEMO_USER']
};

export function ProductList() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [userRole, setUserRole] = useState('USER');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    search: '',
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        status: filters.status === 'all' ? '' : filters.status
      };
      const response = await productService.getProducts(params);
      setProducts(response.products);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
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

  const handleDelete = async (productId) => {
    if (window.confirm(t.deleteConfirmation)) {
      try {
      await productService.deleteProduct(productId);
      fetchProducts();
      } catch (error) {
        console.error('Ürün silme hatası:', error);
        
        // Hata mesajını kullanıcıya göster
        let errorMessage = error.message || t.deleteConfirmation;
        
        // API'den gelen hata kodlarını kontrol et
        if (error.message === 'PRODUCT_HAS_ASSIGNED_USERS') {
          errorMessage = t.productHasAssignedUsers;
        } else if (error.message === 'PRODUCT_HAS_WATCHED_INFO') {
          errorMessage = t.productHasWatchedInfo;
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleViewDetails = (productId) => {
    router.push(`/products/info/${productId}`);
  };

  const canPerformAction = (action) => {
    return ACTION_CONFIG[action]?.includes(userRole) || false;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t.products}</CardTitle>
            {canPerformAction('create') && (
              <Button onClick={() => router.push('/products/create')} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t.newProduct}
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
                  placeholder={t.search}
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc">{t.nameAsc}</SelectItem>
                    <SelectItem value="name_desc">{t.nameDesc}</SelectItem>
                    <SelectItem value="createdAt_desc">{t.newest}</SelectItem>
                    <SelectItem value="createdAt_asc">{t.oldest}</SelectItem>
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
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.description}</TableHead>
                    <TableHead>{t.features}</TableHead>
                    <TableHead>InfoTypes</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.createdAt}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        {t.loading}
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        {t.noProductsFound}
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.features.map((feature, index) => (
                              <Badge key={index} variant="secondary">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.productInfoTypes?.map((infoType, index) => (
                              <Badge key={index} variant="outline">
                                {infoType.infoType} (max: {infoType.maxCount})
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "success" : "destructive"}>
                            {product.isActive ? t.active : t.inactive}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canPerformAction('edit') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/products/edit/${product.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canPerformAction('view') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(product.id)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            )}
                            {canPerformAction('delete') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
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
              {loading ? (
                <div className="p-4 text-center">{t.loading}</div>
              ) : products.length === 0 ? (
                <div className="p-4 text-center">{t.noProductsFound}</div>
              ) : (
                <div className="divide-y">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                        </div>
                        <Badge variant={product.isActive ? "success" : "destructive"}>
                          {product.isActive ? t.active : t.inactive}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {product.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {canPerformAction('edit') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/products/edit/${product.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canPerformAction('view') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(product.id)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {canPerformAction('delete') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(product.id)}
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

          {!loading && pagination.totalPages > 1 && (
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