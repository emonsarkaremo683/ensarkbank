export interface Division {
  id?: number;
  name: string;
  districts?: District[];
}

export interface District {
  id?: number;
  name: string;
  division?: { id: number; name?: string };
  policeStations?: PoliceStation[];
}

export interface PoliceStation {
  id?: number;
  name: string;
  district?: { id: number; name?: string };
}