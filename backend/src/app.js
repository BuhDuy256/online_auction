import express, { json } from 'express';
import listRoutes from './api/controllers/list.controller.js';

const port = process.env.PORT || 3000;
const app = express();

app.use(json());
app.use('', listRoutes)
app.use((error, req, res) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
    });
});
app.listen(port, () => {
    console.log(`App is listening in port ${port}`);
});