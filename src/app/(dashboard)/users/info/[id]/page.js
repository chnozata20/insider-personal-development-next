'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { userService } from '@/lib/services/user';
import { productService } from '@/lib/services/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { use } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { decodeToken } from '@/lib/utils/token';

export default function UserDetailPage({ params }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [user, setUser] = useState(null);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningProduct, setAssigningProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const userId = use(params).id;

  // Kullanıcı rolünü al
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

  // Admin yetkisi kontrolü
  const isAdmin = userRole === 'ADMIN';

  const fetchData = async () => {
      try {
      setLoading(true);
      const [userData, productsData, assignedProductsData] = await Promise.all([
        userService.getUser(userId),
        productService.getProducts({ limit: 100 }),
        userService.getUserProducts(userId, { limit: 100 })
      ]);

      setUser(userData);
      setAvailableProducts(productsData.products || []);
      setAssignedProducts(assignedProductsData.products || []);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAssignProduct = async () => {
    if (!selectedProductId) return;

    try {
      setAssigningProduct(true);
      await userService.assignProduct(userId, selectedProductId);
      await fetchData(); // Verileri yeniden yükle
      setIsAssignModalOpen(false);
      setSelectedProductId('');
    } catch (error) {
      console.error('Ürün atama hatası:', error);
    } finally {
      setAssigningProduct(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!confirm(t.removeProductConfirmation)) return;

    try {
      await userService.removeProduct(userId, productId);
      await fetchData(); // Verileri yeniden yükle
    } catch (error) {
      console.error('Ürün kaldırma hatası:', error);
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

  // Atanmamış ürünleri filtrele
  const unassignedProducts = availableProducts.filter(product => 
    !assignedProducts.some(assigned => assigned.id === product.id)
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p>{t.loading}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p>{t.userNotFound}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.userDetails}</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push('/users')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToUsers}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.userName}</h3>
            <p className="text-muted-foreground">{user.name}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.userEmail}</h3>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.userRole}</h3>
            <Badge className={getRoleBadgeColor(user.role)}>
              {getRoleTranslation(user.role)}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.userStatus}</h3>
            <Badge variant={user.isActive ? "success" : "destructive"}>
              {user.isActive ? t.userActive : t.userInactive}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.userCreatedAt}</h3>
            <p className="text-muted-foreground">{formatDate(user.createdAt)}</p>
          </div>

          {/* Atanan Ürünler Bölümü */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.assignedProducts}</h3>
              {isAdmin && (
                <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t.assignProduct}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.assignProductToUser}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.selectProduct}</label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectProductPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAssignModalOpen(false)}
                        >
                          {t.cancel}
                        </Button>
                        <Button
                          onClick={handleAssignProduct}
                          disabled={!selectedProductId || assigningProduct}
                        >
                          {assigningProduct ? t.assigning : t.assignProduct}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {assignedProducts.length === 0 ? (
                <p className="text-muted-foreground">{t.noProductsAssigned}</p>
              ) : (
                assignedProducts.map((product) => (
                  <Badge key={product.id} variant="secondary" className="flex items-center gap-2">
                    {product.name}
                    {isAdmin && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveProduct(product.id)}
                      />
                    )}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 