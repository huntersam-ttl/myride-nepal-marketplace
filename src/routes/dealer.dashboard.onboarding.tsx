import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dealer/dashboard/onboarding')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dealer/dashboard/onboarding"!</div>
}
