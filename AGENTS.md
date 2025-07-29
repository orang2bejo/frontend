## Alur Kerja Deployment Supabase

1.  **Inisialisasi Lokal:**
    *   `supabase init`
2.  **Hubungkan Proyek:**
    *   `supabase login`
    *   `supabase link --project-ref <your-project-ref>`
3.  **Struktur Folder:**
    *   Edge Functions: `supabase/functions/`
    *   Migrasi SQL: `supabase/migrations/`
4.  **Deploy Migrasi:**
    *   `supabase db push` (untuk development)
    *   `supabase migration new <name>` & `supabase migration up` (untuk produksi)
5.  **Deploy Edge Functions:**
    *   `supabase functions deploy`
6.  **CI/CD:**
    *   File `.github/workflows/supabase-deploy.yml` akan secara otomatis men-deploy migrasi dan fungsi saat ada push ke branch `main`. Pastikan untuk mengatur `SUPABASE_DB_PASSWORD` dan `SUPABASE_ACCESS_TOKEN` di repositori GitHub Anda. Ganti `<your-project-ref>` dengan ref proyek Anda.
