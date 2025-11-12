import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <AppRouter />
    </>
  );
}

export default App;
