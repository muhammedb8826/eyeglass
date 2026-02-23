import { useGetUserQuery } from "@/redux/user/userApiSlice";

interface GetBuyerNameProps {
    id: string;
    }

const GetBuyerName = ({id}: GetBuyerNameProps ) => {
    const { data: buyer, error, isLoading } = useGetUserQuery(id);
    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading buyer name</span>;
  return <span>{buyer ? buyer.first_name : 'Unknown Buyer'}</span>;
}

export default GetBuyerName
