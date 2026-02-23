import { useGetUnitQuery } from "@/redux/unit/unitApiSlice";

interface IGetUnitNameProps {
    unitId: string;
}

const GetUnitName = ({ unitId }: IGetUnitNameProps) => {
    const { data: unit, error, isLoading } = useGetUnitQuery(unitId);
    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading unit name</span>;
    return <span>{unit ? unit.name : 'Unknown Unit'}</span>;
}

export default GetUnitName
