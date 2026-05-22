import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dealer-beta')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dealer-beta"!</div>
}
