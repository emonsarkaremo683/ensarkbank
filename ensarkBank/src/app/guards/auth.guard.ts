import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/enums';

export const authGuard = (route: any, state: any) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const requiredRoles = route.data?.['roles'] as Role[] | undefined;
  if (requiredRoles && !auth.hasRole(...requiredRoles)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
