'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { contactService } from '@/lib/services/contact';
import { formatDate } from '@/lib/utils/date';
import { useDebounce } from '@/hooks/useDebounce';

export default function ContactsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt_desc'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactService.getContacts(filters);
      setContacts(response.contacts);
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
    fetchContacts();
  }, [fetchContacts]);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id) => {
    if (!confirm(t.contactDeleteConfirmation)) return;

    await contactService.deleteContact(id);
    await fetchContacts();
  };

  const handleViewMessage = (message) => {
    alert(message);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t.contacts}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.search}
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstName_asc">{t.nameAsc}</SelectItem>
                    <SelectItem value="firstName_desc">{t.nameDesc}</SelectItem>
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
                    <TableHead>{t.email}</TableHead>
                    <TableHead>{t.companyName}</TableHead>
                    <TableHead>{t.phoneNumber}</TableHead>
                    <TableHead>{t.message}</TableHead>
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
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        {t.noProductsFound}
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          {contact.companyName || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phoneNumber || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={contact.message}>
                            {contact.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(contact.createdAt, language)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMessage(contact.message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
              ) : contacts.length === 0 ? (
                <div className="p-4 text-center">{t.noProductsFound}</div>
              ) : (
                <div className="divide-y">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{contact.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {contact.companyName && (
                          <div className="text-sm">
                            <span className="font-medium">{t.companyName}:</span> {contact.companyName}
                          </div>
                        )}
                        {contact.phoneNumber && (
                          <div className="text-sm">
                            <span className="font-medium">{t.phoneNumber}:</span> {contact.phoneNumber}
                          </div>
                        )}
                      </div>

                      <div className="text-sm">
                        <div className="font-medium mb-1">{t.message}:</div>
                        <div className="text-muted-foreground line-clamp-2">
                          {contact.message}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatDate(contact.createdAt, language)}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewMessage(contact.message)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t.contactViewMessage}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t.delete}
                        </Button>
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