export interface FormData{
    hospitalCode : string,
    instituteName : string,
    province : string,
    date : Date,
    diseases : string,
    remarks : string,
    patient : {
        age: number,
        sex: string,
    }
}

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export interface NavbarProps {
    activeTab?: string;
}


export interface Map {
    id: string;
    name: string;
    coordinates: [number,number];
    fontsize : number;
    population : number;
}