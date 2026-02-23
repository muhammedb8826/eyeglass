import { useGetVendorQuery } from '@/redux/vendor/vendorApiSlice';

interface GetVendorNameProps {
    vendorId: string;
    }
const GetVendorName = ({vendorId}: GetVendorNameProps) => {
    const {data: vendor, error, isLoading} = useGetVendorQuery(vendorId);
    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading machine name</span>;
  return <span>{vendor ? vendor.fullName : 'Unknown Vendor'}</span>;
}

export default GetVendorName
