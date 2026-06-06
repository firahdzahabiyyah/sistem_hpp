import React, { useState, useEffect, useMemo } from 'react'
import api from './api'

const formatCurrency = (value) => {
  let locale = 'id-ID'
  try {
    locale = JSON.parse(localStorage.getItem('hpp_display_preferences'))?.currencyFormat || 'id-ID'
  } catch {
    locale = 'id-ID'
  }
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
}

const businessTypes = ['Kuliner', 'Jasa', 'Retail', 'Fashion', 'Kerajinan', 'Pertanian', 'Lainnya']
const businessStatuses = ['Pemilik Usaha', 'Reseller', 'Tidak Punya Usaha']

const emptyRegisterForm = {
  fullName: '',
  username: '',
  businessType: '',
  businessStatus: '',
  email: '',
  password: ''
}

const emptyLoginForm = {
  identifier: '',
  password: '',
  remember: true
}

const defaultDisplayPreferences = {
  theme: 'light',
  currencyFormat: 'id-ID',
  defaultMargin: 30
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthPage({ mode, onModeChange, onLogin, onRegister }) {
  const isRegister = mode === 'register'
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const authInputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const authLabelClass = 'text-sm font-semibold text-slate-700'

  const updateRegister = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const updateLogin = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleRegisterSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    Object.entries(registerForm).forEach(([field, value]) => {
      if (!String(value).trim()) nextErrors[field] = 'Field ini wajib diisi.'
    })
    if (registerForm.email && !emailPattern.test(registerForm.email)) {
      nextErrors.email = 'Format email belum benar.'
    }
    if (registerForm.password && registerForm.password.length < 6) {
      nextErrors.password = 'Kata sandi minimal 6 karakter.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    const result = onRegister(registerForm)
    if (result?.error) {
      setErrors({ username: result.error })
      return
    }
    setRegisterForm(emptyRegisterForm)
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!loginForm.identifier.trim()) nextErrors.identifier = 'Masukkan nama pengguna atau email.'
    if (!loginForm.password.trim()) nextErrors.password = 'Masukkan kata sandi.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    const result = onLogin(loginForm)
    if (result?.error) setErrors({ form: result.error })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-start justify-center">
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 sm:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-800">{isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun'}</h2>
              <p className="mt-2 text-sm text-slate-500">{isRegister ? 'Lengkapi data pengguna dan informasi usaha.' : 'Gunakan nama pengguna atau email yang sudah terdaftar.'}</p>
            </div>

            {isRegister ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                <div>
                  <label className={authLabelClass}>Nama Lengkap *</label>
                  <input value={registerForm.fullName} onChange={(e) => updateRegister('fullName', e.target.value)} className={`${authInputClass} mt-2`} placeholder="Nama lengkap" />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div>
                  <label className={authLabelClass}>Nama Pengguna *</label>
                  <input value={registerForm.username} onChange={(e) => updateRegister('username', e.target.value)} className={`${authInputClass} mt-2`} placeholder="misal: jali_kuliner" />
                  <p className="mt-1 text-xs text-slate-400">Nama Pengguna tidak dapat diubah setelah terdaftar</p>
                  {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>
                <div>
                  <label className={authLabelClass}>Jenis Usaha *</label>
                  <select value={registerForm.businessType} onChange={(e) => updateRegister('businessType', e.target.value)} className={`${authInputClass} mt-2`}>
                    <option value="">Pilih jenis usaha</option>
                    {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
                </div>
                <div>
                  <label className={authLabelClass}>Status Usaha *</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {businessStatuses.map((status) => (
                      <label key={status} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${registerForm.businessStatus === status ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}`}>
                        <input type="radio" name="businessStatus" value={status} checked={registerForm.businessStatus === status} onChange={(e) => updateRegister('businessStatus', e.target.value)} className="sr-only" />
                        {status}
                      </label>
                    ))}
                  </div>
                  {errors.businessStatus && <p className="mt-1 text-xs text-red-500">{errors.businessStatus}</p>}
                </div>
                <div>
                  <label className={authLabelClass}>Alamat Email *</label>
                  <input type="email" value={registerForm.email} onChange={(e) => updateRegister('email', e.target.value)} className={`${authInputClass} mt-2`} placeholder="nama@email.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className={authLabelClass}>Kata Sandi *</label>
                  <div className="relative mt-2">
                    <input type={showPassword ? 'text' : 'password'} value={registerForm.password} onChange={(e) => updateRegister('password', e.target.value)} className={`${authInputClass} pr-24`} placeholder="Minimal 6 karakter" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">{showPassword ? 'Sembunyikan' : 'Lihat'}</button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <button type="submit" className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-[0.99]">Daftar</button>
                <p className="text-center text-sm text-slate-500">Sudah punya akun? <button type="button" onClick={() => onModeChange('login')} className="font-semibold text-blue-600 hover:text-blue-700">Masuk di Sini</button></p>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                {errors.form && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.form}</div>}
                <div>
                  <label className={authLabelClass}>Nama Pengguna atau Email</label>
                  <input value={loginForm.identifier} onChange={(e) => updateLogin('identifier', e.target.value)} className={`${authInputClass} mt-2`} placeholder="username atau email" />
                  {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier}</p>}
                </div>
                <div>
                  <label className={authLabelClass}>Kata Sandi</label>
                  <div className="relative mt-2">
                    <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => updateLogin('password', e.target.value)} className={`${authInputClass} pr-24`} placeholder="Kata sandi" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">{showPassword ? 'Sembunyikan' : 'Lihat'}</button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" checked={loginForm.remember} onChange={(e) => updateLogin('remember', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Tetap Masuk
                  </label>
                  <button type="button" className="font-semibold text-blue-600 hover:text-blue-700">Lupa kata sandi?</button>
                </div>
                <button type="submit" className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-[0.99]">Masuk</button>
                <p className="text-center text-sm text-slate-500">Belum punya akun? <button type="button" onClick={() => onModeChange('register')} className="font-semibold text-blue-600 hover:text-blue-700">Daftar Sekarang</button></p>
              </form>
            )}
          </div>
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

  const profileInputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProfileErrors((current) => ({ ...current, avatarUrl: 'File harus berupa gambar.' }))
      return
    }
    if (file.size > 1024 * 1024) {
      setProfileErrors((current) => ({ ...current, avatarUrl: 'Ukuran gambar maksimal 1 MB.' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateProfileField('avatarUrl', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const saveProfile = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!profileForm.fullName.trim()) nextErrors.fullName = 'Nama lengkap wajib diisi.'
    if (!profileForm.businessName.trim()) nextErrors.businessName = 'Nama UMKM wajib diisi.'
    if (!profileForm.email.trim()) nextErrors.email = 'Email wajib diisi.'
    if (profileForm.email && !emailPattern.test(profileForm.email)) nextErrors.email = 'Format email belum benar.'
    if (!profileForm.businessType) nextErrors.businessType = 'Pilih jenis usaha.'
    if (!profileForm.businessStatus) nextErrors.businessStatus = 'Pilih status usaha.'
    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors)
      return
    }
    onUpdateProfile(profileForm)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profil UMKM</h1>
          <p className="text-slate-500 mt-1">Detail akun dan informasi usaha yang aktif.</p>
        </div>
        <button onClick={() => setIsEditing((value) => !value)} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100">
          {isEditing ? 'Batal Edit' : 'Edit Profil'}
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-blue-100">
              {profileForm.avatarUrl ? (
                <img src={profileForm.avatarUrl} alt="Foto profil" className="h-full w-full rounded-full object-cover" />
              ) : (
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.235.8 5.879 2.129M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-800">{businessName}</h2>
            <p className="text-sm text-slate-500">@{currentUser.username}</p>
            <span className="mt-4 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{currentUser.businessStatus}</span>
            {isEditing && (
              <div className="mt-5 w-full">
                <label className="block cursor-pointer rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100">
                  Ganti Foto Profil
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
                {profileForm.avatarUrl && (
                  <button type="button" onClick={() => updateProfileField('avatarUrl', '')} className="mt-2 text-sm font-semibold text-red-500 hover:text-red-600">
                    Hapus Foto
                  </button>
                )}
                {profileErrors.avatarUrl && <p className="mt-2 text-xs text-red-500">{profileErrors.avatarUrl}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          {isEditing ? (
            <form onSubmit={saveProfile} className="space-y-4" noValidate>
              <h2 className="text-xl font-semibold text-slate-800">Edit Informasi Akun</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nama Lengkap *</label>
                  <input value={profileForm.fullName} onChange={(e) => updateProfileField('fullName', e.target.value)} className={`${profileInputClass} mt-2`} />
                  {profileErrors.fullName && <p className="mt-1 text-xs text-red-500">{profileErrors.fullName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nama UMKM *</label>
                  <input value={profileForm.businessName} onChange={(e) => updateProfileField('businessName', e.target.value)} className={`${profileInputClass} mt-2`} />
                  {profileErrors.businessName && <p className="mt-1 text-xs text-red-500">{profileErrors.businessName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nama Pengguna</label>
                  <input value={currentUser.username} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Email *</label>
                  <input type="email" value={profileForm.email} onChange={(e) => updateProfileField('email', e.target.value)} className={`${profileInputClass} mt-2`} />
                  {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Jenis Usaha *</label>
                  <select value={profileForm.businessType} onChange={(e) => updateProfileField('businessType', e.target.value)} className={`${profileInputClass} mt-2`}>
                    <option value="">Pilih jenis usaha</option>
                    {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  {profileErrors.businessType && <p className="mt-1 text-xs text-red-500">{profileErrors.businessType}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Status Usaha *</label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {businessStatuses.map((status) => (
                    <label key={status} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${profileForm.businessStatus === status ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="profileBusinessStatus" value={status} checked={profileForm.businessStatus === status} onChange={(e) => updateProfileField('businessStatus', e.target.value)} className="sr-only" />
                      {status}
                    </label>
                  ))}
                </div>
                {profileErrors.businessStatus && <p className="mt-1 text-xs text-red-500">{profileErrors.businessStatus}</p>}
              </div>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700">
                Simpan Profil
              </button>
            </form>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Informasi Akun</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nama Lengkap</p>
                  <p className="mt-1 font-semibold text-slate-800">{currentUser.fullName}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nama UMKM</p>
                  <p className="mt-1 font-semibold text-slate-800">{businessName}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-1 font-semibold text-slate-800">{currentUser.email}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jenis Usaha</p>
                  <p className="mt-1 font-semibold text-slate-800">{currentUser.businessType}</p>
                </div>
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

  const settingInputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
    setPasswordErrors((current) => ({ ...current, [field]: '', form: '' }))
    setPasswordMessage('')
  }

  const updatePreferenceField = (field, value) => {
    setPreferenceForm((current) => ({ ...current, [field]: value }))
    setPreferenceMessage('')
  }

  const submitPassword = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!passwordForm.oldPassword.trim()) nextErrors.oldPassword = 'Kata sandi lama wajib diisi.'
    if (!passwordForm.newPassword.trim()) nextErrors.newPassword = 'Kata sandi baru wajib diisi.'
    if (passwordForm.newPassword && passwordForm.newPassword.length < 6) nextErrors.newPassword = 'Minimal 6 karakter.'
    if (!passwordForm.confirmPassword.trim()) nextErrors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.'
    if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi tidak sama.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      return
    }
    const result = onChangePassword(passwordForm)
    if (result?.error) {
      setPasswordErrors({ form: result.error })
      return
    }
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordMessage('Kata sandi berhasil diperbarui.')
  }

  const submitPreferences = (event) => {
    event.preventDefault()
    onSaveDisplayPreferences(preferenceForm)
    setPreferenceMessage('Preferensi tampilan berhasil disimpan.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-500 mt-1">Kelola keamanan akun, data lokal, dan preferensi tampilan.</p>
      </div>

      {!selectedSetting && (
        <div className="grid gap-4 md:grid-cols-3">
          <button type="button" onClick={() => setSelectedSetting('password')} className="rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-md transition-all hover:border-blue-300 hover:bg-blue-50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Edit Password</h2>
            <p className="mt-2 text-sm text-slate-500">Ganti kata sandi akun login.</p>
          </button>
          <button type="button" onClick={() => setSelectedSetting('reset')} className="rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-md transition-all hover:border-red-300 hover:bg-red-50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Reset Data Lokal</h2>
            <p className="mt-2 text-sm text-slate-500">Hapus session atau akun simulasi.</p>
          </button>
          <button type="button" onClick={() => setSelectedSetting('appearance')} className="rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-md transition-all hover:border-blue-300 hover:bg-blue-50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Preferensi Tampilan</h2>
            <p className="mt-2 text-sm text-slate-500">Pilih mode terang atau gelap.</p>
          </button>
        </div>
      )}

      {selectedSetting && (
        <button type="button" onClick={() => setSelectedSetting('')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50">
          Kembali ke Pengaturan
        </button>
      )}

      {selectedSetting === 'password' && (
        <form onSubmit={submitPassword} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md" noValidate>
          <h2 className="text-xl font-semibold text-slate-800">Edit Password</h2>
          <p className="mt-1 text-sm text-slate-500">Gunakan kata sandi lama untuk mengganti password akun {currentUser.username}.</p>
          {passwordErrors.form && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{passwordErrors.form}</div>}
          {passwordMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</div>}
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Kata sandi lama</label>
              <input type="password" value={passwordForm.oldPassword} onChange={(e) => updatePasswordField('oldPassword', e.target.value)} className={`${settingInputClass} mt-2`} />
              {passwordErrors.oldPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Kata sandi baru</label>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => updatePasswordField('newPassword', e.target.value)} className={`${settingInputClass} mt-2`} />
              {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Konfirmasi kata sandi</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => updatePasswordField('confirmPassword', e.target.value)} className={`${settingInputClass} mt-2`} />
              {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
            </div>
          </div>
          <button type="submit" className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700">
            Simpan Password
          </button>
        </form>
      )}

      {selectedSetting === 'appearance' && (
        <form onSubmit={submitPreferences} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md" noValidate>
          <h2 className="text-xl font-semibold text-slate-800">Preferensi Tampilan</h2>
          <p className="mt-1 text-sm text-slate-500">Simpan pilihan tampilan untuk dipakai saat membuka aplikasi berikutnya.</p>
          {preferenceMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{preferenceMessage}</div>}
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Mode Tampilan</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: 'light', label: 'Terang' },
                  { value: 'dark', label: 'Gelap' }
                ].map((option) => (
                  <label key={option.value} className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${preferenceForm.theme === option.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                    <input type="radio" name="theme" value={option.value} checked={preferenceForm.theme === option.value} onChange={(e) => updatePreferenceField('theme', e.target.value)} className="sr-only" />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700">
            Simpan Preferensi
          </button>
        </form>
      )}

      {selectedSetting === 'reset' && (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-slate-800">Reset Data Lokal</h2>
        <p className="mt-1 text-sm text-slate-500">Data akun simulasi disimpan di LocalStorage browser ini.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onClearSession} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
            Hapus Session Login
          </button>
          <button type="button" onClick={onClearAllUsers} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-700">
            Hapus Semua Akun Simulasi
          </button>
        </div>
      </div>
      )}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hpp_current_user')) || null
    } catch {
      return null
    }
  })
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [displayPreferences, setDisplayPreferences] = useState(() => {
    try {
      return { ...defaultDisplayPreferences, ...(JSON.parse(localStorage.getItem('hpp_display_preferences')) || {}) }
    } catch {
      return defaultDisplayPreferences
    }
  })

  const [subRecipeRows, setSubRecipeRows] = useState([
    { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }
  ])
  const [subRecipeName, setSubRecipeName] = useState('')

  const [foodCostRows, setFoodCostRows] = useState([
    { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }
  ])
  const [productName, setProductName] = useState('')
  const [portions, setPortions] = useState(1)

  const [savedRecipes, setSavedRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [laborRows, setLaborRows] = useState([
    { employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }
  ])
  const [overheadRows, setOverheadRows] = useState([
    { name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }
  ])
  const [marginPct, setMarginPct] = useState(() => {
    try {
      const storedPreferences = JSON.parse(localStorage.getItem('hpp_display_preferences')) || {}
      return parseInt(storedPreferences.defaultMargin) || 30
    } catch {
      return 30
    }
  })
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
    if (product.details && product.details.length > 0) {
      const details = product.details.map(d => ({
        name: d.name || '',
        usage: d.usage || 0,
        unit: d.unit || '',
        net_weight: d.net_weight || 0,
        gross_weight: d.gross_weight || 0,
        price: d.price || 0,
        cost_price: d.cost_price || 0
      }))
      setFoodCostRows(details)
    }
    setShowProductModal(false)
  }

  const resetAllRecipes = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua resep dasar?')) return
    try {
      const recipes = await api.getRecipes()
      for (const r of recipes) {
        await fetch(`http://localhost:4000/api/recipes/${r.id}`, { method: 'DELETE' })
      }
      setSavedRecipes([])
      alert('Semua resep dasar telah dihapus!')
    } catch (e) {
      alert('Gagal menghapus: ' + e.message)
    }
  }

  useEffect(() => {
    api.getRecipes().then(setSavedRecipes).catch(() => [])
    api.getProducts().then(setProducts).catch(() => [])
    api.getLabor().then((data) => {
      if (!data || data.length === 0) { setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }]) }
      else { setLaborRows(data) }
    }).catch(() => setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }]))
    api.getOverheads().then((data) => {
      if (!data || data.length === 0) { setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }]) }
      else { setOverheadRows(data) }
    }).catch(() => setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }]))
    api.getInventory().then(setInventoryRows).catch(() => [])
    api.getSalesHistory().then(setSalesHistory).catch(() => [])
  }, [])

  const updateSubRecipeRow = (i, field, val) => {
    const copy = [...subRecipeRows]
    if (field === 'name' || field === 'unit') {
      copy[i][field] = val
    } else {
      copy[i][field] = parseFloat(val) || 0
    }
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
    if (matchedRecipe) {
      copy[i].price = matchedRecipe.total_cost || 0
      copy[i].cost_price = matchedRecipe.total_cost || 0
    } else {
      copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    }
    setFoodCostRows(copy)
  }

  const updateFoodCostRow = (i, field, val) => {
    const copy = [...foodCostRows]
    if (field === 'name') { handleFoodCostNameChange(i, val); return }
    if (field === 'unit') { copy[i][field] = val }
    else { copy[i][field] = parseFloat(val) || 0 }
    copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setFoodCostRows(copy)
  }

  const addFoodCostRow = () => setFoodCostRows([...foodCostRows, { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const deleteFoodCostRow = (i) => setFoodCostRows(foodCostRows.filter((_, idx) => idx !== i))

  const saveFoodCost = async () => {
    if (!productName.trim()) { alert('Masukkan nama produk!'); return }
    alert('Bahan Baku tersimpan!')
  }

  const updateLaborRow = (i, field, val) => {
    const copy = [...laborRows]
    if (field === 'employee_name') { copy[i][field] = val }
    else if (field === 'work_days') { copy[i][field] = parseInt(val) || 1 }
    else { copy[i][field] = parseFloat(val) || 0 }
    copy[i].cost_per_day = copy[i].work_days > 0 ? copy[i].salary / copy[i].work_days : 0
    setLaborRows(copy)
  }

  const addLaborRow = () => setLaborRows([...laborRows, { employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }])
  const deleteLaborRow = async (i) => {
    const labor = laborRows[i]
    if (labor && labor.id) {
      try {
        await api.deleteLabor(labor.id)
      } catch (e) {
        console.error('Delete labor error:', e)
      }
    }
    const newRows = laborRows.filter((_, idx) => idx !== i)
    if (newRows.length === 0) {
      setLaborRows([{ employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }])
    } else {
      setLaborRows(newRows)
    }
  }

  const saveAllLabor = async () => {
    try {
      for (const labor of laborRows) {
        if (labor.employee_name && labor.salary > 0) {
          if (labor.id) await api.updateLabor(labor.id, labor)
          else await api.createLabor(labor)
        }
      }
      api.getLabor().then(setLaborRows).catch(() => [])
      alert('Tenaga Kerja tersimpan!')
    } catch (e) { alert('Gagal: ' + e.message) }
  }

  const updateOverheadRow = (i, field, val) => {
    const copy = [...overheadRows]
    if (field === 'name') { copy[i][field] = val }
    else if (field === 'duration_days') { copy[i][field] = parseInt(val) || 1 }
    else { copy[i][field] = parseFloat(val) || 0 }
    copy[i].cost_per_day = copy[i].duration_days > 0 ? copy[i].total_cost / copy[i].duration_days : 0
    setOverheadRows(copy)
  }

  const addOverheadRow = () => setOverheadRows([...overheadRows, { name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }])
  const deleteOverheadRow = (i) => setOverheadRows(overheadRows.filter((_, idx) => idx !== i))

  const saveAllOverhead = async () => {
    try {
      for (const overhead of overheadRows) {
        if (overhead.name && overhead.total_cost > 0) {
          if (overhead.id) await api.updateOverhead(overhead.id, overhead)
          else await api.createOverhead(overhead)
        }
      }
      api.getOverheads().then(setOverheadRows).catch(() => [])
      alert('Overhead tersimpan!')
    } catch (e) { alert('Gagal: ' + e.message) }
  }

  const saveProduct = async () => {
    if (!productName.trim()) { alert('Masukkan nama produk!'); return }
    const validDetails = foodCostRows.filter(r => r.name && r.name.trim() !== '')
    if (validDetails.length === 0) { alert('Masukkan minimal 1 bahan baku!'); return }
    console.log('Saving product:', { name: productName, portions, details: validDetails })
    const payload = { name: productName, details: validDetails, portions }
    try {
      const res = await api.createProduct(payload)
      console.log('Product saved result:', res)
      alert(`Produk "${productName}" tersimpan! Total: Rp ${formatCurrency(res.total)}`)
      setProductName('')
      setPortions(1)
      setFoodCostRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getProducts().then(setProducts).catch(() => [])
    } catch (e) { alert('Gagal: ' + (e.message || e)) }
  }

  const readStoredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('hpp_users')) || []
    } catch {
      return []
    }
  }

  const handleRegister = (form) => {
    const users = readStoredUsers()
    const usernameExists = users.some((user) => user.username.toLowerCase() === form.username.toLowerCase())
    const emailExists = users.some((user) => user.email.toLowerCase() === form.email.toLowerCase())
    if (usernameExists) return { error: 'Nama pengguna sudah terdaftar.' }
    if (emailExists) return { error: 'Email sudah terdaftar.' }
    const newUser = {
      ...form,
      id: Date.now(),
      businessName: form.businessStatus === 'Tidak Punya Usaha' ? form.fullName : form.username
    }
    const nextUsers = [...users, newUser]
    localStorage.setItem('hpp_users', JSON.stringify(nextUsers))
    localStorage.setItem('hpp_current_user', JSON.stringify(newUser))
    setCurrentUser(newUser)
    setAuthMode('login')
    setActiveTab('dashboard')
    return { success: true }
  }

  const handleLogin = (form) => {
    const users = readStoredUsers()
    const identifier = form.identifier.toLowerCase()
    const matchedUser = users.find((user) => {
      return (user.username.toLowerCase() === identifier || user.email.toLowerCase() === identifier) && user.password === form.password
    })
    if (!matchedUser) return { error: 'Akun tidak ditemukan atau kata sandi salah.' }
    setCurrentUser(matchedUser)
    if (form.remember) localStorage.setItem('hpp_current_user', JSON.stringify(matchedUser))
    else localStorage.removeItem('hpp_current_user')
    setActiveTab('dashboard')
    return { success: true }
  }

  const handleLogout = () => {
    localStorage.removeItem('hpp_current_user')
    setCurrentUser(null)
    setShowProfileMenu(false)
    setAuthMode('login')
    setActiveTab('auth')
  }

  const handleUpdateProfile = (profileForm) => {
    const updatedUser = { ...currentUser, ...profileForm }
    const users = readStoredUsers()
    const nextUsers = users.map((user) => user.id === currentUser.id ? updatedUser : user)
    localStorage.setItem('hpp_users', JSON.stringify(nextUsers))
    localStorage.setItem('hpp_current_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  const handleChangePassword = ({ oldPassword, newPassword }) => {
    if (currentUser.password !== oldPassword) return { error: 'Kata sandi lama tidak sesuai.' }
    const updatedUser = { ...currentUser, password: newPassword }
    const users = readStoredUsers()
    const nextUsers = users.map((user) => user.id === currentUser.id ? updatedUser : user)
    localStorage.setItem('hpp_users', JSON.stringify(nextUsers))
    localStorage.setItem('hpp_current_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
    return { success: true }
  }

  const handleClearSession = () => {
    if (!window.confirm('Hapus session login saat ini?')) return
    handleLogout()
  }

  const handleClearAllUsers = () => {
    if (!window.confirm('Hapus semua akun simulasi dari LocalStorage browser ini?')) return
    localStorage.removeItem('hpp_users')
    localStorage.removeItem('hpp_current_user')
    setCurrentUser(null)
    setShowProfileMenu(false)
    setAuthMode('login')
    setActiveTab('auth')
  }

  const handleSaveDisplayPreferences = (preferences) => {
    const normalizedPreferences = {
      theme: preferences.theme,
      currencyFormat: preferences.currencyFormat,
      defaultMargin: Math.min(100, Math.max(0, parseInt(preferences.defaultMargin) || 0))
    }
    localStorage.setItem('hpp_display_preferences', JSON.stringify(normalizedPreferences))
    setDisplayPreferences(normalizedPreferences)
    setMarginPct(normalizedPreferences.defaultMargin)
  }

  const calculations = useMemo(() => {
    const foodCost = foodCostRows.reduce((s, r) => s + (r.cost_price || 0), 0)
    const laborDaily = laborRows.reduce((s, l) => s + (l.cost_per_day || 0), 0)
    const overheadDaily = overheadRows.reduce((s, o) => s + (o.cost_per_day || 0), 0)
    const totalDaily = foodCost + laborDaily + overheadDaily
    const portion = portions > 0 ? portions : 1
    const hppPerUnit = portion > 0 ? totalDaily / portion : 0
    const minPrice = hppPerUnit * 1.1
    const sellingPrice = hppPerUnit * (1 + marginPct / 100)
    return { foodCost, laborDaily, overheadDaily, totalDaily, hppPerUnit, minPrice, sellingPrice }
  }, [foodCostRows, laborRows, overheadRows, portions, marginPct])

  const subRecipeTotal = subRecipeRows.reduce((s, r) => s + (r.cost_price || 0), 0)

  return (
    <div className={`flex flex-col min-h-screen font-sans ${displayPreferences.theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-jali.png" alt="Logo Mie Ayam Ceker Jali-Jali" className="h-10 w-auto" />
              <span className="text-xl font-bold text-slate-800">Mie Ayam Ceker Jali-Jali</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('sales')} className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${activeTab === 'sales' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Laporan Penjualan</button>
              <button onClick={() => setActiveTab('stock')} className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${activeTab === 'stock' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Manajemen Stok</button>
              <button onClick={() => setActiveTab('subrecipe')} className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${activeTab === 'subrecipe' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Sub-Recipe</button>
              <button onClick={() => setActiveTab('pricecalc')} className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${activeTab === 'pricecalc' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Perhitungan Harga Jual</button>
              {currentUser ? (
                <div className="relative ml-2">
                  <button onClick={() => setShowProfileMenu((value) => !value)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50">
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Foto profil" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.235.8 5.879 2.129M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </span>
                    <span className="max-w-[140px] truncate">{currentUser.businessName || currentUser.username}</span>
                    <svg className={`h-4 w-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                      <button onClick={() => { setActiveTab('profile'); setShowProfileMenu(false) }} className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-700">Profil UMKM</button>
                      <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false) }} className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-700">Pengaturan</button>
                      <button onClick={handleLogout} className="block w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-red-600 transition-all hover:bg-red-50">Keluar</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => { setAuthMode('login'); setActiveTab('auth') }} className={`ml-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${activeTab === 'auth' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Login</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {activeTab === 'auth' && (
          <AuthPage
            mode={authMode}
            onModeChange={setAuthMode}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {activeTab === 'profile' && currentUser && (
          <ProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
        )}

        {activeTab === 'settings' && currentUser && (
          <SettingsPage
            currentUser={currentUser}
            displayPreferences={displayPreferences}
            onChangePassword={handleChangePassword}
            onClearSession={handleClearSession}
            onClearAllUsers={handleClearAllUsers}
            onSaveDisplayPreferences={handleSaveDisplayPreferences}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 mt-1">Ringkasan data kalkulator HPP</p>
              </div>
              {savedRecipes.length > 0 && (
                <button onClick={resetAllRecipes} className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg font-medium hover:bg-blue-200 transition-all text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Reset Semua Resep Dasar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Resep Dasar</p>
                    <p className="text-3xl font-bold text-slate-800">{savedRecipes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Produk Menu</p>
                    <p className="text-3xl font-bold text-slate-800">{products.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Tenaga Kerja</p>
                    <p className="text-3xl font-bold text-slate-800">{laborRows.filter(l => l.employee_name).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Overhead</p>
                    <p className="text-3xl font-bold text-slate-800">{overheadRows.filter(o => o.name).length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Produk Terakhir Disimpan</h3>
              {products.length === 0 ? (
                <p className="text-slate-500">Belum ada produk tersimpan.</p>
              ) : (
                <div className="space-y-2">
                  {products.slice(-5).reverse().map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{p.name}</span>
                      <span className="text-amber-600 font-semibold">{formatCurrency(p.total_food_cost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Laporan Penjualan</h1>
              <p className="text-slate-500 mt-1">Catat penjualan harian dan lihat laporan keuangan</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800">Input Penjualan Harian</h2>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-600">Tanggal:</label>
                    <input type="date" value={salesDate} onChange={e => { setSalesDate(e.target.value); api.getSalesSummary(e.target.value).then(setSalesSummary).catch(() => {}); api.getSales(e.target.value).then(setSalesRows).catch(() => []) }} className="px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                    <select value={selectedProductId} onChange={async e => {
                      const id = e.target.value; setSelectedProductId(id);
                      if (!id) { setSelectedProduct(''); setProductHpp(null); return }
                      const p = products.find(x => x.id === parseInt(id));
                      if (p) { setSelectedProduct(p.name); }
                      const hpp = await api.getProductHPP(id);
                      if (hpp && hpp.hpp) setProductHpp(hpp); else setProductHpp(null)
                    }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                      <option value="">-- Pilih Produk --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual / Porsi</label>
                    <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-semibold text-blue-700">
                      {productHpp ? formatCurrency(productHpp.hpp) : (selectedProductId ? <span className="text-amber-600 text-xs">Hitung HPP dulu!</span> : '-')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal (Porsi)</label>
                    <input type="number" min="0" value={stokAwal} onChange={e => setStokAwal(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stok Akhir / Sisa</label>
                    <input type="number" min="0" value={stokAkhir} onChange={e => setStokAkhir(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Porsi Terjual</p>
                    <p className="text-2xl font-bold text-blue-700">{(parseInt(stokAwal) || 0) - (parseInt(stokAkhir) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(((parseInt(stokAwal)||0) - (parseInt(stokAkhir)||0)) * (productHpp?.hpp||0))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Estimasi Keuntungan</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(((parseInt(stokAwal)||0) - (parseInt(stokAkhir)||0)) * (productHpp?.hpp||0) * 0.3)}</p>
                  </div>
                </div>
                <button onClick={async () => {
                  if (!selectedProductId) { alert('Pilih produk!'); return }
                  const hppVal = productHpp?.hpp || 0;
                  if (!hppVal) { alert('Produk belum dihitung HPP! Hitung dulu di Perhitungan Harga Jual.'); return }
                  const terjual = (parseInt(stokAwal)||0) - (parseInt(stokAkhir)||0)
                  if (terjual <= 0) { alert('Stok terjual harus lebih dari 0!'); return }
                  try {
                    await api.createSale({ date: salesDate, productId: parseInt(selectedProductId), productName: selectedProduct, stok_awal: stokAwal, stok_akhir: stokAkhir, harga_per_porsi: hppVal })
                    alert('Penjualan tersimpan!')
                    setStokAwal(0); setStokAkhir(0); setSelectedProductId(''); setSelectedProduct(''); setProductHpp(null)
                    api.getSales(salesDate).then(setSalesRows).catch(() => [])
                    api.getSalesSummary(salesDate).then(setSalesSummary).catch(() => {})
                    api.getSalesHistory().then(setSalesHistory).catch(() => [])
                  } catch (e) { alert('Gagal: ' + e.message) }
                }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md text-sm">Simpan Penjualan Hari Ini</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Riwayat Penjualan ({salesDate})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2 text-center w-8">No</th>
                      <th className="px-3 py-2">Produk</th>
                      <th className="px-3 py-2 text-center w-16">Stok Awal</th>
                      <th className="px-3 py-2 text-center w-16">Stok Akhir</th>
                      <th className="px-3 py-2 text-center w-16">Terjual</th>
                      <th className="px-3 py-2 text-right w-24">Harga</th>
                      <th className="px-3 py-2 text-right w-28">Pendapatan</th>
                      <th className="px-3 py-2 text-right w-28">Keuntungan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesRows.length === 0 ? (
                      <tr><td colSpan="8" className="px-3 py-8 text-center text-slate-400">Belum ada penjualan hari ini</td></tr>
                    ) : salesRows.map((s, i) => (
                      <tr key={s.id || i} className="border-b border-slate-100 hover:bg-blue-50/30">
                        <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-700">{s.productName}</td>
                        <td className="px-3 py-2 text-center">{s.stok_awal}</td>
                        <td className="px-3 py-2 text-center">{s.stok_akhir}</td>
                        <td className="px-3 py-2 text-center font-semibold">{s.porsi_terjual}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(s.harga_per_porsi)}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-600">{formatCurrency(s.total_pendapatan)}</td>
                        <td className="px-3 py-2 text-right font-mono text-amber-600">{formatCurrency(s.estimasi_keuntungan)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Manajemen Stok & Prediksi</h1>
              <p className="text-slate-500 mt-1">Kelola stok bahan baku dan prediksi kebutuhan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                  <h2 className="text-lg font-semibold text-slate-800">Tambah / Edit Stok Bahan</h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={inventoryForm.name} onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})} placeholder="Nama bahan" className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <input value={inventoryForm.unit} onChange={e => setInventoryForm({...inventoryForm, unit: e.target.value})} placeholder="Satuan (Kg, Porsi, Gram)" className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <input type="number" min="0" value={inventoryForm.current_stock} onChange={e => setInventoryForm({...inventoryForm, current_stock: parseFloat(e.target.value) || 0})} placeholder="Stok Saat Ini" className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <input type="number" min="0" value={inventoryForm.min_stock} onChange={e => setInventoryForm({...inventoryForm, min_stock: parseFloat(e.target.value) || 0})} placeholder="Minimal Stok" className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <button onClick={async () => {
                    if (!inventoryForm.name.trim()) { alert('Nama bahan wajib diisi!'); return }
                    try {
                      await api.saveInventory(inventoryForm)
                      alert('Stok tersimpan!')
                      setInventoryForm({ name: '', unit: '', current_stock: 0, min_stock: 0 })
                      api.getInventory().then(setInventoryRows).catch(() => [])
                    } catch (e) { alert('Gagal: ' + e.message) }
                  }} className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm">Simpan Stok</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                  <h2 className="text-lg font-semibold text-slate-800">Prediksi Kebutuhan Stok</h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="text-sm font-medium text-slate-700">Pilih Tanggal:</label>
                    <input type="date" value={forecastDate} onChange={e => setForecastDate(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    <button onClick={async () => {
                      try {
                        const result = await api.getForecast(forecastDate)
                        setForecastResult(result)
                      } catch (e) { alert('Gagal: ' + e.message) }
                    }} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all text-sm">Prediksi</button>
                  </div>
                  {forecastResult && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-slate-600">Berdasarkan histori data penjualan, pada tanggal <strong>{forecastResult.day}/{forecastResult.month}</strong> disarankan:</p>
                      <p className="text-2xl font-bold text-amber-700 mt-2">{forecastResult.recommended_stock} porsi</p>
                      <p className="text-xs text-slate-500 mt-1">Data historis: {forecastResult.historical_data_points} titik data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Daftar Stok Bahan Baku</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2 text-center w-8">No</th>
                      <th className="px-3 py-2">Nama Bahan</th>
                      <th className="px-3 py-2 text-center w-20">Stok Saat Ini</th>
                      <th className="px-3 py-2 text-center w-16">Satuan</th>
                      <th className="px-3 py-2 text-center w-20">Min. Stok</th>
                      <th className="px-3 py-2 text-center w-28">Status</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRows.length === 0 ? (
                      <tr><td colSpan="7" className="px-3 py-8 text-center text-slate-400">Belum ada data stok</td></tr>
                    ) : inventoryRows.map((item, i) => {
                      const ratio = item.min_stock > 0 ? item.current_stock / item.min_stock : 99
                      let status, statusClass
                      if (item.current_stock <= 0) { status = 'Berbahaya'; statusClass = 'bg-red-100 text-red-700' }
                      else if (ratio <= 1) { status = 'Hampir Habis'; statusClass = 'bg-amber-100 text-amber-700' }
                      else { status = 'Aman'; statusClass = 'bg-emerald-100 text-emerald-700' }
                      return (
                        <tr key={item.id || i} className="border-b border-slate-100 hover:bg-blue-50/30">
                          <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-slate-700">{item.name}</td>
                          <td className="px-3 py-2 text-center font-semibold">{item.current_stock}</td>
                          <td className="px-3 py-2 text-center text-slate-500">{item.unit}</td>
                          <td className="px-3 py-2 text-center">{item.min_stock}</td>
                          <td className="px-3 py-2 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>{status}</span></td>
                          <td className="px-1 py-1"><button onClick={async () => { if (!window.confirm('Hapus?')) return; try { await api.deleteInventory(item.id); api.getInventory().then(setInventoryRows) } catch(e) { alert(e.message) } }} className="text-red-500 hover:text-red-700 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
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
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">1</div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Sub-Recipe</h2>
                  <p className="text-sm text-slate-500">Buat resep dasar (Opor Ayam, Bumbu Dasar, dll)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Nama Sub-Recipe:</label>
                <input value={subRecipeName} onChange={(e) => setSubRecipeName(e.target.value)} placeholder="Contoh: Opor Ayam, Bumbu Dasar" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-2 py-2 text-center w-8">No</th>
                    <th className="px-2 py-2 min-w-[140px]">Nama Bahan</th>
                    <th className="px-2 py-2 w-16">Pemakaian</th>
                    <th className="px-2 py-2 w-14">Satuan</th>
                    <th className="px-2 py-2 w-20">Berat Bersih</th>
                    <th className="px-2 py-2 w-20">Berat Kotor</th>
                    <th className="px-2 py-2 w-24">Harga</th>
                    <th className="px-2 py-2 w-24 text-right">Cost</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {subRecipeRows.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30">
                      <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                      <td className="px-1 py-1"><input value={r.name} onChange={(e) => updateSubRecipeRow(i, 'name', e.target.value)} placeholder="Nama bahan" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-1 py-1"><input type="number" value={r.usage} onChange={(e) => updateSubRecipeRow(i, 'usage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-1 py-1"><input value={r.unit} onChange={(e) => updateSubRecipeRow(i, 'unit', e.target.value)} placeholder="sat" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-1 py-1"><input type="number" value={r.net_weight} onChange={(e) => updateSubRecipeRow(i, 'net_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-1 py-1"><input type="number" value={r.gross_weight} onChange={(e) => updateSubRecipeRow(i, 'gross_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={r.price} onChange={(e) => updateSubRecipeRow(i, 'price', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></div></td>
                      <td className="px-2 py-2 text-right font-mono font-medium text-blue-700">{formatCurrency(r.cost_price)}</td>
                      <td className="px-1 py-1"><button onClick={() => deleteSubRecipeRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button onClick={addSubRecipeRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Tambah Baris
              </button>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">Total: <span className="font-bold text-blue-700">{formatCurrency(subRecipeTotal)}</span></div>
                <button onClick={saveSubRecipe} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md text-sm">Simpan Sub-Recipe</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricecalc' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">2</div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Bahan Baku (Food Cost)</h2>
                      <p className="text-sm text-slate-500">Kalkulasi biaya bahan untuk menu utama</p>
                    </div>
                  </div>
                  <button onClick={() => setShowProductModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Cari Produk Lama
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Nama Produk:</label>
                  <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Mie Ayam" className="px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Porsi:</label>
                  <input type="number" min="1" value={portions} onChange={(e) => setPortions(parseInt(e.target.value) || 1)} className="w-16 px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-2 py-2 text-center w-8">No</th>
                      <th className="px-2 py-2 min-w-[180px]">Nama Bahan</th>
                      <th className="px-2 py-2 w-16">Pemakaian</th>
                      <th className="px-2 py-2 w-14">Satuan</th>
                      <th className="px-2 py-2 w-20">Berat Bersih</th>
                      <th className="px-2 py-2 w-20">Berat Kotor</th>
                      <th className="px-2 py-2 w-24">Harga</th>
                      <th className="px-2 py-2 w-24 text-right">Cost</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodCostRows.map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30">
                        <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                        <td className="px-1 py-1"><input list="recipe-list" value={r.name} onChange={(e) => updateFoodCostRow(i, 'name', e.target.value)} placeholder="Ketik atau pilih" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-1 py-1"><input type="number" value={r.usage} onChange={(e) => updateFoodCostRow(i, 'usage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-1 py-1"><input value={r.unit} onChange={(e) => updateFoodCostRow(i, 'unit', e.target.value)} placeholder="sat" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-1 py-1"><input type="number" value={r.net_weight} onChange={(e) => updateFoodCostRow(i, 'net_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-1 py-1"><input type="number" value={r.gross_weight} onChange={(e) => updateFoodCostRow(i, 'gross_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={r.price} onChange={(e) => updateFoodCostRow(i, 'price', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></div></td>
                        <td className="px-2 py-2 text-right font-mono font-medium text-blue-700">{formatCurrency(r.cost_price)}</td>
                        <td className="px-1 py-1"><button onClick={() => deleteFoodCostRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button onClick={addFoodCostRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Tambah Baris
                </button>
                <button onClick={saveFoodCost} className="px-5 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg font-medium hover:bg-blue-200 transition-all text-sm">Simpan Bahan Baku</button>
              </div>
            </div>

            <datalist id="recipe-list">
              {savedRecipes.map(r => <option key={r.id} value={r.name} />)}
            </datalist>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">3</div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Tenaga Kerja</h2>
                    <p className="text-sm text-slate-500">Biaya operasional harian</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-2 py-2 text-center w-8">No</th>
                      <th className="px-2 py-2 min-w-[160px]">Nama Pegawai</th>
                      <th className="px-2 py-2 w-28">Gaji</th>
                      <th className="px-2 py-2 w-16">Hari Kerja</th>
                      <th className="px-2 py-2 w-24 text-right">Cost/Hari</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {laborRows.map((l, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30">
                        <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                        <td className="px-1 py-1"><input value={l.employee_name} onChange={(e) => updateLaborRow(i, 'employee_name', e.target.value)} placeholder="Nama Pegawai" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={l.salary} onChange={(e) => updateLaborRow(i, 'salary', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></div></td>
                        <td className="px-1 py-1"><input type="number" value={l.work_days} onChange={(e) => updateLaborRow(i, 'work_days', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                        <td className="px-2 py-2 text-right font-mono font-medium text-blue-700">{formatCurrency(l.cost_per_day)}</td>
                        <td className="px-1 py-1"><button onClick={() => deleteLaborRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button onClick={addLaborRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Tambah Baris
                </button>
                <button onClick={saveAllLabor} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md text-sm">Simpan Tenaga Kerja</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">4</div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Overhead</h2>
                    <p className="text-sm text-slate-500">Biaya tidak langsung</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-2 py-2 text-center w-8">No</th>
                      <th className="px-2 py-2 min-w-[160px]">Nama Overhead</th>
                      <th className="px-2 py-2 w-28">Total Biaya</th>
                      <th className="px-2 py-2 w-16">Durasi (Hari)</th>
                      <th className="px-2 py-2 w-24 text-right">Cost/Hari</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {overheadRows.map((o, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-violet-50/30">
                        <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                        <td className="px-1 py-1"><input value={o.name} onChange={(e) => updateOverheadRow(i, 'name', e.target.value)} placeholder="Nama Overhead" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none" /></td>
                        <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={o.total_cost} onChange={(e) => updateOverheadRow(i, 'total_cost', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none" /></div></td>
                        <td className="px-1 py-1"><input type="number" value={o.duration_days} onChange={(e) => updateOverheadRow(i, 'duration_days', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none" /></td>
                        <td className="px-2 py-2 text-right font-mono font-medium text-violet-700">{formatCurrency(o.cost_per_day)}</td>
                        <td className="px-1 py-1"><button onClick={() => deleteOverheadRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button onClick={addOverheadRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-violet-50 hover:border-violet-300 transition-all flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Tambah Baris
                </button>
                <button onClick={saveAllOverhead} className="px-5 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-all shadow-md text-sm">Simpan Overhead</button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={saveProduct} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-lg">
                Simpan Produk
              </button>
            </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
                  <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      Hasil Perhitungan
                    </h2>
                    <p className="text-amber-100 text-xs mt-1">Ringkasan biaya produksi</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600">Biaya Bahan</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(calculations.foodCost)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600">Tenaga Kerja</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(calculations.laborDaily)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600">Overhead</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(calculations.overheadDaily)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-amber-50 -mx-5 px-5 rounded-b-xl">
                      <span className="font-semibold text-amber-900">Total</span>
                      <span className="font-bold text-lg text-amber-700">{formatCurrency(calculations.totalDaily)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
                  <div className="p-5 bg-gradient-to-br from-rose-500 to-rose-600">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      HPP per Porsi
                    </h2>
                     <p className="text-amber-100 text-xs mt-1">HPP per unit/porsi</p>
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

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                      Rekomendasi Harga
                    </h2>
                   <p className="text-amber-100 text-xs mt-1">Tentukan margin keuntungan</p>
                  </div>
                  <div className="px-5 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">Margin</span>
                      <span className="text-2xl font-bold text-amber-400">{marginPct}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={marginPct} onChange={(e) => setMarginPct(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                  </div>
                  <div className="p-5 pt-3">
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                      <p className="text-slate-300 text-sm mb-1">Harga Jual</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(calculations.sellingPrice)}</p>
                    </div>
                  </div>
                </div>

                {products.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-slate-700 text-sm">Produk Tersimpan</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {products.slice(-5).reverse().map((p) => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
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

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-red-600 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Pilih Produk Lama</h3>
              <button onClick={() => setShowProductModal(false)} className="text-white hover:text-yellow-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {products.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Belum ada produk tersimpan.</p>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-sm text-slate-500">Total: Rp {formatCurrency(p.total_food_cost)}</p>
                      </div>
                      <button onClick={() => loadProductData(p)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                        Pilih
                      </button>
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
          <p className="text-center text-sm text-slate-500">© 2026 Mie Ayam Ceker Jali-Jali | Kalkulator HPP Kuliner Presisi</p>
        </div>
      </footer>
    </div>
  )
}
