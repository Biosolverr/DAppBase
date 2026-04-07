'use client'

export function Button({ children, onClick, disabled, loading, variant = 'primary', size = 'md', className = '', type = 'button', fullWidth }: any) {
  const base = 'rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2'
  const variants: any = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/5'
  }
  const sizes: any = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />}
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: any) {
  return <div className={`rounded-2xl border border-gray-800 bg-gray-900 p-4 ${className}`}>{children}</div>
}

export function Input({ label, value, onChange, placeholder, type = 'text', suffix, hint, error }: any) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-gray-400">{label}</label>}
      <input 
        type={type} 
        value={value} 
        onChange={(e: any) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" 
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Badge({ label, color }: any) {
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: color + '20', color }}>{label}</span>
}

export function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
