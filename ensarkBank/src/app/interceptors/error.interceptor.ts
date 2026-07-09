import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(error => {
      let message = 'An unexpected error occurred';

      if (error.status === 0) {
        message = 'Cannot connect to server. Please ensure the backend is running on port 8085.';
      } else if (error.error?.message) {
        message = error.error.message;
      } else if (error.error?.error) {
        message = error.error.error;
      } else if (error.statusText) {
        message = error.statusText;
      }

      if (error.status >= 400) {
        toast.error(message);
      }

      return throwError(() => new Error(message));
    })
  );
};
