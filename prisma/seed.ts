import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password123!";

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters due to FK constraints).
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.salesRep.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const manager = await prisma.user.create({
    data: {
      name: "สมชาย ศรีสุวรรณ",
      email: "manager@medtest.com",
      passwordHash,
      role: "SALES_MANAGER",
      salesRep: { create: { region: "ทั่วประเทศ", phone: "081-555-0100" } },
    },
    include: { salesRep: true },
  });

  const repDefs = [
    { name: "พิมพ์ชนก วงศ์สว่าง", email: "alice.rep@medtest.com", region: "กรุงเทพฯ และปริมณฑล", phone: "081-555-0101" },
    { name: "ธนากร จันทร์เพ็ญ", email: "ben.rep@medtest.com", region: "ภาคเหนือ", phone: "082-555-0102" },
    { name: "กัญญารัตน์ แสงทอง", email: "carla.rep@medtest.com", region: "ภาคตะวันออกเฉียงเหนือ", phone: "083-555-0103" },
    { name: "วีรพงษ์ ทองดี", email: "david.rep@medtest.com", region: "ภาคใต้", phone: "084-555-0104" },
  ];

  const reps = [];
  for (const def of repDefs) {
    const user = await prisma.user.create({
      data: {
        name: def.name,
        email: def.email,
        passwordHash,
        role: "SALES_REP",
        salesRep: { create: { region: def.region, phone: def.phone } },
      },
      include: { salesRep: true },
    });
    reps.push(user);
  }

  const productDefs = [
    { name: "RapidCheck COVID-19 Antigen Test", sku: "RC-COV-001", category: "COVID-19", unitPrice: 12.5, stock: 500, reorder: 100 },
    { name: "InstaFlu A/B Rapid Test", sku: "IF-FLU-002", category: "Influenza", unitPrice: 9.75, stock: 350, reorder: 75 },
    { name: "StrepScreen Rapid Antigen Kit", sku: "SS-STR-003", category: "Strep Throat", unitPrice: 7.25, stock: 400, reorder: 80 },
    { name: "GlucoTrack Blood Glucose Kit", sku: "GT-GLU-004", category: "Diabetes", unitPrice: 18.0, stock: 250, reorder: 50 },
    { name: "HemoCheck Hemoglobin Test", sku: "HC-HEM-005", category: "Hematology", unitPrice: 14.4, stock: 200, reorder: 40 },
    { name: "PregnaSure hCG Pregnancy Test", sku: "PS-PRG-006", category: "Pregnancy", unitPrice: 4.5, stock: 600, reorder: 120 },
    { name: "UriScan Urinalysis Test Strips", sku: "US-URI-007", category: "Urinalysis", unitPrice: 6.1, stock: 300, reorder: 60 },
    { name: "CholestCheck Lipid Panel Kit", sku: "CC-LIP-008", category: "Cholesterol", unitPrice: 21.0, stock: 150, reorder: 30 },
    { name: "AllerScreen IgE Rapid Test", sku: "AS-IGE-009", category: "Allergy", unitPrice: 16.8, stock: 8, reorder: 40 },
    { name: "HepBSure Hepatitis B Rapid Test", sku: "HB-HEP-010", category: "Hepatitis", unitPrice: 11.2, stock: 5, reorder: 50 },
  ];

  const products = [];
  for (const def of productDefs) {
    const product = await prisma.product.create({
      data: {
        name: def.name,
        sku: def.sku,
        category: def.category,
        description: `${def.name} for internal distribution to partner clinics.`,
        unitPrice: def.unitPrice,
        inventory: {
          create: {
            quantityOnHand: def.stock,
            reorderLevel: def.reorder,
            warehouseLocation: "Main Warehouse",
          },
        },
      },
    });
    products.push(product);
  }

  // Real hospitals (see Wikipedia "List of hospitals in Thailand"); contacts are fictional.
  const customerDefs = [
    { name: "นพ.อนันต์ รัตนวิจิตร", organization: "โรงพยาบาลศิริราช", address: "เขตบางกอกน้อย กรุงเทพมหานคร", email: "anan.r@siriraj.example.com", phone: "02-555-0201", repIndex: 0 },
    { name: "พญ.สุภาพร เจริญสุข", organization: "โรงพยาบาลรามาธิบดี", address: "เขตราชเทวี กรุงเทพมหานคร", email: "supaporn.c@rama.example.com", phone: "02-555-0202", repIndex: 0 },
    { name: "นพ.ปกรณ์ พิพัฒน์กุล", organization: "โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย", address: "เขตปทุมวัน กรุงเทพมหานคร", email: "pakorn.p@chula.example.com", phone: "02-555-0203", repIndex: 0 },
    { name: "พญ.นภัสสร ศรีวิไล", organization: "โรงพยาบาลบำรุงราษฎร์", address: "เขตวัฒนา กรุงเทพมหานคร", email: "napatsorn.s@bumrungrad.example.com", phone: "02-555-0204", repIndex: 0 },
    { name: "นพ.ชัยวัฒน์ สุขสวัสดิ์", organization: "โรงพยาบาลสมิติเวช สุขุมวิท", address: "เขตวัฒนา กรุงเทพมหานคร", email: "chaiwat.s@samitivej.example.com", phone: "02-555-0205", repIndex: 0 },
    { name: "พญ.ลลิดา คำภีระ", organization: "โรงพยาบาลมหาราชนครเชียงใหม่", address: "อ.เมืองเชียงใหม่ จ.เชียงใหม่", email: "lalida.k@maharaj.example.com", phone: "053-555-0206", repIndex: 1 },
    { name: "นพ.ศักดิ์ชัย บุญเรือง", organization: "โรงพยาบาลศรีนครินทร์", address: "อ.เมืองขอนแก่น จ.ขอนแก่น", email: "sakchai.b@srinagarind.example.com", phone: "043-555-0207", repIndex: 2 },
    { name: "พญ.อรอุมา เพชรรัตน์", organization: "โรงพยาบาลสงขลานครินทร์", address: "อ.หาดใหญ่ จ.สงขลา", email: "onuma.p@songklanagarind.example.com", phone: "074-555-0208", repIndex: 3 },
  ];

  const customers = [];
  for (let i = 0; i < customerDefs.length; i++) {
    const def = customerDefs[i];
    const rep = reps[def.repIndex];
    const customer = await prisma.customer.create({
      data: {
        name: def.name,
        organization: def.organization,
        email: def.email,
        phone: def.phone,
        address: def.address,
        salesRepId: rep.salesRep!.id,
      },
    });
    customers.push(customer);
  }

  const statuses: Array<"PENDING" | "COMPLETED" | "CANCELLED"> = ["COMPLETED", "COMPLETED", "COMPLETED", "PENDING", "CANCELLED"];

  let orderCounter = 0;
  for (const customer of customers) {
    const ordersForCustomer = 2 + (orderCounter % 3);
    for (let o = 0; o < ordersForCustomer; o++) {
      const status = statuses[orderCounter % statuses.length];
      const itemCount = 1 + (orderCounter % 3);
      const chosenProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, itemCount);

      const createdAt = new Date(Date.now() - (orderCounter + 1) * 1000 * 60 * 60 * 24 * 3);

      await prisma.order.create({
        data: {
          customerId: customer.id,
          salesRepId: customer.salesRepId,
          status,
          notes: o === 0 ? "Recurring monthly restock order." : undefined,
          createdAt,
          fulfilledAt: status === "COMPLETED" ? createdAt : null,
          items: {
            create: chosenProducts.map((product) => ({
              productId: product.id,
              quantity: 5 + Math.floor(Math.random() * 45),
              unitPrice: product.unitPrice,
            })),
          },
        },
      });
      orderCounter++;
    }
  }

  console.log("Seed complete.");
  console.log(`Manager login: ${manager.email} / ${DEFAULT_PASSWORD}`);
  reps.forEach((rep) => console.log(`Rep login: ${rep.email} / ${DEFAULT_PASSWORD}`));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
