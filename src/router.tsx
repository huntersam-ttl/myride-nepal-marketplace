import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function RouteLoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{
        width: 40, height: 40,
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #E84B1A",
        borderRadius: "50%",
        animation: "mrn-spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes mrn-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RouteLoadingSpinner,
    defaultPendingMs: 200,
  });

  return router;
};
