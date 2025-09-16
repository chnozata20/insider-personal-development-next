'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { productService } from '@/lib/services/product';
import { userService } from '@/lib/services/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { use } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { decodeToken } from '@/lib/utils/token';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ProductInfoPage({ params }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [product, setProduct] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const productId = use(params).id;

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
      const [productData, usersData, assignedUsersData] = await Promise.all([
        productService.getProduct(productId),
        userService.getUsers({ limit: 100 }),
        productService.getProductUsers(productId, { limit: 100 })
      ]);

      setProduct(productData);
      setAvailableUsers(usersData.users || []);
      setAssignedUsers(assignedUsersData.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId, router]);

  const handleAssignUser = async () => {
    if (!selectedUserId) return;

    try {
      setAssigningUser(true);
      await userService.assignProduct(selectedUserId, productId);
      await fetchData(); // Verileri yeniden yükle
      setIsAssignModalOpen(false);
      setSelectedUserId('');
    } finally {
      setAssigningUser(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm(t.removeUserConfirmation)) return;


    await userService.removeProduct(userId, productId);
    await fetchData(); // Verileri yeniden yükle

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

  // Atanmamış kullanıcıları filtrele
  const unassignedUsers = availableUsers.filter(user => 
    !assignedUsers.some(assigned => assigned.id === user.id)
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

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p>{t.productNotFound}</p>
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
            <CardTitle>{t.productDetails}</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToProducts}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <p className="text-muted-foreground">{product.name}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.description}</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.features}</h3>
            <div className="flex flex-wrap gap-2">
              {product.features.map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.supportedInfoTypes}</h3>
            <div className="flex flex-wrap gap-2">
              {product.productInfoTypes?.map((infoType, index) => (
                <Badge key={index} variant="outline">
                  {infoType.infoType} (Maksimum: {infoType.maxCount})
                </Badge>
              ))}
              {(!product.productInfoTypes || product.productInfoTypes.length === 0) && (
                <p className="text-muted-foreground">{t.noInfoTypesDefined}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.status}</h3>
            <Badge variant={product.isActive ? "success" : "destructive"}>
              {product.isActive ? t.active : t.inactive}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.createdAt}</h3>
            <p className="text-muted-foreground">{formatDate(product.createdAt)}</p>
          </div>

          {/* Atanan Kullanıcılar Bölümü */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.assignedUsers}</h3>
              {isAdmin && (
                <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t.assignUser}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.assignUserToProduct}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.selectUser}</label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectUserPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.email})
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
                          onClick={handleAssignUser}
                          disabled={!selectedUserId || assigningUser}
                        >
                          {assigningUser ? t.assigning : t.assignUser}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {assignedUsers.length === 0 ? (
                <p className="text-muted-foreground">{t.noUsersAssigned}</p>
              ) : (
                assignedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs opacity-70">{user.email}</span>
                    </div>
                    {isAdmin && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveUser(user.id)}
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