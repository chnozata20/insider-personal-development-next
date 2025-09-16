export const captchaService = {
  widgetId: null,
  isInitialized: false,

  // Token alma
  getToken: async (action = 'general') => {
    return new Promise((resolve) => {
      // Turnstile yüklenene kadar bekle
      if (typeof turnstile === 'undefined') {
        console.error('Turnstile can not be loaded');
        resolve(null);
        return;
      }

      // Widget container'ı oluştur
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);

      try {
        // Widget'ı render et
        turnstile.render(container, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          size: 'invisible',
          callback: (token) => {
            // Token alındığında container'ı temizle
            document.body.removeChild(container);
            resolve(token);
          },
          'error-callback': (error) => {
            console.error('Turnstile error:', error);
            document.body.removeChild(container);
            resolve(null);
          }
        });
      } catch (error) {
        console.error('Turnstile render error:', error);
        document.body.removeChild(container);
        resolve(null);
      }
    });
  },

  // Token doğrulama
  verifyToken: async (token) => {
    if (!token) return false;

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
      formData.append('response', token);

      // Token'ı doğrula
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Turnstile verification error:', data['error-codes']);
      }
      return data.success;
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return false;
    }
  }
}; 