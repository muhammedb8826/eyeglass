import { useGetMachineQuery } from "@/redux/machines/machinesApiSlice";

interface MachineNameProps {
    machineId: string;
    }

const GetMachineName = ({ machineId }: MachineNameProps) => {
  const { data: machine, error, isLoading } = useGetMachineQuery(machineId);

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error loading machine name</span>;

  return <span>{machine ? machine.name : 'Unknown Machine'}</span>;
};

export default GetMachineName;