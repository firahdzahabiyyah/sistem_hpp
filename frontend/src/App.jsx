import React, { useState, useEffect, useMemo } from 'react'
import api from './api'
import Landing from './Landing'
import KPICard from './ui/KPICard'

const formatCurrency = (value) => {
  let locale = 'id-ID'
  try {
    locale = JSON.parse(localStorage.getItem('hpp_display_preferences'))?.currencyFormat || 'id-ID'
  } catch (e) { locale = 'id-ID' }
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
}

const businessTypes = ['Kuliner', 'Jasa', 'Retail', 'Fashion', 'Kerajinan', 'Pertanian', 'Lainnya']
const businessStatuses = ['Pemilik Usaha', 'Reseller', 'Tidak Punya Usaha']

const emptyRegisterForm = { fullName: '', username: '', businessType: '', businessStatus: '', email: '', password: '' }
const emptyLoginForm = { identifier: '', password: '', remember: true }
const defaultDisplayPreferences = { theme: 'light', currencyFormat: 'id-ID', defaultMargin: 30 }
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthPage({ mode, onModeChange, onLogin, onRegister }) {
  const isRegister = mode === 'register'
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const updateRegister = (field, value) => { setRegisterForm(c => ({ ...c, [field]: value })); setErrors(c => ({ ...c, [field]: '' })) }
  const updateLogin = (field, value) => { setLoginForm(c => ({ ...c, [field]: value })); setErrors(c => ({ ...c, [field]: '' })) }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    const next = {}
    Object.entries(registerForm).forEach(([field, value]) => { if (!String(value).trim()) next[field] = 'Field ini wajib diisi.' })
    if (registerForm.email && !emailPattern.test(registerForm.email)) next.email = 'Format email belum benar.'
    if (registerForm.password && registerForm.password.length < 6) next.password = 'Kata sandi minimal 6 karakter.'
    if (Object.keys(next).length > 0) { setErrors(next); return }
    const result = onRegister(registerForm)
    if (result?.error) { setErrors({ username: result.error }); return }
    setRegisterForm(emptyRegisterForm)
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!loginForm.identifier.trim()) next.identifier = 'Masukkan nama pengguna atau email.'
    if (!loginForm.password.trim()) next.password = 'Masukkan kata sandi.'
    if (Object.keys(next).length > 0) { setErrors(next); return }
    const result = onLogin(loginForm)
    if (result?.error) setErrors({ form: result.error })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md mx-auto mb-4">UI</div>
            <h2 className="text-2xl font-bold text-slate-800">{isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun'}</h2>
            <p className="text-sm text-slate-500 mt-1">{isRegister ? 'Lengkapi data pengguna dan informasi usaha.' : 'Gunakan nama pengguna atau email yang sudah terdaftar.'}</p>
          </div>

          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap *</label>
                <input value={registerForm.fullName} onChange={e => updateRegister('fullName', e.target.value)} className={`input-field mt-1.5 ${errors.fullName ? 'input-field-error' : ''}`} placeholder="Nama lengkap" />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Nama Pengguna *</label>
                <input value={registerForm.username} onChange={e => updateRegister('username', e.target.value)} className={`input-field mt-1.5 ${errors.username ? 'input-field-error' : ''}`} placeholder="misal: umkm_inventra" />
                <p className="mt-1 text-xs text-slate-400">Nama Pengguna tidak dapat diubah setelah terdaftar</p>
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Jenis Usaha *</label>
                <select value={registerForm.businessType} onChange={e => updateRegister('businessType', e.target.value)} className={`select-field mt-1.5 ${errors.businessType ? 'input-field-error' : ''}`}>
                  <option value="">Pilih jenis usaha</option>
                  {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Status Usaha *</label>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                  {businessStatuses.map(s => (
                    <label key={s} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold transition-all text-center ${registerForm.businessStatus === s ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="businessStatus" value={s} checked={registerForm.businessStatus === s} onChange={e => updateRegister('businessStatus', e.target.value)} className="sr-only" />{s}</label>
                  ))}
                </div>
                {errors.businessStatus && <p className="mt-1 text-xs text-red-500">{errors.businessStatus}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Alamat Email *</label>
                <input type="email" value={registerForm.email} onChange={e => updateRegister('email', e.target.value)} className={`input-field mt-1.5 ${errors.email ? 'input-field-error' : ''}`} placeholder="nama@email.com" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Kata Sandi *</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? 'text' : 'password'} value={registerForm.password} onChange={e => updateRegister('password', e.target.value)} className={`input-field pr-24 ${errors.password ? 'input-field-error' : ''}`} placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg">{showPassword ? 'Sembunyikan' : 'Lihat'}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <button type="submit" className="btn-primary w-full py-3">Daftar</button>
              <p className="text-center text-sm text-slate-500">Sudah punya akun? <button type="button" onClick={() => onModeChange('login')} className="font-semibold text-primary-600 hover:text-primary-700">Masuk di Sini</button></p>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {errors.form && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.form}</div>}
              <div>
                <label className="text-sm font-semibold text-slate-700">Nama Pengguna atau Email</label>
                <input value={loginForm.identifier} onChange={e => updateLogin('identifier', e.target.value)} className={`input-field mt-1.5 ${errors.identifier ? 'input-field-error' : ''}`} placeholder="username atau email" />
                {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Kata Sandi</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={e => updateLogin('password', e.target.value)} className={`input-field pr-24 ${errors.password ? 'input-field-error' : ''}`} placeholder="Kata sandi" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg">{showPassword ? 'Sembunyikan' : 'Lihat'}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={loginForm.remember} onChange={e => updateLogin('remember', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  Tetap Masuk
                </label>
                <button type="button" className="font-semibold text-primary-600 hover:text-primary-700">Lupa kata sandi?</button>
              </div>
              <button type="submit" className="btn-primary w-full py-3">Masuk</button>
              <p className="text-center text-sm text-slate-500">Belum punya akun? <button type="button" onClick={() => onModeChange('register')} className="font-semibold text-primary-600 hover:text-primary-700">Daftar Sekarang</button></p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfilePage({ currentUser, onUpdateProfile }) {
  if (!currentUser) return null
  const businessName = currentUser.businessName || currentUser.username
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser.fullName || '',
    businessName,
    email: currentUser.email || '',
    businessType: currentUser.businessType || '',
    businessStatus: currentUser.businessStatus || '',
    avatarUrl: currentUser.avatarUrl || ''
  })
  const [profileErrors, setProfileErrors] = useState({})

  const updateProfileField = (field, value) => { setProfileForm(c => ({ ...c, [field]: value })); setProfileErrors(c => ({ ...c, [field]: '' })) }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setProfileErrors(c => ({ ...c, avatarUrl: 'File harus berupa gambar.' })); return }
    if (file.size > 1024 * 1024) { setProfileErrors(c => ({ ...c, avatarUrl: 'Ukuran gambar maksimal 1 MB.' })); return }
    const reader = new FileReader()
    reader.onload = () => updateProfileField('avatarUrl', reader.result)
    reader.readAsDataURL(file)
  }

  const saveProfile = (e) => {
    e.preventDefault()
    const next = {}
    if (!profileForm.fullName.trim()) next.fullName = 'Nama lengkap wajib diisi.'
    if (!profileForm.businessName.trim()) next.businessName = 'Nama UMKM wajib diisi.'
    if (!profileForm.email.trim()) next.email = 'Email wajib diisi.'
    if (profileForm.email && !emailPattern.test(profileForm.email)) next.email = 'Format email belum benar.'
    if (!profileForm.businessType) next.businessType = 'Pilih jenis usaha.'
    if (!profileForm.businessStatus) next.businessStatus = 'Pilih status usaha.'
    if (Object.keys(next).length > 0) { setProfileErrors(next); return }
    onUpdateProfile(profileForm)
    setIsEditing(false)
  }

  const AvatarDisplay = () => profileForm.avatarUrl
    ? <img src={profileForm.avatarUrl} alt="Foto profil" className="h-full w-full rounded-full object-cover" />
    : <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.235.8 5.879 2.129M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Profil UMKM</h1>
          <p className="section-desc">Detail akun dan informasi usaha yang aktif.</p>
        </div>
        <button onClick={() => setIsEditing(v => !v)} className={isEditing ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
          {isEditing ? 'Batal Edit' : 'Edit Profil'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg ring-4 ring-primary-100">
              <AvatarDisplay />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-800">{businessName}</h2>
            <p className="text-sm text-slate-500">@{currentUser.username}</p>
            <span className="mt-4 badge-info">{currentUser.businessStatus}</span>
            {isEditing && (
              <div className="mt-5 w-full">
                <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Ganti Foto Profil
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
                {profileForm.avatarUrl && (
                  <button type="button" onClick={() => updateProfileField('avatarUrl', '')} className="mt-2 text-sm font-semibold text-red-500 hover:text-red-600">Hapus Foto</button>
                )}
                {profileErrors.avatarUrl && <p className="mt-2 text-xs text-red-500">{profileErrors.avatarUrl}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          {isEditing ? (
            <form onSubmit={saveProfile} className="space-y-4" noValidate>
              <h2 className="text-lg font-semibold text-slate-800">Edit Informasi Akun</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nama Lengkap *</label>
                  <input value={profileForm.fullName} onChange={e => updateProfileField('fullName', e.target.value)} className={`input-field mt-1.5 ${profileErrors.fullName ? 'input-field-error' : ''}`} />
                  {profileErrors.fullName && <p className="mt-1 text-xs text-red-500">{profileErrors.fullName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nama UMKM *</label>
                  <input value={profileForm.businessName} onChange={e => updateProfileField('businessName', e.target.value)} className={`input-field mt-1.5 ${profileErrors.businessName ? 'input-field-error' : ''}`} />
                  {profileErrors.businessName && <p className="mt-1 text-xs text-red-500">{profileErrors.businessName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nama Pengguna</label>
                  <input value={currentUser.username} disabled className="input-field mt-1.5 bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Email *</label>
                  <input type="email" value={profileForm.email} onChange={e => updateProfileField('email', e.target.value)} className={`input-field mt-1.5 ${profileErrors.email ? 'input-field-error' : ''}`} />
                  {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Jenis Usaha *</label>
                  <select value={profileForm.businessType} onChange={e => updateProfileField('businessType', e.target.value)} className={`select-field mt-1.5 ${profileErrors.businessType ? 'input-field-error' : ''}`}>
                    <option value="">Pilih jenis usaha</option>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {profileErrors.businessType && <p className="mt-1 text-xs text-red-500">{profileErrors.businessType}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Status Usaha *</label>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                  {businessStatuses.map(s => (
                    <label key={s} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold text-center transition-all ${profileForm.businessStatus === s ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="pbs" value={s} checked={profileForm.businessStatus === s} onChange={e => updateProfileField('businessStatus', e.target.value)} className="sr-only" />{s}</label>
                  ))}
                </div>
                {profileErrors.businessStatus && <p className="mt-1 text-xs text-red-500">{profileErrors.businessStatus}</p>}
              </div>
              <button type="submit" className="btn-primary">Simpan Profil</button>
            </form>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Informasi Akun</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Nama Lengkap', value: currentUser.fullName },
                  { label: 'Nama UMKM', value: businessName },
                  { label: 'Email', value: currentUser.email },
                  { label: 'Jenis Usaha', value: currentUser.businessType },
                ].map((f, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{f.label}</p>
                    <p className="mt-1 font-semibold text-slate-800">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsPage({ currentUser, displayPreferences, onChangePassword, onClearSession, onClearAllUsers, onSaveDisplayPreferences }) {
  const [selectedSetting, setSelectedSetting] = useState('')
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordMessage, setPasswordMessage] = useState('')
  const [preferenceForm, setPreferenceForm] = useState(displayPreferences)
  const [preferenceMessage, setPreferenceMessage] = useState('')

  const updatePasswordField = (field, value) => { setPasswordForm(c => ({ ...c, [field]: value })); setPasswordErrors(c => ({ ...c, [field]: '', form: '' })); setPasswordMessage('') }
  const updatePreferenceField = (field, value) => { setPreferenceForm(c => ({ ...c, [field]: value })); setPreferenceMessage('') }

  const submitPassword = (e) => {
    e.preventDefault()
    const next = {}
    if (!passwordForm.oldPassword.trim()) next.oldPassword = 'Kata sandi lama wajib diisi.'
    if (!passwordForm.newPassword.trim()) next.newPassword = 'Kata sandi baru wajib diisi.'
    if (passwordForm.newPassword && passwordForm.newPassword.length < 6) next.newPassword = 'Minimal 6 karakter.'
    if (!passwordForm.confirmPassword.trim()) next.confirmPassword = 'Konfirmasi kata sandi wajib diisi.'
    if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) next.confirmPassword = 'Konfirmasi kata sandi tidak sama.'
    if (Object.keys(next).length > 0) { setPasswordErrors(next); return }
    const result = onChangePassword(passwordForm)
    if (result?.error) { setPasswordErrors({ form: result.error }); return }
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordMessage('Kata sandi berhasil diperbarui.')
  }

  const submitPreferences = (e) => { e.preventDefault(); onSaveDisplayPreferences(preferenceForm); setPreferenceMessage('Preferensi tampilan berhasil disimpan.') }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Pengaturan</h1>
        <p className="section-desc">Kelola keamanan akun, data lokal, dan preferensi tampilan.</p>
      </div>

      {!selectedSetting && (
        <div className="grid gap-4 md:grid-cols-3">
          <button onClick={() => setSelectedSetting('password')} className="card-hover p-6 text-left group">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><LockIcon /></div>
            <h2 className="text-lg font-bold text-slate-800">Edit Password</h2>
            <p className="mt-2 text-sm text-slate-500">Ganti kata sandi akun login.</p>
          </button>
          <button onClick={() => setSelectedSetting('reset')} className="card-hover p-6 text-left group">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><TrashIcon /></div>
            <h2 className="text-lg font-bold text-slate-800">Reset Data Lokal</h2>
            <p className="mt-2 text-sm text-slate-500">Hapus session atau akun simulasi.</p>
          </button>
          <button onClick={() => setSelectedSetting('appearance')} className="card-hover p-6 text-left group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><SunIcon /></div>
            <h2 className="text-lg font-bold text-slate-800">Preferensi Tampilan</h2>
            <p className="mt-2 text-sm text-slate-500">Pilih mode terang atau gelap.</p>
          </button>
        </div>
      )}

      {selectedSetting && (
        <button onClick={() => setSelectedSetting('')} className="btn-secondary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Pengaturan
        </button>
      )}

      {selectedSetting === 'password' && (
        <form onSubmit={submitPassword} className="card p-6" noValidate>
          <h2 className="text-lg font-semibold text-slate-800">Edit Password</h2>
          <p className="mt-1 text-sm text-slate-500">Gunakan kata sandi lama untuk mengganti password akun {currentUser.username}.</p>
          {passwordErrors.form && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{passwordErrors.form}</div>}
          {passwordMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</div>}
          <div className="mt-5 space-y-4 max-w-md">
            <div>
              <label className="text-sm font-semibold text-slate-700">Kata sandi lama</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => updatePasswordField('oldPassword', e.target.value)} className={`input-field mt-1.5 ${passwordErrors.oldPassword ? 'input-field-error' : ''}`} />
              {passwordErrors.oldPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Kata sandi baru</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => updatePasswordField('newPassword', e.target.value)} className={`input-field mt-1.5 ${passwordErrors.newPassword ? 'input-field-error' : ''}`} />
              {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Konfirmasi kata sandi</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => updatePasswordField('confirmPassword', e.target.value)} className={`input-field mt-1.5 ${passwordErrors.confirmPassword ? 'input-field-error' : ''}`} />
              {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary mt-5">Simpan Password</button>
        </form>
      )}

      {selectedSetting === 'appearance' && (
        <form onSubmit={submitPreferences} className="card p-6" noValidate>
          <h2 className="text-lg font-semibold text-slate-800">Preferensi Tampilan</h2>
          <p className="mt-1 text-sm text-slate-500">Simpan pilihan tampilan untuk dipakai saat membuka aplikasi berikutnya.</p>
          {preferenceMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{preferenceMessage}</div>}
          <div className="mt-5 space-y-4 max-w-md">
            <div>
              <label className="text-sm font-semibold text-slate-700">Mode Tampilan</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[{ value: 'light', label: 'Terang' }, { value: 'dark', label: 'Gelap' }].map(o => (
                  <label key={o.value} className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold text-center transition-all ${preferenceForm.theme === o.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-300'}`}>
                    <input type="radio" name="theme" value={o.value} checked={preferenceForm.theme === o.value} onChange={e => updatePreferenceField('theme', e.target.value)} className="sr-only" />{o.label}</label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-5">Simpan Preferensi</button>
        </form>
      )}

      {selectedSetting === 'reset' && (
        <div className="card p-6 border-red-100">
          <h2 className="text-lg font-semibold text-slate-800">Reset Data Lokal</h2>
          <p className="mt-1 text-sm text-slate-500">Data akun simulasi disimpan di LocalStorage browser ini.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={onClearSession} className="btn-secondary text-sm">Hapus Session Login</button>
            <button onClick={onClearAllUsers} className="btn-danger text-sm">Hapus Semua Akun Simulasi</button>
          </div>
        </div>
      )}
    </div>
  )
}

function IconButton({ icon, onClick, active }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${active ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
      {icon}
    </button>
  )
}

function NavItem({ icon, label, count }) {
  return (
    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200">
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="badge-neutral text-xs">{count}</span>}
    </button>
  )
}

function LockIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> }
function TrashIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> }
function SunIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> }

function DashboardIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> }
function SalesIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg> }
function StockIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> }
function SubRecipeIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> }
function PriceIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function CloseIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> }
function PlusIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> }
function TrashSmallIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> }
function SearchIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> }

export default function App() {
  const [activeTab, setActiveTab] = useState('landing')
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState((() => { try { return JSON.parse(localStorage.getItem('hpp_current_user')) || null } catch (e) { return null } })())
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [displayPreferences, setDisplayPreferences] = useState((() => { try { return { ...defaultDisplayPreferences, ...(JSON.parse(localStorage.getItem('hpp_display_preferences')) || {}) } } catch (e) { return defaultDisplayPreferences } })())

  const [subRecipeRows, setSubRecipeRows] = useState([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const [subRecipeName, setSubRecipeName] = useState('')
  const [foodCostRows, setFoodCostRows] = useState([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const [productName, setProductName] = useState('')
  const [portions, setPortions] = useState(1)
  const [savedRecipes, setSavedRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [laborRows, setLaborRows] = useState([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }])
  const [overheadRows, setOverheadRows] = useState([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }])
  const [marginPct, setMarginPct] = useState((() => { try { return parseInt((JSON.parse(localStorage.getItem('hpp_display_preferences')) || {}).defaultMargin) || 30 } catch (e) { return 30 } })())
  const [showProductModal, setShowProductModal] = useState(false)
  const [salesRows, setSalesRows] = useState([])
  const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0])
  const [salesSummary, setSalesSummary] = useState({ total_terjual: 0, total_pendapatan: 0, total_keuntungan: 0 })
  const [salesHistory, setSalesHistory] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productHpp, setProductHpp] = useState(null)
  const [stokAwal, setStokAwal] = useState(0)
  const [stokAkhir, setStokAkhir] = useState(0)
  const [inventoryRows, setInventoryRows] = useState([])
  const [inventoryForm, setInventoryForm] = useState({ name: '', unit: '', current_stock: 0, min_stock: 0 })
  const [forecastDate, setForecastDate] = useState(new Date().toISOString().split('T')[0])
  const [forecastResult, setForecastResult] = useState(null)

  const loadProductData = (product) => {
    setProductName(product.name)
    setPortions(product.portions || 1)
    if (product.details && product.details.length > 0) setFoodCostRows(product.details.map(d => ({ name: d.name || '', usage: d.usage || 0, unit: d.unit || '', net_weight: d.net_weight || 0, gross_weight: d.gross_weight || 0, price: d.price || 0, cost_price: d.cost_price || 0 })))
    setShowProductModal(false)
  }

  const resetAllRecipes = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua resep dasar?')) return
    try {
      const recipes = await api.getRecipes()
      for (const r of recipes) await fetch(`http://localhost:4000/api/recipes/${r.id}`, { method: 'DELETE' })
      setSavedRecipes([])
      alert('Semua resep dasar telah dihapus!')
    } catch (e) { alert('Gagal menghapus: ' + e.message) }
  }

  useEffect(() => {
    api.getRecipes().then(setSavedRecipes).catch(() => [])
    api.getProducts().then(setProducts).catch(() => [])
    api.getLabor().then(data => { if (!data || data.length === 0) setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }]); else setLaborRows(data) }).catch(() => setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }]))
    api.getOverheads().then(data => { if (!data || data.length === 0) setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }]); else setOverheadRows(data) }).catch(() => setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }]))
    api.getInventory().then(setInventoryRows).catch(() => [])
    api.getSalesHistory().then(setSalesHistory).catch(() => [])
  }, [])

  const updateSubRecipeRow = (i, field, val) => {
    const copy = [...subRecipeRows]
    if (field === 'name' || field === 'unit') copy[i][field] = val
    else copy[i][field] = parseFloat(val) || 0
    copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setSubRecipeRows(copy)
  }
  const addSubRecipeRow = () => setSubRecipeRows([...subRecipeRows, { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const deleteSubRecipeRow = (i) => setSubRecipeRows(subRecipeRows.filter((_, idx) => idx !== i))

  const saveSubRecipe = async () => {
    if (!subRecipeName.trim()) { alert('Masukkan nama sub-recipe!'); return }
    const hasData = subRecipeRows.some(r => r.name && r.price > 0)
    if (!hasData) { alert('Masukkan setidaknya satu bahan dengan harga!'); return }
    const payload = { name: subRecipeName, details: subRecipeRows }
    try {
      const res = await api.createRecipe(payload)
      alert(`Sub-Recipe "${subRecipeName}" tersimpan! Total: Rp ${formatCurrency(res.total)}`)
      setSubRecipeName('')
      setSubRecipeRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getRecipes().then(setSavedRecipes).catch(() => [])
    } catch (e) { alert('Gagal: ' + (e.message || e)) }
  }

  const handleFoodCostNameChange = (i, val) => {
    const copy = [...foodCostRows]
    copy[i].name = val
    const matchedRecipe = savedRecipes.find(r => r.name.toLowerCase() === val.toLowerCase())
    if (matchedRecipe) { copy[i].price = matchedRecipe.total_cost || 0; copy[i].cost_price = matchedRecipe.total_cost || 0 }
    else copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setFoodCostRows(copy)
  }

  const updateFoodCostRow = (i, field, val) => {
    if (field === 'name') { handleFoodCostNameChange(i, val); return }
    const copy = [...foodCostRows]
    if (field === 'unit') copy[i][field] = val
    else copy[i][field] = parseFloat(val) || 0
    copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setFoodCostRows(copy)
  }
  const addFoodCostRow = () => setFoodCostRows([...foodCostRows, { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const deleteFoodCostRow = (i) => setFoodCostRows(foodCostRows.filter((_, idx) => idx !== i))
  const saveFoodCost = async () => { if (!productName.trim()) { alert('Masukkan nama produk!'); return } alert('Bahan Baku tersimpan!') }

  const updateLaborRow = (i, field, val) => {
    const copy = [...laborRows]
    if (field === 'employee_name') copy[i][field] = val
    else if (field === 'work_days') copy[i][field] = parseInt(val) || 1
    else copy[i][field] = parseFloat(val) || 0
    copy[i].cost_per_day = copy[i].work_days > 0 ? copy[i].salary / copy[i].work_days : 0
    setLaborRows(copy)
  }
  const addLaborRow = () => setLaborRows([...laborRows, { employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }])
  const deleteLaborRow = async (i) => {
    const labor = laborRows[i]
    if (labor && labor.id) try { await api.deleteLabor(labor.id) } catch (e) { console.error(e) }
    const newRows = laborRows.filter((_, idx) => idx !== i)
    setLaborRows(newRows.length === 0 ? [{ employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }] : newRows)
  }
  const saveAllLabor = async () => {
    try {
      for (const labor of laborRows) { if (labor.employee_name && labor.salary > 0) { if (labor.id) await api.updateLabor(labor.id, labor); else await api.createLabor(labor) } }
      api.getLabor().then(setLaborRows).catch(() => [])
      alert('Tenaga Kerja tersimpan!')
    } catch (e) { alert('Gagal: ' + e.message) }
  }

  const updateOverheadRow = (i, field, val) => {
    const copy = [...overheadRows]
    if (field === 'name') copy[i][field] = val
    else if (field === 'duration_days') copy[i][field] = parseInt(val) || 1
    else copy[i][field] = parseFloat(val) || 0
    copy[i].cost_per_day = copy[i].duration_days > 0 ? copy[i].total_cost / copy[i].duration_days : 0
    setOverheadRows(copy)
  }
  const addOverheadRow = () => setOverheadRows([...overheadRows, { name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }])
  const deleteOverheadRow = (i) => setOverheadRows(overheadRows.filter((_, idx) => idx !== i))
  const saveAllOverhead = async () => {
    try {
      for (const overhead of overheadRows) { if (overhead.name && overhead.total_cost > 0) { if (overhead.id) await api.updateOverhead(overhead.id, overhead); else await api.createOverhead(overhead) } }
      api.getOverheads().then(setOverheadRows).catch(() => [])
      alert('Overhead tersimpan!')
    } catch (e) { alert('Gagal: ' + e.message) }
  }

  const saveProduct = async () => {
    if (!productName.trim()) { alert('Masukkan nama produk!'); return }
    const validDetails = foodCostRows.filter(r => r.name && r.name.trim() !== '')
    if (validDetails.length === 0) { alert('Masukkan minimal 1 bahan baku!'); return }
    try {
      const res = await api.createProduct({ name: productName, portions, details: validDetails })
      alert(`Produk "${productName}" tersimpan! Total: Rp ${formatCurrency(res.total)}`)
      setProductName(''); setPortions(1)
      setFoodCostRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getProducts().then(setProducts).catch(() => [])
    } catch (e) { alert('Gagal: ' + (e.message || e)) }
  }

  const readStoredUsers = () => { try { return JSON.parse(localStorage.getItem('hpp_users')) || [] } catch (e) { return [] } }

  const handleRegister = (form) => {
    const users = readStoredUsers()
    if (users.some(u => u.username.toLowerCase() === form.username.toLowerCase())) return { error: 'Nama pengguna sudah terdaftar.' }
    if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) return { error: 'Email sudah terdaftar.' }
    const newUser = { ...form, id: Date.now(), businessName: form.businessStatus === 'Tidak Punya Usaha' ? form.fullName : form.username }
    localStorage.setItem('hpp_users', JSON.stringify([...users, newUser]))
    localStorage.setItem('hpp_current_user', JSON.stringify(newUser))
    setCurrentUser(newUser); setAuthMode('login'); setActiveTab('dashboard')
    return { success: true }
  }

  const handleLogin = (form) => {
    const users = readStoredUsers()
    const identifier = form.identifier.toLowerCase()
    const matchedUser = users.find(u => (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) && u.password === form.password)
    if (!matchedUser) return { error: 'Akun tidak ditemukan atau kata sandi salah.' }
    setCurrentUser(matchedUser)
    if (form.remember) localStorage.setItem('hpp_current_user', JSON.stringify(matchedUser))
    else localStorage.removeItem('hpp_current_user')
    setActiveTab('dashboard')
    return { success: true }
  }

  const handleLogout = () => { localStorage.removeItem('hpp_current_user'); setCurrentUser(null); setShowProfileMenu(false); setAuthMode('login'); setActiveTab('auth') }

  const handleUpdateProfile = (profileForm) => {
    const updatedUser = { ...currentUser, ...profileForm }
    const users = readStoredUsers()
    localStorage.setItem('hpp_users', JSON.stringify(users.map(u => u.id === currentUser.id ? updatedUser : u)))
    localStorage.setItem('hpp_current_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  const handleChangePassword = ({ oldPassword, newPassword }) => {
    if (currentUser.password !== oldPassword) return { error: 'Kata sandi lama tidak sesuai.' }
    const updatedUser = { ...currentUser, password: newPassword }
    const users = readStoredUsers()
    localStorage.setItem('hpp_users', JSON.stringify(users.map(u => u.id === currentUser.id ? updatedUser : u)))
    localStorage.setItem('hpp_current_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
    return { success: true }
  }

  const handleClearSession = () => { if (!window.confirm('Hapus session login saat ini?')) return; handleLogout() }
  const handleClearAllUsers = () => {
    if (!window.confirm('Hapus semua akun simulasi dari LocalStorage browser ini?')) return
    localStorage.removeItem('hpp_users'); localStorage.removeItem('hpp_current_user')
    setCurrentUser(null); setShowProfileMenu(false); setAuthMode('login'); setActiveTab('auth')
  }

  const handleSaveDisplayPreferences = (preferences) => {
    const normalized = { theme: preferences.theme, currencyFormat: preferences.currencyFormat, defaultMargin: Math.min(100, Math.max(0, parseInt(preferences.defaultMargin) || 0)) }
    localStorage.setItem('hpp_display_preferences', JSON.stringify(normalized))
    setDisplayPreferences(normalized); setMarginPct(normalized.defaultMargin)
  }

  const calculations = useMemo(() => {
    const foodCost = foodCostRows.reduce((s, r) => s + (r.cost_price || 0), 0)
    const laborDaily = laborRows.reduce((s, l) => s + (l.cost_per_day || 0), 0)
    const overheadDaily = overheadRows.reduce((s, o) => s + (o.cost_per_day || 0), 0)
    const totalDaily = foodCost + laborDaily + overheadDaily
    const portion = portions > 0 ? portions : 1
    const hppPerUnit = portion > 0 ? totalDaily / portion : 0
    return { foodCost, laborDaily, overheadDaily, totalDaily, hppPerUnit, minPrice: hppPerUnit * 1.1, sellingPrice: hppPerUnit * (1 + marginPct / 100) }
  }, [foodCostRows, laborRows, overheadRows, portions, marginPct])

  const subRecipeTotal = subRecipeRows.reduce((s, r) => s + (r.cost_price || 0), 0)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'sales', label: 'Penjualan', icon: <SalesIcon /> },
    { id: 'stock', label: 'Stok', icon: <StockIcon /> },
    { id: 'subrecipe', label: 'Sub-Recipe', icon: <SubRecipeIcon /> },
    { id: 'pricecalc', label: 'Harga Jual', icon: <PriceIcon /> },
  ]

  const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
  const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {activeTab !== 'landing' && (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileNavOpen(v => !v)} className="btn-ghost p-2 lg:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">UI</div>
                <span className="text-lg font-bold text-slate-800 hidden sm:block">UMKM Inventra</span>
              </div>

              <div className="hidden lg:flex items-center gap-1">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false) }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentUser ? (
                  <div className="relative">
                    <button onClick={() => setShowProfileMenu(v => !v)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 shadow-sm">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
                        {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : <UserIcon />}
                      </span>
                      <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.businessName || currentUser.username}</span>
                      <svg className={`h-4 w-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-scale-in">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-800">{currentUser.fullName}</p>
                          <p className="text-xs text-slate-400">@{currentUser.username}</p>
                        </div>
                        <button onClick={() => { setActiveTab('profile'); setShowProfileMenu(false) }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-primary-50 hover:text-primary-700"><UserIcon />Profil UMKM</button>
                        <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false) }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-primary-50 hover:text-primary-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Pengaturan</button>
                        <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false) }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-primary-50 hover:text-primary-700"><UsersIcon />Akun & Profil</button>
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full border-t border-slate-100 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Keluar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setAuthMode('login'); setActiveTab('auth') }} className="btn-ghost text-sm">Masuk</button>
                    <button onClick={() => { setAuthMode('register'); setActiveTab('auth') }} className="btn-primary text-sm">Daftar</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mobileNavOpen && (
            <div className="lg:hidden border-t border-slate-200 bg-white animate-slide-down">
              <div className="px-4 py-3 space-y-1">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false) }} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      )}

      <div className="flex-1">
        {activeTab === 'landing' && <Landing onEnter={(mode) => { if (mode === 'register') { setAuthMode('register'); setActiveTab('auth') } else { setActiveTab(currentUser ? 'dashboard' : 'auth') } }} />}

        {activeTab !== 'landing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {activeTab === 'auth' && <AuthPage mode={authMode} onModeChange={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} />}
            {activeTab === 'profile' && currentUser && <ProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />}
            {activeTab === 'settings' && currentUser && (
              <SettingsPage currentUser={currentUser} displayPreferences={displayPreferences} onChangePassword={handleChangePassword} onClearSession={handleClearSession} onClearAllUsers={handleClearAllUsers} onSaveDisplayPreferences={handleSaveDisplayPreferences} />
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="section-title">Dashboard</h1>
                    <p className="section-desc">Ringkasan data kalkulator HPP</p>
                  </div>
                  {savedRecipes.length > 0 && (
                    <button onClick={resetAllRecipes} className="btn-secondary text-sm">
                      <TrashSmallIcon />
                      Reset Semua Resep Dasar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard title="Total Resep Dasar" value={savedRecipes.length} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
                  <KPICard title="Total Produk Menu" value={products.length} color="emerald" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
                  <KPICard title="Total Tenaga Kerja" value={laborRows.filter(l => l.employee_name).length} color="amber" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                  <KPICard title="Total Overhead" value={overheadRows.filter(o => o.name).length} color="rose" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} />
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Produk Terakhir Disimpan</h3>
                  {products.length === 0 ? (
                    <p className="text-slate-400 text-sm py-8 text-center">Belum ada produk tersimpan. Mulai hitung HPP produk Anda sekarang!</p>
                  ) : (
                    <div className="space-y-2">
                      {products.slice(-5).reverse().map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors">
                          <span className="font-medium text-slate-700">{p.name}</span>
                          <span className="text-primary-600 font-semibold">Rp {formatCurrency(p.total_food_cost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="section-title">Laporan Penjualan</h1>
                  <p className="section-desc">Catat penjualan harian dan lihat laporan keuangan</p>
                </div>

                <div className="card overflow-hidden">
                  <div className="card-gradient-header">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-800">Input Penjualan Harian</h2>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">Tanggal:</label>
                        <input type="date" value={salesDate} onChange={e => { setSalesDate(e.target.value); api.getSalesSummary(e.target.value).then(setSalesSummary).catch(() => {}); api.getSales(e.target.value).then(setSalesRows).catch(() => []) }} className="input-field w-auto py-1.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Produk</label>
                        <select value={selectedProductId} onChange={async e => {
                          const id = e.target.value; setSelectedProductId(id)
                          if (!id) { setSelectedProduct(''); setProductHpp(null); return }
                          const p = products.find(x => x.id === parseInt(id))
                          if (p) setSelectedProduct(p.name)
                          const hpp = await api.getProductHPP(id)
                          if (hpp && hpp.hpp) setProductHpp(hpp); else setProductHpp(null)
                        }} className="select-field">
                          <option value="">-- Pilih Produk --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga Jual / Porsi</label>
                        <div className="input-field bg-slate-50 font-semibold text-primary-700 flex items-center h-[42px]">
                          {productHpp ? `Rp ${formatCurrency(productHpp.hpp)}` : (selectedProductId ? <span className="text-amber-600 text-xs">Hitung HPP dulu!</span> : '-')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Stok Awal (Porsi)</label>
                        <input type="number" min="0" value={stokAwal} onChange={e => setStokAwal(parseInt(e.target.value) || 0)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Stok Akhir / Sisa</label>
                        <input type="number" min="0" value={stokAkhir} onChange={e => setStokAkhir(parseInt(e.target.value) || 0)} className="input-field" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-slate-600">Porsi Terjual</p>
                        <p className="text-2xl font-bold text-primary-700">{(parseInt(stokAwal) || 0) - (parseInt(stokAkhir) || 0)}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-slate-600">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(((parseInt(stokAwal) || 0) - (parseInt(stokAkhir) || 0)) * (productHpp?.hpp || 0))}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-slate-600">Estimasi Keuntungan</p>
                        <p className="text-2xl font-bold text-amber-600">{formatCurrency(((parseInt(stokAwal) || 0) - (parseInt(stokAkhir) || 0)) * (productHpp?.hpp || 0) * 0.3)}</p>
                      </div>
                    </div>

                    <button onClick={async () => {
                      if (!selectedProductId) { alert('Pilih produk!'); return }
                      const hppVal = productHpp?.hpp || 0
                      if (!hppVal) { alert('Produk belum dihitung HPP! Hitung dulu di Perhitungan Harga Jual.'); return }
                      const terjual = (parseInt(stokAwal) || 0) - (parseInt(stokAkhir) || 0)
                      if (terjual <= 0) { alert('Stok terjual harus lebih dari 0!'); return }
                      try {
                        await api.createSale({ date: salesDate, productId: parseInt(selectedProductId), productName: selectedProduct, stok_awal: stokAwal, stok_akhir: stokAkhir, harga_per_porsi: hppVal })
                        alert('Penjualan tersimpan!')
                        setStokAwal(0); setStokAkhir(0); setSelectedProductId(''); setSelectedProduct(''); setProductHpp(null)
                        api.getSales(salesDate).then(setSalesRows).catch(() => [])
                        api.getSalesSummary(salesDate).then(setSalesSummary).catch(() => {})
                        api.getSalesHistory().then(setSalesHistory).catch(() => [])
                      } catch (e) { alert('Gagal: ' + e.message) }
                    }} className="btn-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m0 0v4m0-4l4 4m5-4h5m0 0v4m0-4l-4 4" /></svg>
                      Simpan Penjualan Hari Ini
                    </button>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Riwayat Penjualan ({salesDate})</h2>
                  </div>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-center w-10">No</th>
                          <th className="px-4 py-3 text-left">Produk</th>
                          <th className="px-4 py-3 text-center">Stok Awal</th>
                          <th className="px-4 py-3 text-center">Stok Akhir</th>
                          <th className="px-4 py-3 text-center">Terjual</th>
                          <th className="px-4 py-3 text-right">Harga</th>
                          <th className="px-4 py-3 text-right">Pendapatan</th>
                          <th className="px-4 py-3 text-right">Keuntungan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesRows.length === 0 ? (
                          <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-400">Belum ada penjualan hari ini</td></tr>
                        ) : salesRows.map((s, i) => (
                          <tr key={s.id || i} className="border-b border-slate-100 hover:bg-primary-50/40 transition-colors">
                            <td className="px-4 py-3 text-center text-slate-400">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-slate-700">{s.productName}</td>
                            <td className="px-4 py-3 text-center">{s.stok_awal}</td>
                            <td className="px-4 py-3 text-center">{s.stok_akhir}</td>
                            <td className="px-4 py-3 text-center font-semibold">{s.porsi_terjual}</td>
                            <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.harga_per_porsi)}</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-600">{formatCurrency(s.total_pendapatan)}</td>
                            <td className="px-4 py-3 text-right font-mono text-amber-600">{formatCurrency(s.estimasi_keuntungan)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Total Porsi Terjual</p>
                        <p className="text-2xl font-bold text-slate-800">{salesSummary.total_terjual || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(salesSummary.total_pendapatan || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Total Keuntungan</p>
                        <p className="text-2xl font-bold text-amber-600">{formatCurrency(salesSummary.total_keuntungan || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="section-title">Manajemen Stok & Prediksi</h1>
                  <p className="section-desc">Kelola stok bahan baku dan prediksi kebutuhan</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card overflow-hidden">
                    <div className="card-gradient-header">
                      <h2 className="text-lg font-semibold text-slate-800">Tambah / Edit Stok Bahan</h2>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={inventoryForm.name} onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})} placeholder="Nama bahan" className="input-field" />
                        <input value={inventoryForm.unit} onChange={e => setInventoryForm({...inventoryForm, unit: e.target.value})} placeholder="Satuan (Kg, Porsi, Gram)" className="input-field" />
                        <input type="number" min="0" value={inventoryForm.current_stock} onChange={e => setInventoryForm({...inventoryForm, current_stock: parseFloat(e.target.value) || 0})} placeholder="Stok Saat Ini" className="input-field" />
                        <input type="number" min="0" value={inventoryForm.min_stock} onChange={e => setInventoryForm({...inventoryForm, min_stock: parseFloat(e.target.value) || 0})} placeholder="Minimal Stok" className="input-field" />
                      </div>
                      <button onClick={async () => {
                        if (!inventoryForm.name.trim()) { alert('Nama bahan wajib diisi!'); return }
                        try {
                          await api.saveInventory(inventoryForm)
                          alert('Stok tersimpan!')
                          setInventoryForm({ name: '', unit: '', current_stock: 0, min_stock: 0 })
                          api.getInventory().then(setInventoryRows).catch(() => [])
                        } catch (e) { alert('Gagal: ' + e.message) }
                      }} className="btn-primary">
                        <PlusIcon />
                        Simpan Stok
                      </button>
                    </div>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                      <h2 className="text-lg font-semibold text-slate-800">Prediksi Kebutuhan Stok</h2>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <label className="text-sm font-medium text-slate-700">Pilih Tanggal:</label>
                        <input type="date" value={forecastDate} onChange={e => setForecastDate(e.target.value)} className="input-field w-auto" />
                        <button onClick={async () => { try { setForecastResult(await api.getForecast(forecastDate)) } catch (e) { alert('Gagal: ' + e.message) } }} className="btn-amber">Prediksi</button>
                      </div>
                      {forecastResult && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                          <p className="text-sm text-slate-600">Berdasarkan histori data penjualan, pada tanggal <strong>{forecastResult.day}/{forecastResult.month}</strong> disarankan:</p>
                          <p className="text-3xl font-bold text-amber-700 mt-2">{forecastResult.recommended_stock} porsi</p>
                          <p className="text-xs text-slate-400 mt-2">Data historis: {forecastResult.historical_data_points} titik data</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Daftar Stok Bahan Baku</h2>
                  </div>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-center w-10">No</th>
                          <th className="px-4 py-3 text-left">Nama Bahan</th>
                          <th className="px-4 py-3 text-center">Stok Saat Ini</th>
                          <th className="px-4 py-3 text-center">Satuan</th>
                          <th className="px-4 py-3 text-center">Min. Stok</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryRows.length === 0 ? (
                          <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-400">Belum ada data stok</td></tr>
                        ) : inventoryRows.map((item, i) => {
                          const ratio = item.min_stock > 0 ? item.current_stock / item.min_stock : 99
                          let status, statusClass
                          if (item.current_stock <= 0) { status = 'Berbahaya'; statusClass = 'badge-danger' }
                          else if (ratio <= 1) { status = 'Hampir Habis'; statusClass = 'badge-warning' }
                          else { status = 'Aman'; statusClass = 'badge-success' }
                          return (
                            <tr key={item.id || i} className="border-b border-slate-100 hover:bg-primary-50/40 transition-colors">
                              <td className="px-4 py-3 text-center text-slate-400">{i + 1}</td>
                              <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                              <td className="px-4 py-3 text-center font-semibold">{item.current_stock}</td>
                              <td className="px-4 py-3 text-center text-slate-500">{item.unit}</td>
                              <td className="px-4 py-3 text-center">{item.min_stock}</td>
                              <td className="px-4 py-3 text-center"><span className={statusClass}>{status}</span></td>
                              <td className="px-2 py-2 text-center">
                                <button onClick={async () => { if (!window.confirm('Hapus?')) return; try { await api.deleteInventory(item.id); api.getInventory().then(setInventoryRows) } catch(e) { alert(e.message) } }} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all">
                                  <TrashSmallIcon />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subrecipe' && (
              <div className="animate-fade-in">
                <div className="card overflow-hidden">
                  <div className="card-gradient-header">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">1</div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">Sub-Recipe</h2>
                        <p className="text-sm text-slate-500">Buat resep dasar (Opor Ayam, Bumbu Dasar, dll)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Nama Sub-Recipe:</label>
                      <input value={subRecipeName} onChange={e => setSubRecipeName(e.target.value)} placeholder="Contoh: Opor Ayam, Bumbu Dasar" className="input-field flex-1" />
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-3 py-3 text-center w-8">No</th>
                          <th className="px-3 py-3 min-w-[140px]">Nama Bahan</th>
                          <th className="px-3 py-3 w-20">Pemakaian</th>
                          <th className="px-3 py-3 w-16">Satuan</th>
                          <th className="px-3 py-3 w-24">Berat Bersih</th>
                          <th className="px-3 py-3 w-24">Berat Kotor</th>
                          <th className="px-3 py-3 w-28">Harga</th>
                          <th className="px-3 py-3 w-28 text-right">Cost</th>
                          <th className="px-3 py-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {subRecipeRows.map((r, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-primary-50/40 transition-colors">
                            <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                            <td className="px-2 py-1"><input value={r.name} onChange={e => updateSubRecipeRow(i, 'name', e.target.value)} placeholder="Nama bahan" className="input-field py-1.5" /></td>
                            <td className="px-2 py-1"><input type="number" value={r.usage || ''} onChange={e => updateSubRecipeRow(i, 'usage', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                            <td className="px-2 py-1"><input value={r.unit} onChange={e => updateSubRecipeRow(i, 'unit', e.target.value)} placeholder="sat" className="input-field py-1.5" /></td>
                            <td className="px-2 py-1"><input type="number" value={r.net_weight || ''} onChange={e => updateSubRecipeRow(i, 'net_weight', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                            <td className="px-2 py-1"><input type="number" value={r.gross_weight || ''} onChange={e => updateSubRecipeRow(i, 'gross_weight', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                            <td className="px-2 py-1"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={r.price || ''} onChange={e => updateSubRecipeRow(i, 'price', e.target.value)} placeholder="0" className="input-field py-1.5 pl-8" /></div></td>
                            <td className="px-3 py-2 text-right font-mono font-medium text-primary-600">{formatCurrency(r.cost_price)}</td>
                            <td className="px-2 py-1 text-center"><button onClick={() => deleteSubRecipeRow(i)} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"><TrashSmallIcon /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button onClick={addSubRecipeRow} className="btn-secondary text-sm"><PlusIcon />Tambah Baris</button>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-600">Total: <span className="font-bold text-primary-600">{formatCurrency(subRecipeTotal)}</span></div>
                      <button onClick={saveSubRecipe} className="btn-primary text-sm">Simpan Sub-Recipe</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricecalc' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-6">
                  <div className="card overflow-hidden">
                    <div className="card-gradient-header">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">2</div>
                          <div>
                            <h2 className="text-xl font-semibold text-slate-800">Bahan Baku (Food Cost)</h2>
                            <p className="text-sm text-slate-500">Kalkulasi biaya bahan untuk menu utama</p>
                          </div>
                        </div>
                        <button onClick={() => setShowProductModal(true)} className="btn-secondary text-sm"><SearchIcon />Cari Produk Lama</button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Nama Produk:</label>
                        <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="Contoh: Nasi Goreng Spesial" className="input-field w-auto py-1.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Porsi:</label>
                        <input type="number" min="1" value={portions} onChange={e => setPortions(parseInt(e.target.value) || 1)} className="input-field w-20 py-1.5" />
                      </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600 font-semibold">
                          <tr>
                            <th className="px-3 py-3 text-center w-8">No</th>
                            <th className="px-3 py-3 min-w-[160px]">Nama Bahan</th>
                            <th className="px-3 py-3 w-20">Pemakaian</th>
                            <th className="px-3 py-3 w-16">Satuan</th>
                            <th className="px-3 py-3 w-24">Berat Bersih</th>
                            <th className="px-3 py-3 w-24">Berat Kotor</th>
                            <th className="px-3 py-3 w-28">Harga</th>
                            <th className="px-3 py-3 w-28 text-right">Cost</th>
                            <th className="px-3 py-3 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {foodCostRows.map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-primary-50/40 transition-colors">
                              <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                              <td className="px-2 py-1"><input list="recipe-list" value={r.name} onChange={e => updateFoodCostRow(i, 'name', e.target.value)} placeholder="Ketik atau pilih" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><input type="number" value={r.usage || ''} onChange={e => updateFoodCostRow(i, 'usage', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><input value={r.unit} onChange={e => updateFoodCostRow(i, 'unit', e.target.value)} placeholder="sat" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><input type="number" value={r.net_weight || ''} onChange={e => updateFoodCostRow(i, 'net_weight', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><input type="number" value={r.gross_weight || ''} onChange={e => updateFoodCostRow(i, 'gross_weight', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={r.price || ''} onChange={e => updateFoodCostRow(i, 'price', e.target.value)} placeholder="0" className="input-field py-1.5 pl-8" /></div></td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-primary-600">{formatCurrency(r.cost_price)}</td>
                              <td className="px-2 py-1 text-center"><button onClick={() => deleteFoodCostRow(i)} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"><TrashSmallIcon /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <button onClick={addFoodCostRow} className="btn-secondary text-sm"><PlusIcon />Tambah Baris</button>
                      <button onClick={saveFoodCost} className="btn-secondary text-sm">Simpan Bahan Baku</button>
                    </div>
                  </div>

                  <datalist id="recipe-list">{savedRecipes.map(r => <option key={r.id} value={r.name} />)}</datalist>

                  <div className="card overflow-hidden">
                    <div className="card-gradient-header">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">3</div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-800">Tenaga Kerja</h2>
                          <p className="text-sm text-slate-500">Biaya operasional harian</p>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600 font-semibold">
                          <tr>
                            <th className="px-3 py-3 text-center w-8">No</th>
                            <th className="px-3 py-3 min-w-[150px]">Nama Pegawai</th>
                            <th className="px-3 py-3 w-32">Gaji</th>
                            <th className="px-3 py-3 w-20">Hari Kerja</th>
                            <th className="px-3 py-3 w-28 text-right">Cost/Hari</th>
                            <th className="px-3 py-3 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {laborRows.map((l, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-primary-50/40 transition-colors">
                              <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                              <td className="px-2 py-1"><input value={l.employee_name} onChange={e => updateLaborRow(i, 'employee_name', e.target.value)} placeholder="Nama Pegawai" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={l.salary || ''} onChange={e => updateLaborRow(i, 'salary', e.target.value)} placeholder="0" className="input-field py-1.5 pl-8" /></div></td>
                              <td className="px-2 py-1"><input type="number" value={l.work_days || ''} onChange={e => updateLaborRow(i, 'work_days', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-primary-600">{formatCurrency(l.cost_per_day)}</td>
                              <td className="px-2 py-1 text-center"><button onClick={() => deleteLaborRow(i)} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"><TrashSmallIcon /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <button onClick={addLaborRow} className="btn-secondary text-sm"><PlusIcon />Tambah Baris</button>
                      <button onClick={saveAllLabor} className="btn-primary text-sm">Simpan Tenaga Kerja</button>
                    </div>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="card-gradient-header">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">4</div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-800">Overhead</h2>
                          <p className="text-sm text-slate-500">Biaya tidak langsung</p>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600 font-semibold">
                          <tr>
                            <th className="px-3 py-3 text-center w-8">No</th>
                            <th className="px-3 py-3 min-w-[150px]">Nama Overhead</th>
                            <th className="px-3 py-3 w-32">Total Biaya</th>
                            <th className="px-3 py-3 w-20">Durasi (Hari)</th>
                            <th className="px-3 py-3 w-28 text-right">Cost/Hari</th>
                            <th className="px-3 py-3 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {overheadRows.map((o, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-primary-50/40 transition-colors">
                              <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                              <td className="px-2 py-1"><input value={o.name} onChange={e => updateOverheadRow(i, 'name', e.target.value)} placeholder="Nama Overhead" className="input-field py-1.5" /></td>
                              <td className="px-2 py-1"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={o.total_cost || ''} onChange={e => updateOverheadRow(i, 'total_cost', e.target.value)} placeholder="0" className="input-field py-1.5 pl-8" /></div></td>
                              <td className="px-2 py-1"><input type="number" value={o.duration_days || ''} onChange={e => updateOverheadRow(i, 'duration_days', e.target.value)} placeholder="0" className="input-field py-1.5" /></td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-primary-600">{formatCurrency(o.cost_per_day)}</td>
                              <td className="px-2 py-1 text-center"><button onClick={() => deleteOverheadRow(i)} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"><TrashSmallIcon /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <button onClick={addOverheadRow} className="btn-secondary text-sm"><PlusIcon />Tambah Baris</button>
                      <button onClick={saveAllOverhead} className="btn-primary text-sm">Simpan Overhead</button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={saveProduct} className="btn-primary text-base px-8 py-3 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Simpan Produk
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <div className="card overflow-hidden border-amber-100">
                      <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          Hasil Perhitungan
                        </h2>
                        <p className="text-amber-100 text-xs mt-1">Ringkasan biaya produksi</p>
                      </div>
                      <div className="p-5 space-y-3">
                        {[
                          { label: 'Biaya Bahan', value: calculations.foodCost },
                          { label: 'Tenaga Kerja', value: calculations.laborDaily },
                          { label: 'Overhead', value: calculations.overheadDaily },
                        ].map((f, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                            <span className="text-slate-600">{f.label}</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(f.value)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-3 bg-amber-50 -mx-5 px-5 rounded-b-lg">
                          <span className="font-semibold text-amber-900">Total</span>
                          <span className="font-bold text-lg text-amber-700">{formatCurrency(calculations.totalDaily)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card overflow-hidden border-rose-100">
                      <div className="px-5 py-4 bg-gradient-to-r from-rose-500 to-rose-600">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          HPP per Porsi
                        </h2>
                        <p className="text-rose-100 text-xs mt-1">HPP per unit/porsi</p>
                      </div>
                      <div className="p-5 text-center">
                        <div className="text-4xl font-bold text-rose-600 mb-1">{formatCurrency(calculations.hppPerUnit)}</div>
                        <p className="text-slate-500 text-xs">per {portions} porsi</p>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                          <div className="text-center">
                            <p className="text-slate-400">Min. Harga</p>
                            <p className="font-semibold text-amber-600">{formatCurrency(calculations.minPrice)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-400">Break Even</p>
                            <p className="font-semibold text-slate-700">{formatCurrency(calculations.hppPerUnit)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
                      <div className="px-5 py-4 bg-gradient-to-r from-primary-600 to-primary-700">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                          Rekomendasi Harga
                        </h2>
                        <p className="text-primary-100 text-xs mt-1">Tentukan margin keuntungan</p>
                      </div>
                      <div className="px-5 pb-2 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300 text-sm">Margin</span>
                          <span className="text-2xl font-bold text-amber-400">{marginPct}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={marginPct} onChange={e => setMarginPct(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-2">
                        <div className="bg-white/10 rounded-xl p-4">
                          <p className="text-slate-300 text-sm mb-1">Harga Jual Rekomendasi</p>
                          <p className="text-3xl font-bold text-white">{formatCurrency(calculations.sellingPrice)}</p>
                        </div>
                      </div>
                    </div>

                    {products.length > 0 && (
                      <div className="card overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                          <h3 className="font-semibold text-slate-700 text-sm">Produk Tersimpan</h3>
                        </div>
                        <div className="p-4 space-y-2">
                          {products.slice(-5).reverse().map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors text-sm">
                              <span className="font-medium text-slate-700">{p.name}</span>
                              <span className="text-amber-600 font-semibold">{formatCurrency(p.total_food_cost)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-slate-800">Pilih Produk Lama</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"><CloseIcon /></button>
            </div>
            <div className="modal-body">
              {products.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Belum ada produk tersimpan.</p>
              ) : (
                <div className="space-y-2">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-all">
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-sm text-slate-400">Total: Rp {formatCurrency(p.total_food_cost)}</p>
                      </div>
                      <button onClick={() => loadProductData(p)} className="btn-primary text-sm py-2">Pilih</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>&copy; 2026 UMKM Inventra. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Kebijakan Privasi</span>
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Syarat & Ketentuan</span>
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Bantuan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
