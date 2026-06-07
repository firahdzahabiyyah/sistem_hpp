import React from 'react'

export default function Landing({ onEnter }) {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md">UI</div>
              <span className="text-lg font-bold text-slate-800">UMKM Inventra</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onEnter?.()} className="btn-ghost text-sm">Masuk</button>
              <button onClick={() => onEnter?.('register')} className="btn-primary text-sm">Daftar Gratis</button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Platform Manajemen UMKM No. 1
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight text-balance">
              Kelola HPP, Penjualan & Stok
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Lebih Mudah dan Cerdas</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Platform all-in-one untuk menghitung Harga Pokok Produksi, mencatat penjualan, 
              mengelola stok bahan baku, dan memantau performa bisnis secara real-time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => onEnter?.('register')} className="btn-primary text-base px-8 py-3.5 shadow-lg hover:shadow-xl">
                Mulai Gratis Sekarang
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
              <button onClick={() => onEnter?.()} className="btn-secondary text-base px-8 py-3.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Lihat Demo
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10 text-sm text-slate-500">
              <span className="flex items-center gap-2"><svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Hitung HPP Otomatis</span>
              <span className="flex items-center gap-2"><svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Laporan Real-time</span>
              <span className="flex items-center gap-2"><svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Kelola Stok Akurat</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Fitur Lengkap untuk UMKM</h2>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">Semua yang Anda butuhkan untuk mengelola bisnis kuliner dalam satu platform terintegrasi.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <ChartIcon />, title: 'Perhitungan HPP', desc: 'Hitung biaya produksi dengan mudah dan akurat hingga ke bahan baku terkecil.' },
              { icon: <ReceiptIcon />, title: 'Pencatatan Penjualan', desc: 'Catat transaksi harian dan dapatkan laporan penjualan real-time.' },
              { icon: <BoxIcon />, title: 'Manajemen Stok', desc: 'Pantau stok bahan baku dan dapatkan notifikasi saat stok menipis.' },
              { icon: <DocIcon />, title: 'Laporan Lengkap', desc: 'Laporan penjualan, biaya produksi, dan performa usaha untuk pengambilan keputusan.' },
              { icon: <TrendIcon />, title: 'Prediksi Kebutuhan', desc: 'Perkirakan kebutuhan bahan baku untuk mengurangi risiko kehabisan stok.' },
              { icon: <GraphIcon />, title: 'Analisis Bisnis', desc: 'Wawasan performa untuk meningkatkan keuntungan dan efisiensi usaha.' },
            ].map((f, i) => (
              <div key={i} className="card-hover p-6 group animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '500+', label: 'UMKM Menggunakan Platform' },
              { value: '10.000+', label: 'Transaksi Tercatat' },
              { value: '1 Juta+', label: 'Data Produk & Bahan Dikelola' },
            ].map((s, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">{s.value}</p>
                <p className="mt-2 text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Dipercaya oleh Pelaku UMKM</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: '"UMKM Inventra membantu kami menghitung biaya produksi dengan lebih akurat dan mengontrol stok bahan baku dengan lebih mudah."', name: 'Rina Suryani', role: 'Pemilik Usaha Kuliner' },
              { quote: '"Laporan yang dihasilkan sangat membantu dalam memantau perkembangan usaha dan menentukan strategi penjualan."', name: 'Budi Santoso', role: 'Pemilik Kedai Kopi' },
              { quote: '"Sekarang pencatatan stok dan penjualan menjadi jauh lebih rapi dan efisien dibandingkan sebelumnya."', name: 'Maya Putri', role: 'Pemilik Toko Kue' },
            ].map((t, i) => (
              <div key={i} className="card-hover p-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">{t.quote}</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">Siap Mengembangkan Bisnis Anda?</h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">Bergabunglah bersama ribuan UMKM yang telah menggunakan UMKM Inventra untuk mengelola usaha mereka.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onEnter?.('register')} className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
              Mulai Gratis Sekarang
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-xl font-bold text-base hover:bg-white/10 transition-all duration-200">
              Hubungi Kami
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs">UI</div>
                <span className="text-lg font-bold text-white">UMKM Inventra</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Platform manajemen usaha untuk membantu UMKM mengelola HPP, stok bahan baku, penjualan, dan laporan bisnis secara efektif dan efisien.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Menu</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Beranda</li>
                <li className="hover:text-white transition-colors cursor-pointer">Fitur</li>
                <li className="hover:text-white transition-colors cursor-pointer">Tentang</li>
                <li className="hover:text-white transition-colors cursor-pointer">Kontak</li>
                <li><button onClick={() => onEnter?.()} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Masuk ke Aplikasi</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Statistik</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>500+ UMKM</li>
                <li>10.000+ Transaksi</li>
                <li>1 Juta+ Data Produk & Bahan</li>
                <li>99.9% Akurasi</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            &copy; 2026 UMKM Inventra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function ChartIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
function ReceiptIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg> }
function BoxIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> }
function DocIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }
function TrendIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
function GraphIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> }
