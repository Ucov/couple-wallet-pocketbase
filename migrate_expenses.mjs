import PocketBase from 'pocketbase';

const pb = new PocketBase('http://192.168.1.11:8090');

async function migrateExpensesSchema() {
  await pb.collection('_superusers').authWithPassword('unasev48@gmail.com', 'uVVcOMgRKfr1Rbj2');
  console.log("Admin auth OK!");

  const expensesCol = await pb.collections.getOne('expenses');
  let schemaModified = false;

  const currentFields = expensesCol.fields.map(f => f.name);

  // Add is_refundable
  if (!currentFields.includes('is_refundable')) {
    expensesCol.fields.push({
      system: false,
      id: "is_refundable_id",
      name: "is_refundable",
      type: "bool",
      required: false,
      presentable: false,
      unique: false,
      options: {}
    });
    schemaModified = true;
    console.log("Added 'is_refundable' field");
  }

  // Add type
  if (!currentFields.includes('type')) {
    expensesCol.fields.push({
      system: false,
      id: "type_id",
      name: "type",
      type: "text",
      required: false,
      presentable: false,
      unique: false,
      options: { min: null, max: null, pattern: "" }
    });
    schemaModified = true;
    console.log("Added 'type' field");
  }

  // Add status
  if (!currentFields.includes('status')) {
    expensesCol.fields.push({
      system: false,
      id: "status_id",
      name: "status",
      type: "text",
      required: false,
      presentable: false,
      unique: false,
      options: { min: null, max: null, pattern: "" }
    });
    schemaModified = true;
    console.log("Added 'status' field");
  }

  if (schemaModified) {
    await pb.collections.update('expenses', expensesCol);
    console.log("Expenses schema updated successfully!");
  } else {
    console.log("Schema already up to date. No changes needed.");
  }
}

migrateExpensesSchema().catch(console.error);
