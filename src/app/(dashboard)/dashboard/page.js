'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = translations[language];

  // MOCK DATA
  const stats = {
    totalProducts: 12,
    activeProducts: 8,
    inactiveProducts: 4,
    recentProducts: [
      {
        id: 1,
        name: 'Firewall Pro',
        description: 'Kurumsal güvenlik duvarı çözümü',
        isActive: true,
        createdAt: '2024-06-01T10:00:00Z'
      },
      {
        id: 2,
        name: 'Antivirüs X',
        description: 'Gelişmiş antivirüs koruması',
        isActive: true,
        createdAt: '2024-05-28T14:30:00Z'
      },
      {
        id: 3,
        name: 'Yedekleme Cloud',
        description: 'Bulut tabanlı yedekleme hizmeti',
        isActive: false,
        createdAt: '2024-05-25T09:15:00Z'
      },
      {
        id: 4,
        name: 'E-Posta Güvenliği',
        description: 'Spam ve phishing koruması',
        isActive: true,
        createdAt: '2024-05-20T16:45:00Z'
      },
      {
        id: 5,
        name: 'VPN Kurumsal',
        description: 'Güvenli uzaktan erişim',
        isActive: false,
        createdAt: '2024-05-18T11:20:00Z'
      }
    ]
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-semibold text-foreground">{t.dashboard}</h1>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeProducts}</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.inactiveProducts}</CardTitle>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveProducts}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.recentProducts}</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.recentProducts}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {/* Masaüstü tablosu */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.description}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.createdAt}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "success" : "destructive"}>
                          {product.isActive ? t.active : t.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobil kart görünümü */}
            <div className="md:hidden divide-y">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    </div>
                    <Badge variant={product.isActive ? "success" : "destructive"}>
                      {product.isActive ? t.active : t.inactive}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(product.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 