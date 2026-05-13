export interface IReport {
  _id?: string; // optional เพราะตอน create ยังไม่มี
  hospitalId: string;
  hospitalName: string;
  provinceName: string;
  diseaseId: string;
  icdCode: string;
  diseaseName: string;
  age: number;
  sex: string;
  reportAt?: Date; // optional เพราะมี default
}
