# Validasi Sumber Data Yamaha

## Sumber

Dokumen: `yamaha-maintenance-manual.pdf`

- Tabel emisi: halaman 8-2.
- Tabel umum: halaman 8-3 sampai 8-6.

## Status Ekstraksi

- 6 pekerjaan emisi telah dimasukkan.
- 30 pekerjaan umum telah dimasukkan.
- Seluruh entri mempertahankan nomor tabel dan halaman referensi.
- Pekerjaan bertanda bintang disimpan pada `dealerRequired: true`.
- Tanda centang diperiksa secara visual pada render PDF.

## Interval Khusus

| Komponen | Informasi sumber |
|---|---|
| Saringan bahan bakar | 12.000 km |
| Busi | Pemeriksaan pada tabel; penggantian 8.000 km |
| Elemen saringan udara | 12.000 km |
| Minyak rem | 2 tahun |
| Selang rem | 4 tahun |
| Bearing kemudi | Lumasi 24.000 km |
| Oli mesin | Pemeriksaan ketinggian dan kebocoran 3.000 km; penggantian pada indikator |
| Sistem pendinginan | Ganti cairan 12.000 km |
| Oli transmisi akhir | Penggantian awal 1.000 km; setiap 12.000 km |
| V-belt | Penggantian pada indikator; manual mencantumkan 25.000 km |
| Sheave sekunder V-belt | Lumasi 12.000 km |

## Ambiguitas yang Tidak Dibakukan

- 3.000 km pada oli mesin tidak diperlakukan sebagai interval penggantian.
- Angka 25.000 km pada V-belt disimpan sebagai referensi dan tidak menggantikan pemicu indikator.
- Kampas rem memiliki batas pemakaian, bukan interval kalender atau kilometer tetap.
- Setelah 20.000 km, data siklus harus dihitung saat engine terhubung ke riwayat aktual; tidak ada pengulangan yang ditebak pada data statis.
