# MotoCare

MotoCare adalah Motorcycle Maintenance Tracker berbasis data tabel perawatan Yamaha.

## Pengembangan

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

## Konfigurasi Supabase

1. Buat project Supabase.
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Jalankan migration:

```bash
supabase db push
```

Jangan menaruh service-role key atau secret pada environment Next.js yang tersedia di browser.

## Validation

```bash
npm run lint
npm run test
npm run build
```

## Struktur Data

- `src/data/maintenanceTasks.ts`: seluruh pekerjaan dari tabel emisi dan tabel umum.
- `src/domain/maintenanceEngine.ts`: aturan status dan kalkulasi jadwal.
- `supabase/migrations/202611230001_initial_schema.sql`: schema awal dan RLS.
- `supabase/migrations/202611230003_seed_maintenance_tasks.sql`: seed katalog 36 pekerjaan.
- `supabase/migrations/202611230004_public_maintenance_catalog.sql`: akses baca katalog umum untuk client anon/authenticated.
- `docs/source-data-validation.md`: catatan ekstraksi dan ambiguitas.

Perubahan interval hanya boleh didasarkan pada dokumen sumber atau instruksi manual terverifikasi.
