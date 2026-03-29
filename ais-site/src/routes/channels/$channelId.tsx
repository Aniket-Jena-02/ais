import MainLayout from "#/layouts/MainLayout";
import { createFileRoute, redirect } from "@tanstack/react-router";
import ChatArea from "#/components/ChatArea";

export const Route = createFileRoute("/channels/$channelId")({
  component: RouteComponent,
  beforeLoad: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized");
    } catch {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {

  return (
    <MainLayout>
      <ChatArea />
    </MainLayout>
  );
}
