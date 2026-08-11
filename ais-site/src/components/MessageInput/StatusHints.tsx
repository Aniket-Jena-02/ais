
const StatusHints = () => {
  return (
    <div className="absolute -bottom-6 left-4 flex gap-6 select-none pointer-events-none">
      <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">
          <span className="text-brand-accent/60">Shift + Enter</span> for new line
        </span>
      </div>
    </div>
  )
}

export default StatusHints