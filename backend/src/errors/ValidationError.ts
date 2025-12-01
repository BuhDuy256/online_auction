import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public details?: any
  ) {
    super(400, message);
  }
}
