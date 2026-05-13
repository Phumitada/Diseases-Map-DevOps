export interface IUser {
    id:number;
    username:string;
    password:string;
    hospitalId:string;
    hospital?: {
        name: string;
    };
}