import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  return (
    <div className="notfound-container">
      <div className="notfound-icon">❓</div>
      <h1 className="notfound-title">404 - Page Not Found</h1>
      <p className="notfound-message">
        Sorry, we couldn't find the page you were looking for.
      </p>
      <Button
        onClick={handleGoBack}
        variant="secondary"
        className="notfound-back-button"
      >
        Go Back
      </Button>
    </div>
  );
}
