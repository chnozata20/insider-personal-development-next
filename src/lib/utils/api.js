import { toast } from 'sonner';

const ERROR_MESSAGES = {
  CODE_INVALID_OR_EXPIRED: 'Doğrulama kodu geçersiz veya süresi dolmuş',
  TOO_MANY_REQUESTS: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin',
  EMAIL_IN_USE: 'Bu e-posta adresi zaten kullanımda',
  INVALID_CREDENTIALS: 'E-posta veya şifre hatalı',
  INVALID_PASSWORD: 'Hatalı şifre',
  INVALID_MAIL: 'Geçersiz e-posta adresi',
  ACCOUNT_LOCKED: 'Hesabınız kilitlendi',
  INVALID_CODE: 'Geçersiz doğrulama kodu',
  CODE_EXPIRED: 'Doğrulama kodunun süresi doldu',
  INVALID_TOKEN: 'Geçersiz token',
  TOKEN_EXPIRED: 'Token süresi doldu',
  UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
  NOT_FOUND: 'İstenen kaynak bulunamadı',
  SERVER_ERROR: 'Sunucu hatası oluştu',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  LINK_INVALID_OR_EXPIRED: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı',
  PASSWORD_RESET_LIMIT_EXCEEDED: '24 saat içinde en fazla 3 kez şifre sıfırlama isteği yapabilirsiniz',
  REFRESH_TOKEN_REQUIRED: 'Refresh token gerekli',
  TOKEN_REFRESH_FAILED: 'Token yenileme başarısız',
  PRODUCT_NOT_FOUND: 'Ürün bulunamadı',
  WATCHED_INFO_NOT_FOUND: 'İzlenen bilgi bulunamadı',
  MAX_LIMIT_REACHED: 'Bu tür için maksimum limit sayısına ulaşıldı',
  USER_ID_REQUIRED: 'Kullanıcı ID\'si gerekli',
  WATCHED_INFO_CREATE_ERROR: 'İzlenen bilgi eklenirken bir hata oluştu',
  WATCHED_INFO_UPDATE_ERROR: 'İzlenen bilgi güncellenirken bir hata oluştu',
  WATCHED_INFO_DELETE_ERROR: 'İzlenen bilgi silinirken bir hata oluştu',
  WATCHED_INFO_LIST_ERROR: 'İzlenen bilgiler listelenirken bir hata oluştu',
  PRODUCT_HAS_ASSIGNED_USERS: 'Bu ürünü silmek için önce tüm kullanıcı atamalarını kaldırmanız gerekiyor.',
  PRODUCT_HAS_WATCHED_INFO: 'Bu ürünü silmek için önce tüm izlenen bilgi kayıtlarını kaldırmanız gerekiyor.',
  PRODUCT_ID_REQUIRED: 'Ürün ID\'si gerekli',
  USER_ALREADY_ASSIGNED_TO_PRODUCT: 'Kullanıcı zaten bu ürüne atanmış',
  USER_NOT_ASSIGNED_TO_PRODUCT: 'Kullanıcı bu ürüne atanmamış',
  INFO_TYPE_NOT_SUPPORTED: 'Bu bilgi türü ürün tarafından desteklenmiyor',
  CONTACT_NOT_FOUND: 'İletişim mesajı bulunamadı',
  CONTACT_CREATE_ERROR: 'İletişim mesajı gönderilirken bir hata oluştu',
  CONTACT_UPDATE_ERROR: 'İletişim mesajı güncellenirken bir hata oluştu',
  CONTACT_DELETE_ERROR: 'İletişim mesajı silinirken bir hata oluştu',
  CONTACT_LIST_ERROR: 'İletişim mesajları listelenirken bir hata oluştu',
};

const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Giriş başarılı',
  REGISTER_SUCCESS: 'Kayıt başarılı',
  VERIFICATION_CODE_SENT: 'Doğrulama kodu e-posta adresinize gönderildi',
  VERIFICATION_SUCCESS: 'Doğrulama başarılı',
  PASSWORD_RESET_SUCCESS: 'Şifreniz başarıyla güncellendi',
  PASSWORD_RESET_REQUEST_SENT: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
  PASSWORD_CHANGE_SUCCESS: 'Şifre değiştirme başarılı',
  PROFILE_UPDATE_SUCCESS: 'Profil güncelleme başarılı',
  TWO_FACTOR_ENABLED: 'İki faktörlü doğrulama aktif edildi',
  TWO_FACTOR_DISABLED: 'İki faktörlü doğrulama devre dışı bırakıldı',
  TWO_FACTOR_CODE_SENT: 'İki faktörlü doğrulama kodu e-posta adresinize gönderildi',
  TWO_FACTOR_VERIFY_SUCCESS: 'İki faktörlü doğrulama başarılı',
  DEMO_REQUEST_SENT: 'Demo talebi gönderildi',
  DEMO_REQUEST_APPROVED: 'Demo talebi onaylandı',
  DEMO_REQUEST_REJECTED: 'Demo talebi reddedildi',
  '2FA_LOGIN_SUCCESS': 'İki faktörlü doğrulama başarılı',
  '2FA_LOGIN_CODE_SENT': 'İki faktörlü doğrulama kodu e-posta adresinize gönderildi',
  TOKEN_REFRESHED: 'Token başarıyla yenilendi',
  PRODUCT_LIST_SUCCESS: 'Ürünler başarıyla listelendi',
  PRODUCT_CREATE_SUCCESS: 'Ürün başarıyla oluşturuldu',
  PRODUCT_DETAIL_SUCCESS: 'Ürün detayları başarıyla getirildi',
  PRODUCT_UPDATE_SUCCESS: 'Ürün başarıyla güncellendi',
  PRODUCT_DELETE_SUCCESS: 'Ürün başarıyla silindi',
  USER_LIST_SUCCESS: 'Kullanıcılar başarıyla listelendi',
  USER_CREATE_SUCCESS: 'Kullanıcı başarıyla oluşturuldu',
  USER_DETAIL_SUCCESS: 'Kullanıcı detayları başarıyla getirildi',
  USER_UPDATE_SUCCESS: 'Kullanıcı başarıyla güncellendi',
  USER_DELETE_SUCCESS: 'Kullanıcı başarıyla silindi',
  USER_PASSWORD_UPDATE_SUCCESS: 'Kullanıcı şifresi başarıyla güncellendi',
  WATCHED_INFO_CREATE_SUCCESS: 'İzlenen bilgi başarıyla eklendi',
  WATCHED_INFO_UPDATE_SUCCESS: 'İzlenen bilgi başarıyla güncellendi',
  WATCHED_INFO_DELETE_SUCCESS: 'İzlenen bilgi başarıyla silindi',
  WATCHED_INFO_LIST_SUCCESS: 'İzlenen bilgiler başarıyla listelendi',
  USER_PRODUCT_ASSIGNED_SUCCESS: 'Ürün kullanıcıya başarıyla atandı',
  USER_PRODUCT_REMOVED_SUCCESS: 'Ürün kullanıcıdan başarıyla kaldırıldı',
  USER_PRODUCTS_LIST_SUCCESS: 'Kullanıcının ürünleri başarıyla listelendi',
  PRODUCT_USERS_LIST_SUCCESS: 'Ürünün kullanıcıları başarıyla listelendi',
  CONTACT_CREATE_SUCCESS: 'İletişim mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
  CONTACT_GET_SUCCESS: 'İletişim mesajı başarıyla getirildi',
  CONTACT_UPDATE_SUCCESS: 'İletişim mesajı başarıyla güncellendi',
  CONTACT_DELETE_SUCCESS: 'İletişim mesajı başarıyla silindi',
  CONTACT_LIST_SUCCESS: 'İletişim mesajları başarıyla listelendi',
};

export function processApiResponse(response, options = {}) {
  const {
    successMessage,
    errorMessage,
    showSuccess = true,
    showError = true,
    onSuccess,
    onError
  } = options;

  if (!response.success) {
    const error = new Error(response.message ? ERROR_MESSAGES[response.message] || response.message : errorMessage || 'Bir hata oluştu');

    if (showError) {
      toast.error(error.message);
    }

    if (onError) {
      onError(error);
    }

    throw error;
  }

  if (showSuccess) {
    const message = response.message ? SUCCESS_MESSAGES[response.message] || response.message : successMessage || 'İşlem başarılı';
    toast.success(message);
  }

  if (onSuccess) {
    onSuccess(response.data);
  }

  return response.data;
}