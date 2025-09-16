import { z } from 'zod';

// Contact form gönderme şeması
export const contactCreateSchema = z.object({
  firstName: z.string().min(1, 'Ad zorunludur').max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z.string().min(1, 'Soyad zorunludur').max(50, 'Soyad en fazla 50 karakter olabilir'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').max(100, 'E-posta en fazla 100 karakter olabilir'),
  companyName: z.string().max(100, 'Şirket adı en fazla 100 karakter olabilir').optional(),
  phoneNumber: z.string().max(20, 'Telefon numarası en fazla 20 karakter olabilir').optional(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır').max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
});