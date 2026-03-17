import MainLayout from "#/layouts/MainLayout";
import { createFileRoute } from "@tanstack/react-router";
import ChatArea from "#/components/ChatArea";

export const Route = createFileRoute("/channels/$channelId")({
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <MainLayout>
      <ChatArea />
    </MainLayout>
  );
}
