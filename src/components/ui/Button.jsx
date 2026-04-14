const variants = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'hover:bg-slate-100 text-slate-700',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children, variant = 'primary', size = 'md',
  className = '', disabled = false, loading = false, ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`inline-flex items-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {loading && (
      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    )}
    {children}
  </button>
);

export default Button;
