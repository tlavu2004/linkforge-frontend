import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <h2 className="text-3xl font-bold text-gray-900">{t('not_found.title')}</h2>
        <p className="text-gray-500">
          {t('not_found.subtitle')}
        </p>
        <Link to="/" className="inline-block mt-8 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition shadow-sm">
          {t('not_found.back_home')}
        </Link>
      </div>
    </div>
  )
}
