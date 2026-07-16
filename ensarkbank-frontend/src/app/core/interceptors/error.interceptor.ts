import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

const STATUS_TITLES: Record<number, string> = {
  400: 'Invalid Request',
  401: 'Session Expired',
  403: 'Access Denied',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Server Error'
};

function extractErrorMessage(err: HttpErrorResponse): string {
  if (err.error?.message) {
    return err.error.message;
  }
  if (err.error?.fieldErrors && typeof err.error.fieldErrors === 'object') {
    return Object.entries(err.error.fieldErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ');
  }
  if (typeof err.error === 'string') {
    return err.error;
  }
  return 'Something went wrong. Please try again.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const title = STATUS_TITLES[error.status] || 'Error';
      const message = extractErrorMessage(error);
      notify.error(title, message);
      return throwError(() => error);
    })
  );
};
