import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dealer/dashboard/inventory/import')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dealer/dashboard/inventory/import"!</div>
}
