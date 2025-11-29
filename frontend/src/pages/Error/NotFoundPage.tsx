import StatusPageLayout from "../../layouts/StatusPageLayout";

export default function NotFoundPage() {
  return (
    <StatusPageLayout
      icon="❓"
      title="404 - Page Not Found"
      message="Sorry, we couldn't find the page you were looking for."
    />
  );
}
