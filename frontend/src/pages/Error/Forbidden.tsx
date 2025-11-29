import StatusPageLayout from "../../layouts/StatusPageLayout";

export default function Forbidden() {
  return (
    <StatusPageLayout
      icon="🚫"
      title="403 - Forbidden"
      message="You do not have permission to access this page."
    />
  );
}
