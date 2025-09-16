'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, User, X, ChevronDown, ChevronUp, Search, File, Package } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { watchedInfoService } from '@/lib/services/watchedInfo';
import { userService } from '@/lib/services/user';
import { getUserFromToken } from '@/lib/utils/token';
import { use } from 'react';

// Mock verileri ayrı dosyadan import
import { mockNotifications } from './mockData';

export default function InternetMonitoring({ params }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const routeUserId = use(params).userId;

  // ===== STATE YÖNETİMİ =====
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(routeUserId);
  const [userProducts, setUserProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productInfoTypes, setProductInfoTypes] = useState([]);
  const [watchedInfos, setWatchedInfos] = useState([]);
  const [inputs, setInputs] = useState({});

  // Notifications state
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [openNotif, setOpenNotif] = useState(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // ===== FAQ LISTESİ =====
  const faqList = [
    { question: t.internetMonitoringFAQ1Question, answer: t.internetMonitoringFAQ1Answer },
    { question: t.internetMonitoringFAQ2Question, answer: t.internetMonitoringFAQ2Answer },
    { question: t.internetMonitoringFAQ3Question, answer: t.internetMonitoringFAQ3Answer },
    { question: t.internetMonitoringFAQ4Question, answer: t.internetMonitoringFAQ4Answer },
    { question: t.internetMonitoringFAQ5Question, answer: t.internetMonitoringFAQ5Answer },
    { question: t.internetMonitoringFAQ6Question, answer: t.internetMonitoringFAQ6Answer },
  ];

  // ===== API FONKSİYONLARI =====
  
  // Kullanıcı bilgilerini getir
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (token) {
        const userData = getUserFromToken(token);
        setCurrentUser(userData);
        setIsAdmin(userData.role === 'ADMIN');
        
        if (userData.role === 'ADMIN') {
          const usersResponse = await userService.getUsers({ limit: 1000 });
          setAllUsers(usersResponse.users || []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Ürün verilerini getir
  const fetchProductData = useCallback(async (product) => {
    if (!product) return;

    try {
      setLoading(true);
      
      setProductInfoTypes(product.productInfoTypes || []);
      
      const watchedInfoResponse = await watchedInfoService.getWatchedInfos(selectedUserId, product.id);
      setWatchedInfos(watchedInfoResponse || []);
      
      const newInputs = {};
      product.productInfoTypes?.forEach(infoType => {
        newInputs[infoType.infoType.toLowerCase()] = '';
      });
      setInputs(newInputs);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  // Kullanıcının ürünlerini getir
  const fetchUserProducts = useCallback(async () => {
    setLoading(true);
    const response = await userService.getUserProducts(selectedUserId, { limit: 100 });
    setUserProducts(response.products || []);
    
    if (response.products?.length > 0) {
      const firstProduct = response.products[0];
      setSelectedProduct(firstProduct);
      await fetchProductData(firstProduct);
    } else {
      setSelectedProduct(null);
      setProductInfoTypes([]);
      setWatchedInfos([]);
      setInputs({});
    }
    setLoading(false);

  }, [selectedUserId, fetchProductData]);

  // ===== EVENT HANDLERS =====
  
  // Kullanıcı seçimi değiştiğinde
  const handleUserChange = (userId) => {
    setSelectedUserId(userId);
    setSelectedProduct(null);
    setProductInfoTypes([]);
    setWatchedInfos([]);
    setInputs({});
  };

  // Ürün seçimi değiştiğinde
  const handleProductChange = (product) => {
    setSelectedProduct(product);
  };

  // Yeni bilgi ekleme
  const handleAdd = async (infoType) => {
    try {
      setLoading(true);
      
      const inputKey = infoType.infoType.toLowerCase();
      const value = inputs[inputKey];

      if (!value || !selectedProduct) return;

      await watchedInfoService.createWatchedInfo({
        type: infoType.infoType,
        value: value,
        userId: selectedUserId,
        productId: selectedProduct.id
      });

      setInputs(prev => ({ ...prev, [inputKey]: '' }));
      await fetchProductData(selectedProduct);
    } finally {
      setLoading(false);
    }
  };

  // Bilgi silme
  const handleRemove = async (watchedInfoId) => {
    try {
      setLoading(true);
      
      await watchedInfoService.deleteWatchedInfo(watchedInfoId);
      await fetchProductData(selectedProduct);
    } finally {
      setLoading(false);
    }
  };

  // Bildirim silme
  const handleRemoveNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // ===== COMPUTED VALUES =====
  
  // Filtrelenmiş bildirimler
  const filteredNotifications = notifications.filter(notif => {
    return notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           notif.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
           notif.date.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ===== RENDER FONKSİYONLARI =====
  
  // Form alanı render
  const renderFormField = (infoType) => {
    const key = infoType.infoType.toLowerCase();
    const items = watchedInfos.filter(item => item.type.toLowerCase() === key);
    const input = inputs[key] || '';

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <File className="text-gray-500 flex-shrink-0" size={20} />
          <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base truncate">
            {infoType.infoType} ({items.length}/{infoType.maxCount})
          </h3>
        </div>
        <ul className="space-y-2 mb-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
              <span className="text-gray-700 dark:text-gray-300 text-sm break-words min-w-0">
                {item.value}
              </span>
              <button 
                onClick={() => handleRemove(item.id)} 
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex-shrink-0 ml-2"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        {items.length < infoType.maxCount && (
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder={`${infoType.infoType} değeri girin`}
              value={input}
              onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              onClick={() => handleAdd(infoType)}
              disabled={!input}
            >
              {t.internetMonitoringAdd}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ===== USE EFFECTS =====
  
  // Kullanıcı seçimi değiştiğinde
  useEffect(() => {
    if (selectedUserId) {
      fetchUserProducts();
    }
  }, [selectedUserId, fetchUserProducts]);

  // Seçilen ürün değiştiğinde
  useEffect(() => {
    if (selectedProduct) {
      fetchProductData(selectedProduct);
    }
  }, [selectedProduct, fetchProductData]);

  // İlk yükleme
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // ===== RENDER =====
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">{t.pleaseWait}</p>
          </div>
        </div>
      )}

      {/* Admin için Kullanıcı Seçimi */}
      {isAdmin && (
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200">
              {t.internetMonitoringSelectUser}
            </h2>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedUserId || ''}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">{t.internetMonitoringSelectUserPlaceholder}</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Seçimi */}
      {selectedUserId && userProducts.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200">
              {t.internetMonitoringSelectProduct}
            </h2>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = userProducts.find(p => p.id === e.target.value);
                  handleProductChange(product);
                }}
                className="w-full px-3 py-2 text-sm sm:text-base border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {userProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bildirimler Tablosu */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200">
            {t.internetMonitoringNotifications}
          </h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={t.internetMonitoringSearchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      {t.internetMonitoringType}
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      {t.internetMonitoringReportDate}
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      {t.internetMonitoringActions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredNotifications.map((notif, idx) => (
                    <React.Fragment key={notif.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 sm:px-4 py-4 cursor-pointer text-gray-700 dark:text-gray-300" 
                            onClick={() => setOpenNotif(openNotif === notif.id ? null : notif.id)}>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500 flex-shrink-0" size={18} />
                            <span className="truncate max-w-[150px] sm:max-w-none">{notif.type}</span>
                            <button className="ml-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0" 
                                    onClick={e => {e.stopPropagation(); setOpenNotif(openNotif === notif.id ? null : notif.id);}}>
                              {openNotif === notif.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {notif.date}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-right">
                          <button onClick={() => handleRemoveNotif(notif.id)} 
                                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                      {openNotif === notif.id && (
                        <tr>
                          <td colSpan={3} className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 py-4">
                            <div className="mb-3 font-semibold text-gray-800 dark:text-gray-200">{notif.title}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              {notif.details.risks.map((risk, i) => (
                                <div key={i} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-red-800 dark:text-red-200 truncate">{risk.label}</div>
                                      <div className="text-sm text-red-700 dark:text-red-300 break-words">{risk.value}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mb-4 text-gray-700 dark:text-gray-300 text-sm">{notif.details.explanation}</div>
                            <div className="mb-4">
                              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                {t.internetMonitoringAdditionalInfo}:
                              </span>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {notif.details.extra.map((ex, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm flex-shrink-0">{ex.label}:</span>
                                    <span className="text-gray-700 dark:text-gray-300 text-sm break-words min-w-0">{ex.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    {t.internetMonitoringRequiredActions}:
                                  </div>
                                  <div className="text-sm text-blue-700 dark:text-blue-300 break-words">{notif.details.actions}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8">
                        {searchTerm ? t.internetMonitoringNoResults : t.internetMonitoringNoNotifications}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* İzlenen Bilgiler ve Sağ Panel */}
      {selectedUserId && selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
              {t.internetMonitoringWatchedInfo} - {selectedProduct.name}
            </h2>
            
            {productInfoTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productInfoTypes.map(infoType => (
                  <div key={infoType.infoType}>
                    {renderFormField(infoType)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <Package className="text-yellow-500" size={20} />
                  <p className="text-yellow-800 dark:text-yellow-200">
                    {t.noInfoTypesDefined}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sağ Panel - Bilgilendirici Kutular */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                {t.internetMonitoringWhyMonitorTitle}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {t.internetMonitoringWhyMonitorDesc}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                {t.internetMonitoringLegalWarningTitle}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {t.internetMonitoringLegalWarningDesc}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                {t.internetMonitoringFAQTitle}
              </h3>
              <div className="space-y-2">
                {faqList.map((faq, idx) => (
                  <div key={idx} className="border-b dark:border-gray-700 last:border-b-0">
                    <button
                      className="w-full text-left py-3 font-medium flex justify-between items-center focus:outline-none text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                    >
                      <span className="pr-4 break-words">{faq.question}</span>
                      <span className="ml-2 text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {openFaq === idx ? '-' : '+'}
                      </span>
                    </button>
                    {openFaq === idx && (
                      <div className="py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boş durumlar */}
      {isAdmin && !selectedUserId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <User className="text-blue-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {t.selectUserTitle}
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            {t.selectUserDescription}
          </p>
        </div>
      )}

      {selectedUserId && userProducts.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
          <Package className="text-yellow-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            {t.noProductsAssignedTitle}
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            {t.noProductsAssignedDescription}
          </p>
        </div>
      )}
    </div>
  );
}
