import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  return (
    // 2. Đổi tên class
    <div className="notfound-container">
      {/* 3. Đổi icon và nội dung */}
      <div className="notfound-icon">❓</div>
      <h1 className="notfound-title">404 - Page Not Found</h1>
      <p className="notfound-message">
        Sorry, we couldn't find the page you were looking for.
      </p>
      <Button
        onClick={handleGoBack}
        variant="secondary"
        className="notfound-back-button" // 4. Đổi tên class
      >
        Go Back
      </Button>
    </div>
  );
}
