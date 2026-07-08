import { BranchType } from '../models';

/**
 * Access rules per branch type.
 *
 * An AGENT_BANK is a limited-service outlet: it may only open customers and
 * accounts. All other banking operations (transactions, ATM, cashier, loans,
 * etc.) are restricted — matching the backend BranchValidator guard.
 *
 * Keys are top-level route paths; value `true` means the module is allowed
 * for that branch type.
 */
export const BRANCH_ACCESS: Record<BranchType, Record<string, boolean>> = {
  HEAD_OFFICE: allowAll(),
  BRANCH: allowAll(),
  AGENT_BANK: {
    '/': true,
    '/customers': true,
    '/accounts': true
  }
};

function allowAll(): Record<string, boolean> {
  return {
    '/': true,
    '/accounts': true,
    '/beneficiaries': true,
    '/branches': true,
    '/cards': true,
    '/customers': true,
    '/employees': true,
    '/transactions': true,
    '/districts': true,
    '/divisions': true,
    '/police-stations': true,
    '/atms': true,
    '/atm-transactions': true,
    '/cashier-transactions': true,
    '/loans': true,
    '/reports': true
  };
}

export function isModuleAllowedForBranch(
  type: BranchType | null | undefined,
  path: string
): boolean {
  if (!type) return true;
  const rules = BRANCH_ACCESS[type];
  if (!rules) return true;
  // child routes (e.g. /accounts/new) fall back to the parent prefix
  return rules[path] ?? rules['/' + path.split('/')[1]] ?? false;
}
