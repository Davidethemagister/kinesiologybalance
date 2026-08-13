export function EmptyGoalState({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-24">
      <div className="text-4xl mb-4 text-sage-dark">◌</div>
      <p className="text-slate-500">{message}</p>
    </div>
  )
}
