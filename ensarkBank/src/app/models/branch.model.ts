import { BranchType, BranchStatus } from './enums';

export interface Branch {
  id?: number;
  name: string;
  address: string;
  routingNumber?: string;
  branchCode?: string;
  email: string;
  phoneNumber: string;
  type: BranchType;
  status: BranchStatus;
  policeStation?: { id: number; name?: string; district?: { id: number; name?: string } };
  parentBranch?: { id: number; name?: string };
}