enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug'
}

class Logger {
    private formatMessage(level: LogLevel, context: string, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
        
        if (data) {
            return `${baseMessage}\n${JSON.stringify(data, null, 2)}`;
        }
        
        return baseMessage;
    }

    info(context: string, message: string, data?: any): void {
        console.log(this.formatMessage(LogLevel.INFO, context, message, data));
    }

    warn(context: string, message: string, data?: any): void {
        console.warn(this.formatMessage(LogLevel.WARN, context, message, data));
    }

    error(context: string, message: string, error?: any): void {
        const errorData = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            ...(error as any)
        } : error;
        
        console.error(this.formatMessage(LogLevel.ERROR, context, message, errorData));
    }

    debug(context: string, message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage(LogLevel.DEBUG, context, message, data));
        }
    }
}

export const logger = new Logger();
