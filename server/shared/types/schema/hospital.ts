export interface IHospital {
    id:string;
    name:string;
    provinceId:string;
    province?: {
        name: string;
    };
    status:string;
    beds:number;
    category?: string;
    phone?: string;
    emergency?: string;
}