// Middleware này nhận vào một schema của Zod
export const validate = (schema) => (req, res, next) => {
  try {
    // Parse và validate request (body, params, query)
    const parsedSchema = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Gán lại dữ liệu đã được validate vào request
    req.body = parsedSchema.body;

    next();
  } catch (error) {
    // Nếu validate thất bại, gửi lỗi 400
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors, // Lỗi chi tiết từ Zod
    });
  }
};
