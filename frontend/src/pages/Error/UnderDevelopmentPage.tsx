import StatusPageLayout from "../../layouts/StatusPageLayout";

export default function UnderDevelopmentPage() {
  return (
    <StatusPageLayout
      icon="🚧"
      title="Feature Under Development"
      message="We're working hard to bring you this feature. Please check back soon!"
    />
  );
}
