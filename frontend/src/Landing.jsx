import React, { useState } from 'react'
import Logo from './ui/Logo'
import locales from './locales'

export default function Landing({ onEnter, onNavigate, lang, setLang }) {
  const [showContact, setShowContact] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const t = locales[lang]

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" showText={true} dark={false} />
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowLang(v => !v)} onBlur={() => setTimeout(() => setShowLang(false), 150)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  {lang}
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showLang ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showLang && (
                  <div className="absolute right-0 mt-1.5 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg animate-scale-in">
                    {['ENGLISH', 'INDONESIAN'].map(o => (
                      <button key={o} onMouseDown={() => { setLang(o === 'ENGLISH' ? 'EN' : 'ID'); setShowLang(false) }} className={`block w-full px-4 py-2.5 text-sm font-semibold text-left transition-colors ${lang === (o === 'ENGLISH' ? 'EN' : 'ID') ? 'text-primary-600 bg-primary-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => onEnter?.()} className="btn-ghost text-sm">{t.nav_masuk}</button>
              <button onClick={() => onEnter?.('register')} className="btn-primary text-sm">{t.nav_daftar}</button>
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
              {t.hero_badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight text-balance">
              {t.hero_title1}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">{t.hero_title2}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero_desc}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => onEnter?.('register')} className="btn-primary text-base px-8 py-3.5 shadow-lg hover:shadow-xl">
                {t.hero_btn_start}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
              <button onClick={() => onEnter?.()} className="btn-secondary text-base px-8 py-3.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t.hero_btn_demo}
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10 text-sm text-slate-500">
              <span className="flex items-center gap-2"><svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t.hero_tag1}</span>
              <span className="flex items-center gap-2"><svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t.hero_tag2}</span>
              <span className="flex items-center gap-2"><svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t.hero_tag3}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{t.features_title}</h2>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">{t.features_subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <ChartIcon /> },
              { icon: <ReceiptIcon /> },
              { icon: <BoxIcon /> },
              { icon: <DocIcon /> },
              { icon: <TrendIcon /> },
              { icon: <GraphIcon /> },
            ].map((f, i) => {
              const feat = t.features[i]
              return (
                <div key={i} className="card-hover p-6 group animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{feat.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '500+' },
              { value: '10.000+' },
              { value: '1 Juta+' },
            ].map((s, i) => {
              const stat = t.stats[i]
              return (
                <div key={i} className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">{s.value}</p>
                  <p className="mt-2 text-slate-400 font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{t.testimonial_title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.testimonials.map((item, i) => (
              <div key={i} className="card-hover p-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">{item.quote}</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">{t.cta_title}</h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">{t.cta_desc}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onEnter?.('register')} className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
              {t.cta_btn_start}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{t.faq_title}</h2>
            {t.faq_subtitle && <p className="mt-3 text-lg text-slate-500">{t.faq_subtitle}</p>}
          </div>
          <div className="space-y-3">
            {t.faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-shadow duration-200 hover:shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full px-6 py-4 text-left">
                  <span className="text-base font-semibold text-slate-800 pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-[300px]' : 'max-h-0'}`}>
                  <div className="px-6 pb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Logo size="xs" showText={true} dark={true} />
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">{t.footer_desc}</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">{t.footer_menu_title}</h5>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-xs text-sm text-slate-400">
                {t.footer_menu.map((item, i) => (
                  <li key={i} onClick={() => onNavigate?.([ 'landing', 'dashboard', 'sales', 'stock', 'subrecipe', 'pricecalc' ][i])} className="hover:text-white transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">{t.footer_stats_title}</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                {t.footer_stats.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            {t.footer_copyright}
          </div>
        </div>
      </footer>

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in" onClick={() => setShowContact(false)}>
          <div className="w-full max-w-lg bg-white rounded-[20px] shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="relative px-7 pt-7 pb-3">
              <button onClick={() => setShowContact(false)} className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-bold text-slate-800">{t.contact_title}</h3>
              <p className="text-sm text-slate-500 mt-1">{t.contact_desc}</p>
            </div>
            <div className="px-7 py-6 grid grid-cols-3 gap-4">
              <a href="https://wa.me/62895333029958" target="_blank" rel="noopener noreferrer"
                 className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-emerald-50 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-emerald-600 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">WhatsApp</span>
              </a>
              <a href="mailto:fzahabiyaa@gmail.com" target="_blank" rel="noopener noreferrer"
                 className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-blue-50 hover:bg-gradient-to-br hover:from-blue-500 hover:to-red-400 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">Email</span>
              </a>
              <a href="https://instagram.com/firaazhbiyaa" target="_blank" rel="noopener noreferrer"
                 className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-purple-50 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16a4 4 0 100-8 4 4 0 000 8zM3 8.5v7a6.5 6.5 0 006.5 6.5h5a6.5 6.5 0 006.5-6.5v-7A6.5 6.5 0 0014.5 2h-5A6.5 6.5 0 003 8.5z"/></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">Instagram</span>
              </a>
            </div>
            <div className="px-7 py-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">{t.contact_cta}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ChartIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
function ReceiptIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg> }
function BoxIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> }
function DocIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }
function TrendIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
function GraphIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> }