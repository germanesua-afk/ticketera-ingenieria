export function SemaphoreLegend() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <span>Atrasado</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <span>En riesgo (≤ 3 días)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span>En tiempo</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-gray-400" />
        <span>Cerrado / Cancelado</span>
      </div>
    </div>
  )
}
