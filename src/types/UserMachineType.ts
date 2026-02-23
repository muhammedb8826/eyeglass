export interface AssignedMachineType {
    id: string;
    user: {
      first_name: string;
      middle_name: string;
      email: string;
    };
    machine: {
      id: string;
      name: string;
    };
  }