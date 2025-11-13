import jwt from "jsonwebtoken";

export const requireAuth = (req: any, res: any, next: any) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      );
      req.user = decoded; // decoded sẽ là { id: ..., username: ..., iat: ..., exp: ... }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
