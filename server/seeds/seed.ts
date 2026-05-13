import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

type IProvince = { id: string; name: string }
type IHospital = { id: string; name: string; provinceId: string; status: string; beds: number; category?: string; phone?: string; emergency?: string }
type IDisease = { id?: number; icdCode: string; name: string }
type IUser = { id?: number; username: string; password: string; hospitalId: string }
const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const main = async():Promise<void> => {
    console.log("ดึงข้อมูลอ้างอิง");
    const provinces:IProvince[] = [
        // --- North (ภาคเหนือ) ---
        { "id": "Chiang Mai", "name": "เชียงใหม่" },
        { "id": "Chiang Rai", "name": "เชียงราย" },
        { "id": "Lampang", "name": "ลำปาง" },
        { "id": "Lamphun", "name": "ลำพูน" },
        { "id": "Mae Hong Son", "name": "แม่ฮ่องสอน" },
        { "id": "Nan", "name": "น่าน" },
        { "id": "Phayao", "name": "พะเยา" },
        { "id": "Phrae", "name": "แพร่" },
        { "id": "Uttaradit", "name": "อุตรดิตถ์" },
      
        // --- Central (ภาคกลาง) ---
        { "id": "Bangkok Metropolis", "name": "กรุงเทพมหานคร" },
        { "id": "Ang Thong", "name": "อ่างทอง" },
        { "id": "Chai Nat", "name": "ชัยนาท" },
        { "id": "Kamphaeng Phet", "name": "กำแพงเพชร" },
        { "id": "Lop Buri", "name": "ลพบุรี" },
        { "id": "Nakhon Nayok", "name": "นครนายก" },
        { "id": "Nakhon Pathom", "name": "นครปฐม" },
        { "id": "Nakhon Sawan", "name": "นครสวรรค์" },
        { "id": "Nonthaburi", "name": "นนทบุรี" },
        { "id": "Pathum Thani", "name": "ปทุมธานี" },
        { "id": "Phetchabun", "name": "เพชรบูรณ์" },
        { "id": "Phichit", "name": "พิจิตร" },
        { "id": "Phitsanulok", "name": "พิษณุโลก" },
        { "id": "Phra Nakhon Si Ayutthaya", "name": "พระนครศรีอยุธยา" },
        { "id": "Samut Prakan", "name": "สมุทรปราการ" },
        { "id": "Samut Sakhon", "name": "สมุทรสาคร" },
        { "id": "Samut Songkhram", "name": "สมุทรสงคราม" },
        { "id": "Saraburi", "name": "สระบุรี" },
        { "id": "Sing Buri", "name": "สิงห์บุรี" },
        { "id": "Sukhothai", "name": "สุโขทัย" },
        { "id": "Suphan Buri", "name": "สุพรรณบุรี" },
        { "id": "Uthai Thani", "name": "อุทัยธานี" },
      
        // --- North East (ภาคอีสาน) ---
        { "id": "Amnat Charoen", "name": "อำนาจเจริญ" },
        { "id": "Bueng Kan", "name": "บึงกาฬ" },
        { "id": "Buri Ram", "name": "บุรีรัมย์" },
        { "id": "Chaiyaphum", "name": "ชัยภูมิ" },
        { "id": "Kalasin", "name": "กาฬสินธุ์" },
        { "id": "Khon Kaen", "name": "ขอนแก่น" },
        { "id": "Loei", "name": "เลย" },
        { "id": "Maha Sarakham", "name": "มหาสารคาม" },
        { "id": "Mukdahan", "name": "มุกดาหาร" },
        { "id": "Nakhon Phanom", "name": "นครพนม" },
        { "id": "Nakhon Ratchasima", "name": "นครราชสีมา" },
        { "id": "Nong Bua Lam Phu", "name": "หนองบัวลำภู" },
        { "id": "Nong Khai", "name": "หนองคาย" },
        { "id": "Roi Et", "name": "ร้อยเอ็ด" },
        { "id": "Sakon Nakhon", "name": "สกลนคร" },
        { "id": "Si Sa Ket", "name": "ศรีสะเกษ" },
        { "id": "Surin", "name": "สุรินทร์" },
        { "id": "Ubon Ratchathani", "name": "อุบลราชธานี" },
        { "id": "Udon Thani", "name": "อุดรธานี" },
        { "id": "Yasothon", "name": "ยโสธร" },
      
        // --- East (ภาคตะวันออก) ---
        { "id": "Chachoengsao", "name": "ฉะเชิงเทรา" },
        { "id": "Chanthaburi", "name": "จันทบุรี" },
        { "id": "Chon Buri", "name": "ชลบุรี" },
        { "id": "Prachin Buri", "name": "ปราจีนบุรี" },
        { "id": "Rayong", "name": "ระยอง" },
        { "id": "Sa Kaeo", "name": "สระแก้ว" },
        { "id": "Trat", "name": "ตราด" },
      
        // --- West (ภาคตะวันตก) ---
        { "id": "Kanchanaburi", "name": "กาญจนบุรี" },
        { "id": "Phetchaburi", "name": "เพชรบุรี" },
        { "id": "Prachuap Khiri Khan", "name": "ประจวบคีรีขันธ์" },
        { "id": "Ratchaburi", "name": "ราชบุรี" },
        { "id": "Tak", "name": "ตาก" },
      
        // --- South (ภาคใต้) ---
        { "id": "Chumphon", "name": "ชุมพร" },
        { "id": "Krabi", "name": "กระบี่" },
        { "id": "Nakhon Si Thammarat", "name": "นครศรีธรรมราช" },
        { "id": "Narathiwat", "name": "นราธิวาส" },
        { "id": "Pattani", "name": "ปัตตานี" },
        { "id": "Phangnga", "name": "พังงา" },
        { "id": "Phatthalung", "name": "พัทลุง" },
        { "id": "Phuket", "name": "ภูเก็ต" },
        { "id": "Ranong", "name": "ระนอง" },
        { "id": "Satun", "name": "สตูล" },
        { "id": "Songkhla", "name": "สงขลา" },
        { "id": "Surat Thani", "name": "สุราษฎร์ธานี" },
        { "id": "Trang", "name": "ตรัง" },
        { "id": "Yala", "name": "ยะลา" }
      ]
      for (const el of provinces){
        await prisma.province.upsert(
            {
                where: { id: el.id },
                update: { name: el.name },
                create: el,
            }
        )
      }
  console.log("ดึงข้อมูลอ้างอิงจังหวัดเสร็จสิ้น")
  const Hospital:IHospital[] = [
    { id: "H001", name: "โรงพยาบาลศิริราช (Siriraj Hospital)", provinceId: "Bangkok Metropolis", status: "Active", beds: 2450, category: "General Hospital", phone: "02-419-7000", emergency: "High" },
    { id: "H002", name: "โรงพยาบาลเชียงใหม่ราม", provinceId: "Chiang Mai", status: "Active", beds: 350, category: "General Hospital", phone: "053-935-111", emergency: "Available" },
    { id: "H003", name: "รพ.สต. บ้านไร่", provinceId: "Khon Kaen", status: "Maintenance", beds: 0, category: "University Hospital", phone: "043-465-123", emergency: "Full" },
    { id: "H004", name: "โรงพยาบาลสงขลานครินทร์", provinceId: "Songkhla", status: "Active", beds: 850, category: "General Hospital", phone: "074-325-444", emergency: "Available" },
    { id: "H005", name: "โรงพยาบาลกรุงเทพ", provinceId: "Bangkok Metropolis", status: "Active", beds: 500, category: "Private Hospital", phone: "02-123-4567", emergency: "High" },
    { id: "H006", name: "โรงพยาบาลพุทธชินราช", provinceId: "Phitsanulok", status: "Active", beds: 900, category: "University Hospital", phone: "055-252-111", emergency: "Available" },
  ]
  for (const h of Hospital) {
    await prisma.hospital.upsert({
      where: { id: h.id },
      update: {
        name: h.name,
        provinceId: h.provinceId,
        status: h.status,
        beds: h.beds,
        category: h.category,
        phone: h.phone,
        emergency: h.emergency
      },
      create: {
        id: h.id,
        name: h.name,
        provinceId: h.provinceId,
        status: h.status,
        beds: h.beds,
        category: h.category,
        phone: h.phone,
        emergency: h.emergency
      },
    })
  }
  console.log("ดึงข้อมูลโรงพยาบาลเสร็จสิ้น")
  const allProvinces = await prisma.province.findMany()
  let hIndex = 10
  for (const province of allProvinces) {
    const id = `H${String(hIndex++).padStart(3, '0')}`
    await prisma.hospital.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: `โรงพยาบาลทั่วไป ${province.id}`,
        provinceId: province.id,
        status: 'Active',
        beds: 200,
        category: 'General Hospital',
      }
    })
  }
  console.log("สร้างโรงพยาบาลครบทุกจังหวัดเสร็จสิ้น")
  const Disease:Omit<IDisease,'id'>[] = [
  { icdCode: "J11", name: "ไข้หวัดใหญ่ (Influenza)" },
    { icdCode: "E11", name: "เบาหวาน (Diabetes)" },
    { icdCode: "I10", name: "ความดันโลหิตสูง (Hypertension)" },
    { icdCode: "I25", name: "โรคหัวใจ (Heart Disease)" },
    { icdCode: "C34", name: "มะเร็งปอด (Lung Cancer)" },
    { icdCode: "F32", name: "ภาวะซึมเศร้า (Depression)" },
    { icdCode: "G40", name: "โรคลมชัก (Epilepsy)" },
    { icdCode: "M54", name: "ปวดหลัง (Back Pain)" },
    { icdCode: "N39", name: "การติดเชื้อทางเดินปัสสาวะ (Urinary Tract Infection)" },
    { icdCode: "K21", name: "กรดไหลย้อน (Gastroesophageal Reflux Disease)" },
    { icdCode: "L20", name: "โรคผิวหนังอักเสบ (Atopic Dermatitis)" },
    { icdCode: "H52", name: "สายตาสั้น (Myopia)" },
    { icdCode: "R51", name: "ปวดศีรษะ (Headache)" },
  ]
  for (const d of Disease) {
    await prisma.disease.upsert({
      where: { icdCode: d.icdCode }, 
      update: { name: d.name },
      create: d
    })
  }
  console.log("ดึงข้อมูลโรคเสร็จสิ้น")
  const saltRounds = 10
  const hashedAdmin = await bcrypt.hash('admin123', saltRounds)
  const hashedStaff = await bcrypt.hash('staff456', saltRounds)
  const Users:Omit<IUser,'id'>[] = [
    { username: 'admin_siriraj', password: hashedAdmin, hospitalId: 'H001' },
    { username: 'staff_siriraj', password: hashedStaff, hospitalId: 'H001' },
    { username: 'admin_chiangmai', password: hashedAdmin, hospitalId: 'H002' },
    { username: 'staff_chiangmai', password: hashedStaff, hospitalId: 'H002' },
    { username: 'admin_khonkaen', password: hashedAdmin, hospitalId: 'H003' },
    { username: 'staff_khonkaen', password: hashedStaff, hospitalId: 'H003' },
    { username: 'admin_songkhla', password: hashedAdmin, hospitalId: 'H004' },
    { username: 'staff_songkhla', password: hashedStaff, hospitalId: 'H004' },
    { username: 'admin_bangkok', password: hashedAdmin, hospitalId: 'H005' },
    { username: 'staff_bangkok', password: hashedStaff, hospitalId: 'H005' },
    { username: 'admin_phitsanulok', password: hashedAdmin, hospitalId: 'H006' },
    { username: 'staff_phitsanulok', password: hashedStaff, hospitalId: 'H006' },
  ]
  for (const u of Users) {
    await prisma.user.upsert({
      where : { username: u.username },
      update: { password: u.password, hospitalId: u.hospitalId },
      create: u
    })
  }
  console.log("ดึงข้อมูลผู้ใช้เสร็จสิ้น")
  const hospitals = await prisma.hospital.findMany()
  const diseases = await prisma.disease.findMany()
  const sexOptions = ['ชาย', 'หญิง']
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2025-12-31')
  const TOTAL = 5000

  console.log(`กำลัง generate ${TOTAL} reports...`)

  const batchSize = 100
  for (let i = 0; i < TOTAL; i += batchSize) {
    const batch = Array.from({ length: Math.min(batchSize, TOTAL - i) }, () => ({
      hospitalId: randomItem(hospitals).id,
      diseaseId: randomItem(diseases).id,
      age: randomInt(1, 90),
      sex: randomItem(sexOptions),
      reportAt: randomDate(startDate, endDate),
    }))

    await prisma.report.createMany({ data: batch })
    console.log(`สร้างแล้ว ${Math.min(i + batchSize, TOTAL)}/${TOTAL}`)
  }
}
main()
    .catch((e)=>{
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })