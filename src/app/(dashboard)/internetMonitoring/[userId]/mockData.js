// Mock veriler
export const mockData = {
  alerts: [
    {
      type: 'phone',
      title: 'İzleme Uyarısı: İfşa Olmuş Telefon Numarası',
      details: {
        phone: '(512) 827-1016',
        date: '15/02/2024',
        description: 'Bu telefon numarasının çevrimiçi ortamlarda risk altında olduğu tespit edilmiş.',
        additionalInfo: {
          email: 'p*****24@gmail.com',
          phone: '***1016',
          source: 'V152SOFTWARE.COM',
          creationDate: '15/02/2024'
        }
      }
    }
  ],
  history: [
    { type: 'İnternet Gözetimi', date: '07/03/2023' },
    { type: 'İnternet Gözetimi', date: '16/01/2023' },
    { type: 'İnternet Gözetimi', date: '31/12/2022' },
    { type: 'İnternet Gözetimi Report', date: '01/02/2022' }
  ],
  monitoredInfo: {
    email: {
      total: 3,
      current: 3,
      examples: ['yk**ps@gmail.com', 'yk**ps@yahoo.com', 'ya******in@experilabs.com']
    },
    phone: {
      total: 3,
      current: 3,
      examples: ['***2939', '***1016', '***2057']
    },
    creditCard: {
      total: 3,
      current: 0,
      examples: []
    },
    tckn: {
      total: 1,
      current: 1,
      examples: ['********3850']
    },
    iban: {
      total: 3,
      current: 1,
      examples: ['*************gfh']
    },
    bankAccount: {
      total: 3,
      current: 1,
      examples: ['Yönlendirme Numarası: ********2939', 'Hesap Numarası: ************7687']
    },
    driverLicense: {
      total: 1,
      current: 1,
      examples: ['********8798']
    },
    File: {
      total: 1,
      current: 1,
      examples: ['********6986']
    },
    storeCard: {
      total: 3,
      current: 1,
      examples: ['********4352']
    },
    medical_id: {
      total: 3,
      current: 0,
      examples: []
    }
  }
};

// Bildirimler için mock veri
export const mockNotifications = [
  {
    id: 1,
    type: 'İnternet Gözetimi',
    date: '15/02/2024',
    title: 'İfşa Olmuş Telefon',
    details: {
      risks: [
        { label: 'İzlenen Telefon Numaraları', value: '(512) 827-1016' },
        { label: 'Bulunma Tarihi', value: '15/02/2024' }
      ],
      explanation: 'Telefon numaranızın çevrimiçi olarak risk altında olduğu tespit edilmiştir. Kişisel bilgilerinizin satılıp satılmadığını belirlemek için bazı çevrimiçi özellikleri izledik ve maalesef olası bir kimlik hırsızlığına işaret eden bir eşleşme tespit ettik.',
      extra: [
        { label: 'E-Posta', value: 'jo*********24@gmail.com' },
        { label: 'Phone Number', value: '(***) ***-1016' },
        { label: 'Potansiyel Saha', value: 'v12software.com' },
        { label: 'Oluşturma Tarihi', value: '15/02/2024' }
      ],
      actions: 'Telefon numaranızı içeren hesabınızın güvenli olduğundan emin olun. Birçok durumda, telefon numaranız Facebook ve Google gibi yüksek değerli sitelerde hesap doğrulama için kullanılır.'
    }
  },
  {
    id: 2,
    type: 'İnternet Gözetimi',
    date: '07/03/2023',
    title: 'İfşa Olmuş TCKN',
    details: {
      risks: [
        { label: 'İzlenen TCKN', value: '*******3850' },
        { label: 'Bulunma Tarihi', value: '07/03/2023' }
      ],
      explanation: 'TCKN numaranızın çevrimiçi olarak risk altında olduğu tespit edilmiştir.',
      extra: [
        { label: 'Adı', value: 'YAVUZ' },
        { label: 'Soyadı', value: 'AHN' },
        { label: 'Şehir', value: '***' },
        { label: 'Ülke/Eyalet', value: 'BORNOVA' },
        { label: 'Ülke', value: '**' },
        { label: 'Ulusal Kimlik', value: '*******3850' },
        { label: 'Oluşturma Tarihi', value: '07/03/2023' }
      ],
      actions: 'Lütfen destek temsilcinizi arayın.'
    }
  },
  {
    id: 3,
    type: 'İnternet Gözetimi',
    date: '16/01/2023',
    title: 'İfşa Olmuş E-Posta Adresi',
    details: {
      risks: [
        { label: 'İzlenen E-Posta Adresleri', value: 'yk**ps@yahoo.com' },
        { label: 'Bulunma Tarihi', value: '16/01/2023' }
      ],
      explanation: 'E-posta adresinizin çevrimiçi olarak risk altında olduğu tespit edilmiştir.',
      extra: [
        { label: 'E-Posta', value: 'yk**ps@yahoo.com' },
        { label: 'Oluşturma Tarihi', value: '16/01/2023' },
        { label: 'Şifre', value: 'Password Found' }
      ],
      actions: 'Risk altındaki e-posta adresinin parolasını derhal değiştirin.'
    }
  }
]; 