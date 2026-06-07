export default async function TicketDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Detalle del Ticket</h1>
      <p className="text-muted-foreground">ID: {id}</p>
      <p className="mt-4 text-sm">
        Esta página se implementará completamente en PR 4 y PR 6 del plan.
      </p>
    </div>
  )
}
