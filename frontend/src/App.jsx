import React, { useState, useEffect, useMemo, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faMoon, faSun, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import api from './api'
import Landing from './Landing'
import locales from './locales'
import DashboardPage from './pages/DashboardPage'
import Logo from './ui/Logo'
import HelpCenterWidget from './components/HelpCenterWidget'

const formatCurrency = (value) => {
  let locale = 'id-ID'
  try {
    locale = JSON.parse(localStorage.getItem('hpp_display_preferences'))?.currencyFormat || 'id-ID'
  } catch (e) { locale = 'id-ID' }
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
}

const getBusinessTypes = (lang) => locales[lang]?.businessTypes || ['Kuliner', 'Jasa', 'Retail', 'Fashion', 'Kerajinan', 'Pertanian', 'Lainnya']
const getBusinessStatuses = (lang) => locales[lang]?.businessStatuses || ['Pemilik Usaha', 'Reseller', 'Tidak Punya Usaha']

const emptyRegisterForm = { fullName: '', username: '', businessType: '', businessStatus: '', email: '', password: '' }
const emptyLoginForm = { identifier: '', password: '', remember: true }
const defaultDisplayPreferences = { theme: 'light', currencyFormat: 'id-ID', defaultMargin: 30 }
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthPage({ mode, onModeChange, onLogin, onRegister, lang }) {
  const isRegister = mode === 'register'
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const t = locales[lang]

  const updateRegister = (field, value) => { setRegisterForm(c => ({ ...c, [field]: value })); setErrors(c => ({ ...c, [field]: '' })) }
  const updateLogin = (field, value) => { setLoginForm(c => ({ ...c, [field]: value })); setErrors(c => ({ ...c, [field]: '' })) }

  const handleForgotPasswordOpen = () => {
    setIsForgotPasswordOpen(true)
    setForgotPasswordEmail('')
    setForgotPasswordError('')
    setForgotPasswordSuccess(false)
  }

  const handleForgotPasswordClose = () => {
    setIsForgotPasswordOpen(false)
    setForgotPasswordEmail('')
    setForgotPasswordError('')
    setForgotPasswordSuccess(false)
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setForgotPasswordError('')
    
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError(t.auth_error_required)
      return
    }
    
    if (!emailPattern.test(forgotPasswordEmail)) {
      setForgotPasswordError(t.auth_error_email)
      return
    }
    
    try {
      await emailjs.send(
        'Gmail_API',
        'personal_service',
        {
          name: 'Pengguna UMKM Inventra',
          message: 'Permintaan reset kata sandi dari email: ' + forgotPasswordEmail,
          email: forgotPasswordEmail,
        },
        'UuvQcw1NLismLpZ60'
      )
      setForgotPasswordSuccess(true)
    } catch (err) {
      setForgotPasswordError('Gagal mengirim email. Silakan coba lagi.')
    }
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    const next = {}
    Object.entries(registerForm).forEach(([field, value]) => { if (!String(value).trim()) next[field] = t.auth_error_required })
    if (registerForm.email && !emailPattern.test(registerForm.email)) next.email = t.auth_error_email
    if (registerForm.password && registerForm.password.length < 6) next.password = t.auth_error_password_length
    if (Object.keys(next).length > 0) { setErrors(next); return }
    const result = onRegister(registerForm)
    if (result?.error) { setErrors({ username: result.error }); return }
    setRegisterForm(emptyRegisterForm)
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!loginForm.identifier.trim()) next.identifier = t.auth_error_identifier
    if (!loginForm.password.trim()) next.password = t.auth_error_password
    if (Object.keys(next).length > 0) { setErrors(next); return }
    const result = onLogin(loginForm)
    if (result?.error) setErrors({ form: result.error })
  }

  return (
    <>
    <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4"><Logo size="md" showText={false} center={true} /></div>
            <h2 className="text-2xl font-bold text-slate-800">{isRegister ? t.auth_register_title : t.auth_login_title}</h2>
            <p className="text-sm text-slate-500 mt-1">{isRegister ? t.auth_register_desc : t.auth_login_desc}</p>
          </div>

          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_fullname}</label>
                <input value={registerForm.fullName} onChange={e => updateRegister('fullName', e.target.value)} className={`input-field mt-1.5 ${errors.fullName ? 'input-field-error' : ''}`} placeholder={t.auth_placeholder_fullname} />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_username}</label>
                <input value={registerForm.username} onChange={e => updateRegister('username', e.target.value)} className={`input-field mt-1.5 ${errors.username ? 'input-field-error' : ''}`} placeholder={t.auth_placeholder_username} />
                <p className="mt-1 text-xs text-slate-400">{t.auth_username_note}</p>
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_business_type}</label>
                <select value={registerForm.businessType} onChange={e => updateRegister('businessType', e.target.value)} className={`select-field mt-1.5 ${errors.businessType ? 'input-field-error' : ''}`}>
                  <option value="">{t.auth_placeholder_business_type}</option>
                  {getBusinessTypes(lang).map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
                {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_business_status}</label>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                  {getBusinessStatuses(lang).map(s => (
                    <label key={s} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold transition-all text-center ${registerForm.businessStatus === s ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="businessStatus" value={s} checked={registerForm.businessStatus === s} onChange={e => updateRegister('businessStatus', e.target.value)} className="sr-only" />{s}</label>
                  ))}
                </div>
                {errors.businessStatus && <p className="mt-1 text-xs text-red-500">{errors.businessStatus}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_email}</label>
                <input type="email" value={registerForm.email} onChange={e => updateRegister('email', e.target.value)} className={`input-field mt-1.5 ${errors.email ? 'input-field-error' : ''}`} placeholder={t.auth_placeholder_email} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_password}</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? 'text' : 'password'} value={registerForm.password} onChange={e => updateRegister('password', e.target.value)} className={`input-field pr-24 ${errors.password ? 'input-field-error' : ''}`} placeholder={t.auth_placeholder_password} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg">{showPassword ? t.auth_hide_password : t.auth_show_password}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <button type="submit" className="btn-primary w-full py-3">{t.auth_btn_register}</button>
              <p className="text-center text-sm text-slate-500">{t.auth_have_account} <button type="button" onClick={() => onModeChange('login')} className="font-semibold text-primary-600 hover:text-primary-700">{t.auth_login_link}</button></p>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {errors.form && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.form}</div>}
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_identifier}</label>
                <input value={loginForm.identifier} onChange={e => updateLogin('identifier', e.target.value)} className={`input-field mt-1.5 ${errors.identifier ? 'input-field-error' : ''}`} placeholder={t.auth_placeholder_identifier} />
                {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_password}</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={e => updateLogin('password', e.target.value)} className={`input-field pr-24 ${errors.password ? 'input-field-error' : ''}`} placeholder={t.auth_label_password} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg">{showPassword ? t.auth_hide_password : t.auth_show_password}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={loginForm.remember} onChange={e => updateLogin('remember', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  {t.auth_remember}
                </label>
                <button type="button" onClick={handleForgotPasswordOpen} className="font-semibold text-primary-600 hover:text-primary-700">{t.auth_forgot}</button>
              </div>
              <button type="submit" className="btn-primary w-full py-3">{t.auth_btn_login}</button>
              <p className="text-center text-sm text-slate-500">{t.auth_no_account} <button type="button" onClick={() => onModeChange('register')} className="font-semibold text-primary-600 hover:text-primary-700">{t.auth_register_link}</button></p>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl animate-slide-up">
            {!forgotPasswordSuccess ? (
              <>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">{t.forgot_password_title}</h3>
                  <button onClick={handleForgotPasswordClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-slate-600 mb-6">{t.forgot_password_desc}</p>
                  
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">{t.forgot_password_label}</label>
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={e => { setForgotPasswordEmail(e.target.value); setForgotPasswordError('') }}
                        placeholder={t.forgot_password_placeholder}
                        className={`input-field mt-1.5 ${forgotPasswordError ? 'input-field-error' : ''}`}
                      />
                      {forgotPasswordError && <p className="mt-1 text-xs text-red-500">{forgotPasswordError}</p>}
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={!forgotPasswordEmail.trim()}
                        className="w-full px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t.forgot_password_btn_send}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{t.forgot_password_success_title}</h3>
                  <p className="text-sm text-slate-600 mb-6">{t.forgot_password_success_desc}</p>
                  
                  <button
                    onClick={handleForgotPasswordClose}
                    className="w-full px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    {t.forgot_password_success_btn}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ProfilePage({ currentUser, onUpdateProfile, lang }) {
  if (!currentUser) return null
  const t = locales[lang]
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
    if (!file.type.startsWith('image/')) { setProfileErrors(c => ({ ...c, avatarUrl: t.profile_error_image })); return }
    if (file.size > 1024 * 1024) { setProfileErrors(c => ({ ...c, avatarUrl: t.profile_error_image_size })); return }
    const reader = new FileReader()
    reader.onload = () => updateProfileField('avatarUrl', reader.result)
    reader.readAsDataURL(file)
  }

  const saveProfile = (e) => {
    e.preventDefault()
    const next = {}
    if (!profileForm.fullName.trim()) next.fullName = t.profile_error_fullname
    if (!profileForm.businessName.trim()) next.businessName = t.profile_error_business_name
    if (!profileForm.email.trim()) next.email = t.profile_error_email
    if (profileForm.email && !emailPattern.test(profileForm.email)) next.email = t.profile_error_email_format
    if (!profileForm.businessType) next.businessType = t.profile_error_business_type
    if (!profileForm.businessStatus) next.businessStatus = t.profile_error_business_status
    if (Object.keys(next).length > 0) { setProfileErrors(next); return }
    onUpdateProfile(profileForm)
    setIsEditing(false)
  }

  const AvatarDisplay = () => profileForm.avatarUrl
    ? <img src={profileForm.avatarUrl} alt={t.profile_avatar_label} className="h-full w-full rounded-full object-cover" />
    : <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.235.8 5.879 2.129M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="section-title">{t.profile_title}</h1>
          <p className="section-desc">{t.profile_desc}</p>
        </div>
        <button onClick={() => setIsEditing(v => !v)} className={isEditing ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
          {isEditing ? t.profile_btn_cancel : t.profile_btn_edit}
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
                  {t.profile_avatar_label}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
                {profileForm.avatarUrl && (
                  <button type="button" onClick={() => updateProfileField('avatarUrl', '')} className="mt-2 text-sm font-semibold text-red-500 hover:text-red-600">{t.profile_delete_photo}</button>
                )}
                {profileErrors.avatarUrl && <p className="mt-2 text-xs text-red-500">{profileErrors.avatarUrl}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          {isEditing ? (
            <form onSubmit={saveProfile} className="space-y-4" noValidate>
              <h2 className="text-lg font-semibold text-slate-800">{t.profile_form_title}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">{t.auth_label_fullname}</label>
                  <input value={profileForm.fullName} onChange={e => updateProfileField('fullName', e.target.value)} className={`input-field mt-1.5 ${profileErrors.fullName ? 'input-field-error' : ''}`} />
                  {profileErrors.fullName && <p className="mt-1 text-xs text-red-500">{profileErrors.fullName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">{t.profile_field_business_name}</label>
                  <input value={profileForm.businessName} onChange={e => updateProfileField('businessName', e.target.value)} className={`input-field mt-1.5 ${profileErrors.businessName ? 'input-field-error' : ''}`} />
                  {profileErrors.businessName && <p className="mt-1 text-xs text-red-500">{profileErrors.businessName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">{t.profile_field_username}</label>
                  <input value={currentUser.username} disabled className="input-field mt-1.5 bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">{t.auth_label_email}</label>
                  <input type="email" value={profileForm.email} onChange={e => updateProfileField('email', e.target.value)} className={`input-field mt-1.5 ${profileErrors.email ? 'input-field-error' : ''}`} />
                  {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">{t.auth_label_business_type}</label>
                  <select value={profileForm.businessType} onChange={e => updateProfileField('businessType', e.target.value)} className={`select-field mt-1.5 ${profileErrors.businessType ? 'input-field-error' : ''}`}>
                    <option value="">{t.auth_placeholder_business_type}</option>
                    {getBusinessTypes(lang).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {profileErrors.businessType && <p className="mt-1 text-xs text-red-500">{profileErrors.businessType}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">{t.auth_label_business_status}</label>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                  {getBusinessStatuses(lang).map(s => (
                    <label key={s} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold text-center transition-all ${profileForm.businessStatus === s ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="pbs" value={s} checked={profileForm.businessStatus === s} onChange={e => updateProfileField('businessStatus', e.target.value)} className="sr-only" />{s}</label>
                  ))}
                </div>
                {profileErrors.businessStatus && <p className="mt-1 text-xs text-red-500">{profileErrors.businessStatus}</p>}
              </div>
              <button type="submit" className="btn-primary">{t.profile_save}</button>
            </form>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t.profile_view_title}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: t.profile_view_fullname, value: currentUser.fullName },
                  { label: t.profile_view_business_name, value: businessName },
                  { label: t.auth_label_email, value: currentUser.email },
                  { label: t.profile_view_business_type, value: currentUser.businessType },
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

function SettingsPage({ currentUser, displayPreferences, onChangePassword, onClearSession, onClearAllUsers, onSaveDisplayPreferences, lang }) {
  const t = locales[lang]
  const [selectedSetting, setSelectedSetting] = useState('')
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordMessage, setPasswordMessage] = useState('')

  const updatePasswordField = (field, value) => { setPasswordForm(c => ({ ...c, [field]: value })); setPasswordErrors(c => ({ ...c, [field]: '', form: '' })); setPasswordMessage('') }

  const submitPassword = (e) => {
    e.preventDefault()
    const next = {}
    if (!passwordForm.oldPassword.trim()) next.oldPassword = t.settings_error_old_password
    if (!passwordForm.newPassword.trim()) next.newPassword = t.settings_error_new_password
    if (passwordForm.newPassword && passwordForm.newPassword.length < 6) next.newPassword = t.settings_error_new_password_length
    if (!passwordForm.confirmPassword.trim()) next.confirmPassword = t.settings_error_confirm_password
    if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) next.confirmPassword = t.settings_error_confirm_mismatch
    if (Object.keys(next).length > 0) { setPasswordErrors(next); return }
    const result = onChangePassword(passwordForm)
    if (result?.error) { setPasswordErrors({ form: result.error }); return }
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordMessage(t.settings_password_success)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t.settings_title}</h1>
        <p className="section-desc">{t.settings_desc}</p>
      </div>

      {!selectedSetting && (
        <div className="grid gap-4 md:grid-cols-3">
          <button onClick={() => setSelectedSetting('password')} className="card-hover p-6 text-left group">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><LockIcon /></div>
            <h2 className="text-lg font-bold text-slate-800">{t.settings_card_password_title}</h2>
            <p className="mt-2 text-sm text-slate-500">{t.settings_card_password_desc}</p>
          </button>
          <button onClick={() => setSelectedSetting('reset')} className="card-hover p-6 text-left group">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><TrashIcon /></div>
            <h2 className="text-lg font-bold text-slate-800">{t.settings_card_reset_title}</h2>
            <p className="mt-2 text-sm text-slate-500">{t.settings_card_reset_desc}</p>
          </button>

        </div>
      )}

      {selectedSetting && (
        <button onClick={() => setSelectedSetting('')} className="btn-secondary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t.settings_back}
        </button>
      )}

      {selectedSetting === 'password' && (
        <form onSubmit={submitPassword} className="card p-6" noValidate>
          <h2 className="text-lg font-semibold text-slate-800">{t.settings_password_title}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.settings_password_desc.replace('{username}', currentUser.username)}</p>
          {passwordErrors.form && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{passwordErrors.form}</div>}
          {passwordMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</div>}
          <div className="mt-5 space-y-4 max-w-md">
            <div>
              <label className="text-sm font-semibold text-slate-700">{t.settings_label_old_password}</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => updatePasswordField('oldPassword', e.target.value)} className={`input-field mt-1.5 ${passwordErrors.oldPassword ? 'input-field-error' : ''}`} />
              {passwordErrors.oldPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">{t.settings_label_new_password}</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => updatePasswordField('newPassword', e.target.value)} className={`input-field mt-1.5 ${passwordErrors.newPassword ? 'input-field-error' : ''}`} />
              {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">{t.settings_label_confirm_password}</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => updatePasswordField('confirmPassword', e.target.value)} className={`input-field mt-1.5 ${passwordErrors.confirmPassword ? 'input-field-error' : ''}`} />
              {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary mt-5">{t.settings_btn_save_password}</button>
        </form>
      )}



      {selectedSetting === 'reset' && (
        <div className="card p-6 border-red-100">
          <h2 className="text-lg font-semibold text-slate-800">{t.settings_reset_title}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.settings_reset_desc}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={onClearSession} className="btn-secondary text-sm">{t.settings_btn_clear_session}</button>
            <button onClick={onClearAllUsers} className="btn-danger text-sm">{t.settings_btn_clear_all}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function LockIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> }
function TrashIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> }
function CloseIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> }
function PlusIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> }
function TrashSmallIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> }
function SearchIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> }

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const tabToPath = {
    landing: '/', auth: '/login', dashboard: '/dashboard', sales: '/penjualan',
    stock: '/stok', subrecipe: '/sub-recipe', pricecalc: '/harga-jual',
    profile: '/profil', settings: '/pengaturan'
  }
  const pathToTab = Object.fromEntries(Object.entries(tabToPath).map(([k, v]) => [v, k]))
  pathToTab['/register'] = 'auth'

  const activeTab = pathToTab[path] || 'landing'
  const authMode = path === '/register' ? 'register' : 'login'

  const [currentUser, setCurrentUser] = useState((() => { try { return JSON.parse(localStorage.getItem('hpp_current_user')) || null } catch (e) { return null } })())
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showFabContact, setShowFabContact] = useState(false)
  const [showHppDropdown, setShowHppDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Bahan baku 'Ayam Fillet' hampir habis!", type: "warning", time: "Baru saja", read: false },
    { id: 2, text: "Kalkulasi HPP menu 'Mie Ayam Ceker' berhasil diperbarui.", type: "success", time: "5 mnt lalu", read: false },
    { id: 3, text: "Penjualan hari ini melampaui target.", type: "info", time: "1 jam lalu", read: false },
  ])
  const unreadCount = notifications.filter(n => !n.read).length
  const [displayPreferences, setDisplayPreferences] = useState((() => { try { return { ...defaultDisplayPreferences, ...(JSON.parse(localStorage.getItem('hpp_display_preferences')) || {}) } } catch (e) { return defaultDisplayPreferences } })())
  const [lang, setLang] = useState((() => { try { return localStorage.getItem('hpp_lang') || 'ID' } catch (e) { return 'ID' } })())

  const t = locales[lang]

  useEffect(() => { try { localStorage.setItem('hpp_lang', lang) } catch (e) {} }, [lang])

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
    if (!window.confirm(t.general_confirm_reset_hpp)) return
    try {
      const recipes = await api.getRecipes()
      for (const r of recipes) await fetch(`http://localhost:4000/api/recipes/${r.id}`, { method: 'DELETE' })
    } catch (e) { console.error(e) }
    setSavedRecipes([])
    setProducts([])
    setSubRecipeRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
    setSubRecipeName('')
    setFoodCostRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
    setProductName('')
    setPortions(1)
    setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }])
    setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }])
    setMarginPct(30)
  }

  useEffect(() => {
    applyTheme(displayPreferences.theme)
  }, [displayPreferences.theme])

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
  const deleteSubRecipeRow = (i) => setSubRecipeRows(prev => prev.filter((_, idx) => idx !== i))

  const saveSubRecipe = async () => {
    if (!subRecipeName.trim()) { alert(t.subrecipe_alert_name); return }
    const hasData = subRecipeRows.some(r => r.name && r.price > 0)
    if (!hasData) { alert(t.subrecipe_alert_min_one); return }
    const payload = { name: subRecipeName, details: subRecipeRows }
    try {
      const res = await api.createRecipe(payload)
      alert(t.subrecipe_alert_saved.replace('{name}', subRecipeName).replace('{total}', formatCurrency(res.total)))
      setSubRecipeName('')
      setSubRecipeRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getRecipes().then(setSavedRecipes).catch(() => [])
    } catch (e) { alert(t.subrecipe_alert_failed + (e.message || e)) }
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
  const deleteFoodCostRow = (i) => setFoodCostRows(prev => prev.filter((_, idx) => idx !== i))
  const saveFoodCost = async () => { if (!productName.trim()) { alert(t.pricecalc_alert_product_name); return } alert(t.pricecalc_alert_foodcost_saved) }

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
    setLaborRows(prev => {
      const filtered = prev.filter((_, idx) => idx !== i)
      return filtered.length === 0 ? [{ employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }] : filtered
    })
  }
  const saveAllLabor = async () => {
    try {
      for (const labor of laborRows) { if (labor.employee_name && labor.salary > 0) { if (labor.id) await api.updateLabor(labor.id, labor); else await api.createLabor(labor) } }
      setLaborRows([{ employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }])
      api.getLabor().catch(() => [])
      alert(t.pricecalc_alert_labor_saved)
    } catch (e) { alert(t.pricecalc_alert_failed + e.message) }
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
  const deleteOverheadRow = (i) => setOverheadRows(prev => prev.filter((_, idx) => idx !== i))
  const saveAllOverhead = async () => {
    try {
      for (const overhead of overheadRows) { if (overhead.name && overhead.total_cost > 0) { if (overhead.id) await api.updateOverhead(overhead.id, overhead); else await api.createOverhead(overhead) } }
      setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }])
      api.getOverheads().catch(() => [])
      alert(t.pricecalc_alert_overhead_saved)
    } catch (e) { alert(t.pricecalc_alert_failed + e.message) }
  }

  const saveProduct = async () => {
    if (!productName.trim()) { alert(t.pricecalc_alert_product_name); return }
    const validDetails = foodCostRows.filter(r => r.name && r.name.trim() !== '')
    if (validDetails.length === 0) { alert(t.pricecalc_alert_min_one_ingredient); return }
    try {
      const res = await api.createProduct({ name: productName, portions, details: validDetails })
      alert(t.pricecalc_alert_saved.replace('{name}', productName).replace('{total}', formatCurrency(res.total)))
      setProductName(''); setPortions(1)
      setFoodCostRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getProducts().then(setProducts).catch(() => [])
    } catch (e) { alert(t.pricecalc_alert_failed + (e.message || e)) }
  }

  const readStoredUsers = () => { try { return JSON.parse(localStorage.getItem('hpp_users')) || [] } catch (e) { return [] } }

  const handleRegister = (form) => {
    const users = readStoredUsers()
    if (users.some(u => u.username.toLowerCase() === form.username.toLowerCase())) return { error: t.general_error_username_taken }
    if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) return { error: t.general_error_email_taken }
    const newUser = { ...form, id: Date.now(), businessName: form.businessStatus === 'Tidak Punya Usaha' ? form.fullName : form.username }
    localStorage.setItem('hpp_users', JSON.stringify([...users, newUser]))
    localStorage.setItem('hpp_current_user', JSON.stringify(newUser))
    setCurrentUser(newUser); navigate('/dashboard')
    return { success: true }
  }

  const handleLogin = (form) => {
    const users = readStoredUsers()
    const identifier = form.identifier.toLowerCase()
    const matchedUser = users.find(u => (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) && u.password === form.password)
    if (!matchedUser) return { error: t.general_error_account_not_found }
    setCurrentUser(matchedUser)
    if (form.remember) localStorage.setItem('hpp_current_user', JSON.stringify(matchedUser))
    else localStorage.removeItem('hpp_current_user')
    navigate('/dashboard')
    return { success: true }
  }

  const handleLogout = () => { localStorage.removeItem('hpp_current_user'); setCurrentUser(null); setShowProfileMenu(false); navigate('/login') }

  const handleUpdateProfile = (profileForm) => {
    const updatedUser = { ...currentUser, ...profileForm }
    const users = readStoredUsers()
    localStorage.setItem('hpp_users', JSON.stringify(users.map(u => u.id === currentUser.id ? updatedUser : u)))
    localStorage.setItem('hpp_current_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  const handleChangePassword = ({ oldPassword, newPassword }) => {
    if (currentUser.password !== oldPassword) return { error: t.settings_error_old_password_wrong }
    const updatedUser = { ...currentUser, password: newPassword }
    const users = readStoredUsers()
    localStorage.setItem('hpp_users', JSON.stringify(users.map(u => u.id === currentUser.id ? updatedUser : u)))
    localStorage.setItem('hpp_current_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
    return { success: true }
  }

  const handleClearSession = () => { if (!window.confirm(t.settings_confirm_clear_session)) return; handleLogout() }
  const handleClearAllUsers = () => {
    if (!window.confirm(t.settings_confirm_clear_all)) return
    localStorage.removeItem('hpp_users'); localStorage.removeItem('hpp_current_user')
    setCurrentUser(null); setShowProfileMenu(false); navigate('/login')
  }

  const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  const toggleTheme = () => {
    const next = displayPreferences.theme === 'dark' ? 'light' : 'dark'
    const prefs = { ...displayPreferences, theme: next }
    localStorage.setItem('hpp_display_preferences', JSON.stringify(prefs))
    applyTheme(next)
    setDisplayPreferences(prefs)
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleSaveDisplayPreferences = (preferences) => {
    const normalized = { theme: preferences.theme, currencyFormat: preferences.currencyFormat, defaultMargin: Math.min(100, Math.max(0, parseInt(preferences.defaultMargin) || 0)) }
    localStorage.setItem('hpp_display_preferences', JSON.stringify(normalized))
    applyTheme(normalized.theme)
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
    { id: 'dashboard', label: t.nav_tab_dashboard },
    { id: 'sales', label: t.nav_tab_sales },
    { id: 'stock', label: t.nav_tab_stock },
  ]

  const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {activeTab !== 'landing' && (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileNavOpen(v => !v)} className="btn-ghost p-2 lg:hidden dark:text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
                </button>
                <Logo size="sm" showText={true} dark={false} />
              </div>

              <div className="hidden lg:flex items-center gap-1">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => { navigate(tabToPath[tab.id]); setMobileNavOpen(false) }}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                      activeTab === tab.id
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}>
                    {tab.label}
                  </button>
                ))}
                <div className="relative" onMouseEnter={() => setShowHppDropdown(true)} onMouseLeave={() => setShowHppDropdown(false)}>
                  <button onClick={() => setShowHppDropdown(v => !v)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                      activeTab === 'subrecipe' || activeTab === 'pricecalc'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}>
                    {t.nav_kelola_hpp}
                    <FontAwesomeIcon icon={faChevronDown} className={`w-3 h-3 transition-transform ${showHppDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showHppDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <button onClick={() => { navigate('/sub-recipe'); setShowHppDropdown(false); setMobileNavOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                        {t.nav_tab_subrecipe}
                      </button>
                      <button onClick={() => { navigate('/harga-jual'); setShowHppDropdown(false); setMobileNavOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                        {t.nav_tab_pricecalc}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUser ? (
                  <>
                  <div className="relative">
                    <button onClick={() => { setShowNotifications(v => !v); setShowProfileMenu(false) }}
                      className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors duration-200 bg-transparent border-none shadow-none flex items-center justify-center">
                      <FontAwesomeIcon icon={faBell} className="w-[18px] h-[18px]" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white leading-none">{unreadCount}</span>
                        </span>
                      )}
                    </button>
                  </div>
                  {showNotifications && (
                    <div className="absolute top-14 right-44 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-scale-in" onMouseDown={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">Notifikasi</p>
                        {unreadCount > 0 && (
                          <button onClick={markAllNotificationsRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Tandai semua telah dibaca</button>
                        )}
                      </div>
                      <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-slate-400">Tidak ada notifikasi</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${n.read ? 'text-slate-500' : 'text-slate-700 bg-indigo-50/50'}`}>
                              <div className="flex items-start gap-2">
                                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-indigo-500'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm">{n.text}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  <button onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:text-indigo-600 transition-colors duration-200 bg-transparent border-none shadow-none flex items-center justify-center">
                    <FontAwesomeIcon icon={displayPreferences.theme === 'dark' ? faSun : faMoon} className="w-[18px] h-[18px]" />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowProfileMenu(v => !v)} className="flex items-center gap-x-2 bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-200 hover:text-indigo-600">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : <UserIcon />}
                      </span>
                      <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.businessName || currentUser.username}</span>
                      <svg className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl animate-scale-in">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{currentUser.fullName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-400">@{currentUser.username}</p>
                        </div>
                        <button onClick={() => { navigate('/profil'); setShowProfileMenu(false) }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700"><UserIcon />{t.profile_menu_profil}</button>
                        <button onClick={() => { navigate('/pengaturan'); setShowProfileMenu(false) }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{t.profile_menu_settings}</button>
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full border-t border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          {t.profile_menu_logout}
                        </button>
                      </div>
                    )}
                  </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/login')} className="btn-ghost text-sm dark:text-slate-300">{t.nav_masuk}</button>
                    <button onClick={() => navigate('/register')} className="btn-primary text-sm">{t.nav_daftar}</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mobileNavOpen && (
            <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-slide-down">
              <div className="px-4 py-3 space-y-1">
                {[...tabs, { id: 'subrecipe', label: t.nav_tab_subrecipe }, { id: 'pricecalc', label: t.nav_tab_pricecalc }].map(tab => (
                  <button key={tab.id} onClick={() => { navigate(tabToPath[tab.id]); setMobileNavOpen(false) }} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      )}

      <div className="flex-1 flex flex-col">
        {activeTab === 'landing' && <Landing onEnter={(mode) => { navigate(mode === 'register' ? '/register' : (currentUser ? '/dashboard' : '/login')) }} onNavigate={(tab) => navigate(tabToPath[tab])} lang={lang} setLang={setLang} />}

        {activeTab === 'auth' && (
          <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16">
            <AuthPage mode={authMode} onModeChange={(mode) => navigate(mode === 'register' ? '/register' : '/login')} onLogin={handleLogin} onRegister={handleRegister} lang={lang} />
          </div>
        )}

        {activeTab !== 'landing' && activeTab !== 'auth' && (
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-16 lg:pb-20">
            {activeTab === 'profile' && currentUser && <ProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} lang={lang} />}
            {activeTab === 'settings' && currentUser && (
              <SettingsPage currentUser={currentUser} displayPreferences={displayPreferences} onChangePassword={handleChangePassword} onClearSession={handleClearSession} onClearAllUsers={handleClearAllUsers} onSaveDisplayPreferences={handleSaveDisplayPreferences} lang={lang} />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPage
                currentUser={currentUser}
                products={products}
                inventoryRows={inventoryRows}
                salesHistory={salesHistory}
                salesSummary={salesSummary}
                marginPct={marginPct}
                onNavigate={navigate}
                lang={lang}
              />
            )}

            {activeTab === 'sales' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="section-title">{t.sales_title}</h1>
                  <p className="section-desc">{t.sales_desc}</p>
                </div>

                <div className="card overflow-hidden">
                  <div className="card-gradient-header">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-800">{t.sales_input_title}</h2>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600">{t.sales_label_date}</label>
                        <input type="date" value={salesDate} onChange={e => { setSalesDate(e.target.value); api.getSalesSummary(e.target.value).then(setSalesSummary).catch(() => {}); api.getSales(e.target.value).then(setSalesRows).catch(() => []) }} className="input-field w-auto py-1.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.sales_label_product}</label>
                        <select value={selectedProductId} onChange={async e => {
                          const id = e.target.value; setSelectedProductId(id)
                          if (!id) { setSelectedProduct(''); setProductHpp(null); return }
                          const p = products.find(x => x.id === parseInt(id))
                          if (p) setSelectedProduct(p.name)
                          const hpp = await api.getProductHPP(id)
                          if (hpp && hpp.hpp) setProductHpp(hpp); else setProductHpp(null)
                        }} className="select-field">
                          <option value="">{t.sales_placeholder_product}</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.sales_label_price}</label>
                        <div className="input-field bg-slate-50 font-semibold text-primary-700 flex items-center h-[42px]">
                          {productHpp ? `${t.general_label_rupiah} ${formatCurrency(productHpp.hpp)}` : (selectedProductId ? <span className="text-amber-600 text-xs">{t.sales_hpp_warning}</span> : '-')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.sales_label_stock_awal}</label>
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

      {activeTab !== 'landing' && (
        <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-y-3">
              <Logo size="xs" showText={true} dark={true} />
              <p className="text-sm text-slate-400 leading-relaxed">{t.footer_desc}</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">{t.footer_menu_title}</h5>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-xs text-sm text-slate-400">
                {t.footer_menu.map((item, i) => (
                  <li key={i} onClick={() => navigate(['/', '/dashboard', '/penjualan', '/stok', '/sub-recipe', '/harga-jual'][i])} className="hover:text-white transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">{t.footer_stats_title}</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                {t.footer_stats.map((stat, i) => <li key={i}>{stat}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            {t.footer_copyright}
          </div>
        </div>
      </footer>
      )}

      <div className="fixed bottom-6 right-6 z-[1000]">
        <div className="relative">
          {/* Help Center Widget Modal */}
          <HelpCenterWidget lang={lang} isOpen={showFabContact} setIsOpen={setShowFabContact} />

          <button onClick={() => setShowFabContact(v => !v)} className="w-14 h-14 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center relative before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-[#2563eb]/30">
            <svg className="w-6 h-6" fill={showFabContact ? 'currentColor' : 'none'} stroke={showFabContact ? 'currentColor' : 'currentColor'} viewBox="0 0 24 24">
              {showFabContact ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
