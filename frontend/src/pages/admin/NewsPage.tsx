import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, Pin, EyeOff, ChevronRight } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { NewsPost } from '../../types'
import { formatDate } from '../../utils/helpers'
import api from '../../utils/api'

const catColors: Record<string, string> = {
  general: 'bg-gray-100 text-gray-600', exam: 'bg-purple-100 text-purple-700',
  holiday: 'bg-blue-100 text-blue-700', admission: 'bg-green-100 text-green-700',
  ramadan: 'bg-yellow-100 text-yellow-700', competition: 'bg-pink-100 text-pink-700',
  internal: 'bg-red-100 text-red-600',
}

function NewsList() {
  const { t } = useLang()
  const [posts, setPosts]   = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/news')
      .then(r => setPosts(r.data.data?.items ?? r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('News & Notices', 'خبریں اور نوٹسز')}</h1>
        <Link to="/news/new" className="btn-pink flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus size={16} /> {t('Post', 'شائع')}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12"><span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" /></div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('No posts yet.', 'ابھی کوئی پوسٹ نہیں۔')}</div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <div key={post.id} className="card space-y-2">
              <div className="flex items-start gap-2">
                {post.isPinned && <Pin size={14} className="text-qasmia-pink mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-semibold text-qasmia-text text-sm">{post.title}</p>
                  {post.titleUrdu && <p className="text-xs text-gray-400" dir="rtl">{post.titleUrdu}</p>}
                </div>
                {!post.isPublic && <EyeOff size={14} className="text-gray-300 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{post.body}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catColors[post.category]}`}>
                  {post.category.toUpperCase()}
                </span>
                <span className="text-[11px] text-gray-400">
                  {post.publishedAt ? formatDate(post.publishedAt) : t('Draft', 'مسودہ')}
                </span>
                <span className={`text-[10px] font-semibold ml-auto ${post.isPublic ? 'text-green-600' : 'text-red-400'}`}>
                  {post.isPublic ? t('Public', 'عوامی') : t('Internal', 'داخلی')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreatePost() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const { register, handleSubmit } = useForm<any>()

  const onSubmit = async (data: any) => {
    setSaving(true)
    setError('')
    try { await api.post('/news', data); navigate('/news') }
    catch (err: any) { setError(err?.response?.data?.message ?? t('Failed.', 'ناکام۔')) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/news" className="text-gray-400"><ChevronRight size={18} className="rotate-180" /></Link>
        <h1 className="page-title">{t('New Post', 'نئی پوسٹ')}</h1>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="card space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Title (English) *', 'عنوان (انگریزی) *')}</label>
            <input {...register('title', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Title (Urdu)', 'عنوان (اردو)')}</label>
            <input {...register('titleUrdu')} className="input-field" dir="rtl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Body (English) *', 'متن (انگریزی) *')}</label>
            <textarea {...register('body', { required: true })} rows={4} className="input-field resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Body (Urdu)', 'متن (اردو)')}</label>
            <textarea {...register('bodyUrdu')} rows={4} className="input-field resize-none" dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Category', 'قسم')}</label>
              <select {...register('category')} className="input-field">
                {['general','exam','holiday','admission','ramadan','competition','internal'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Publish Date', 'تاریخ اشاعت')}</label>
              <input {...register('publishedAt')} type="date" className="input-field" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('isPublic')} type="checkbox" className="rounded" defaultChecked />
              {t('Public', 'عوامی')}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input {...register('isPinned')} type="checkbox" className="rounded" />
              {t('Pinned', 'پن کریں')}
            </label>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? t('Publishing…', 'شائع ہو رہا ہے…') : t('Publish Post', 'پوسٹ شائع کریں')}
        </button>
      </form>
    </div>
  )
}

export default function NewsPage() {
  return (
    <Routes>
      <Route index element={<NewsList />} />
      <Route path="new" element={<CreatePost />} />
    </Routes>
  )
}
