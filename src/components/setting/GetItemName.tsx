import { useGetItemQuery } from "@/redux/items/itemsApiSlice";

interface IGetItemNameProps {
    itemId: string;
    }

const GetItemName = ({itemId}: IGetItemNameProps) => {
    const { data: item, error, isLoading } = useGetItemQuery(itemId);
    if(isLoading) return <span>Loading...</span>;
    if(error) return <span>Error loading item name</span>;
  return <span>{item ? item.name : 'Unknown Item'}</span>;
}

export default GetItemName
