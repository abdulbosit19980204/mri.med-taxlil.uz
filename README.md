# Med-Taxlil - AI Medical Imaging Platform

AI yordamida MRI va tibbiy tasvirlarni tahlil qiluvchi Platform.

## Loyiha Haqida

**Med-Taxlil** - o'zbekiston asosidagi tibbiy AI platforma bo'lib, radiologlar, shifokorlar va bemorlar uchun MRI, CT va boshqa tibbiy tasvirlarni avtomatik tahlil qilish xizmatini taqdim etadi.

### Asosiy Funksionallik:
- ✅ DICOM va rasm formatlarini yuklash
- ✅ 2D/3D DICOM Viewer
- ✅ Sun'iy Intellekt bilan tasvirni tahlil qilish
- ✅ Patologiya aniqlash (O'sma, Insult, Degenerativ)
- ✅ PDF formatida rasmiy hisobotlar
- ✅ Shifokor va bemor uchun rolli huquqlar
- ✅ Xavfsizlik va maxfiylik himoyasi

## Texnik Stack

### Frontend
- **Framework**: Next.js 16 (React)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: SWR/Zustand
- **Viewer**: Cornerstone.js

### Backend
- **API**: FastAPI (Python)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Task Queue**: Celery
- **File Storage**: S3/MinIO

### AI/ML
- **Frameworks**: PyTorch, TensorFlow
- **Medical AI**: MONAI
- **Models**: U-Net, ResNet, EfficientNet

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Server**: Nginx

## Loyiha Tuzilishi

```
med-taxlil/
├── app/                          # Next.js frontend
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Auth pages (login, register)
│   ├── dashboard/               # User dashboard
│   │   ├── page.tsx            # Main dashboard
│   │   ├── upload/             # File upload
│   │   ├── analyses/           # Analysis list
│   │   ├── viewer/             # DICOM viewer
│   │   └── report/             # Report generation
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   └── analysis/           # Analysis endpoints
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   └── ui/                      # Shadcn UI components
├── lib/                         # Utilities
│   ├── auth.ts                  # Auth functions
│   └── dicom-viewer.ts          # DICOM utilities
├── backend/                     # FastAPI server
│   ├── main.py                  # Main application
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile               # Container config
├── docker-compose.yml           # Multi-container setup
└── README.md                    # This file
```

## Boshlang'ich Sozlash

### Talablar
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### 1. Repository Klonlash
```bash
git clone https://github.com/yourusername/med-taxlil.git
cd med-taxlil
```

### 2. Environment Variables
```bash
# .env.local yarating
cp .env.example .env.local

# PostgreSQL
DB_USER=medtaxlil
DB_PASSWORD=secure_password
DB_NAME=med_taxlil_db

# JWT
JWT_SECRET=your-secret-key-change-this

# S3/MinIO (optional)
STORAGE_TYPE=local
```

### 3. Frontend o'rnatish
```bash
# Dependencies
npm install

# Development server
npm run dev

# Localhost:3000 da ochiladi
```

### 4. Backend o'rnatish (Docker orqali)
```bash
# Docker containers ishlatish
docker-compose up -d

# Backend: localhost:8000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### 5. Database Migratsiyalari
```bash
# Database yaratish
docker-compose exec backend alembic upgrade head
```

## Ishlatish

### 1. Ro'yxatdan o'tish
```
Localhost:3000 ga boring
"Ro'yxatdan o'tish" tugmasini bosing
Email, parol va rolni tanlang (Bemor/Shifokor/Admin)
```

### 2. DICOM Yuklash
```
Dashboard → "Yangi Yuklash"
DICOM/NIfTI faylini Drag & Drop qiling
Bemor ma'lumotlarini kiriting
"AI Tahlilni Boshlang" tugmasini bosing
```

### 3. Natijalarni Ko'rish
```
Viewer interfeysi bilan tasvirni tahlil qiling
Window/Level bilan kontrast o'zgartiring
Zoom, Pan, Rotate qiling
AI topilmalarini ko'ring
PDF hisobotni yuklab oling
```

## API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "doctor"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Analysis
```bash
# Upload DICOM
POST /api/analysis/upload
FormData: {
  file: DICOM_FILE,
  patientName: "Ali Karimov",
  analysisType: "Bosh MRI"
}

# Get Results
GET /api/analysis/predict?jobId=job_...

# Generate Report
POST /api/reports/generate
{
  "jobId": "job_...",
  "patientName": "Ali Karimov",
  "findings": "O'sma aniqlanindi..."
}
```

## Xavfsizlik

### Implemented
- ✅ JWT Token Authentication
- ✅ Password Hashing (bcrypt)
- ✅ HTTPS/TLS Encryption
- ✅ CORS Protection
- ✅ Input Validation
- ✅ SQL Injection Prevention
- ✅ DICOM De-identification

### Recommended
- 🔒 2FA (Two-Factor Authentication)
- 🔒 E-Signature Integration
- 🔒 HIPAA Compliance Audit
- 🔒 Regular Security Testing
- 🔒 Data Encryption at Rest

## Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
pytest
```

## Deployment

### Vercel (Frontend)
```bash
# GitHub-ga push qiling
# Vercel-da Deployment qiling
# Environment variables o'rnating
```

### AWS/GCP (Backend)
```bash
# ECR-ga push
docker tag med-taxlil-backend:latest 123456.dkr.ecr.us-east-1.amazonaws.com/med-taxlil:latest
docker push 123456.dkr.ecr.us-east-1.amazonaws.com/med-taxlil:latest

# ECS-da deploy
```

## Monitoring

### Logs
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Performance
- Sentry: Error tracking
- New Relic: Performance monitoring
- DataDog: Infrastructure monitoring

## Roadmap

### Phase 1 (MVP)
- [x] Authentication System
- [x] DICOM Upload
- [x] Basic Viewer
- [x] AI Analysis
- [x] PDF Reports

### Phase 2
- [ ] 3D Visualization
- [ ] Advanced Models
- [ ] Worklist System
- [ ] Payment Integration

### Phase 3
- [ ] PACS Integration
- [ ] Mobile App
- [ ] Telemedicine
- [ ] Multi-language Support

## Contributka

Loyihaga hissa qo'shmoqchi bo'lsangiz:

1. Fork-ni oching
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. O'zgarishlrni commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch-ni push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## License

Bu loyiha MIT License ostida tarqatiladi.

## Muallif

**Med-Taxlil Team**
- Website: https://mri.med-taxlil.uz
- Email: info@med-taxlil.uz

## Support

Muammolarni yoki savollrni:
- GitHub Issues-da oching
- Email orqali yuboring: support@med-taxlil.uz
- Discord-da join qiling: https://discord.gg/medtaxlil

---

**Oxirgi O'zgarish**: January 2024
**Versiya**: 1.0.0 (MVP)
