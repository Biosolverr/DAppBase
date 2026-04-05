'use client'
import React from 'react'

interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

export function Button({ children, onClick, disabled, loading, variant = 'primary', size = 'md', className = '', type = 'button', fullWidth }: BtnProps) {
  const base = 'rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2'
  const variants = {
    primary:   'bg-[#0052FF] text-white hover:bg-blue-600',
    secondary: 'bg-[#1E2028] text-white hover:bg-[#2a2d38]',
    ghost:     'bg-transparent text-gray-300 hover:bg-white/5',
    danger:    'bg-red-500/20 text-red-400 hover:bg-red-500/30',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />}
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`} style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {children}
    </div>
  )
}

interface InputProps {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  suffix?: string
  hint?: string
  error?: string
}

export function Input({ label, value, onChange, placeholder, type = 'text', suffix, hint, error }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
      <div className="relative">
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white pr-12 outline-none focus:ring-1 focus:ring-[#0052FF]"
          style={{ background: '#0A0B0D', border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}` }} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{suffix}</span>}
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: color + '20', color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-5 fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
