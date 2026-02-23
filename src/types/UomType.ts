export interface UoMType {
    id: string;
    name: string;
    abbreviation:string;
    conversionRate: number;
    baseUnit: boolean;
    unitCategoryId: string;
    isFocused?: boolean;
}