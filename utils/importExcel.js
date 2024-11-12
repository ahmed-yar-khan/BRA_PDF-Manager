// utils/importExcel.js
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Business = require("../models/Business");

const importExcelData = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect("mongodb+srv://ahmeddehwar2:RF0sWiWG3Lk8Clvw@cluster0.iaevo.mongodb.net/businessDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");

    // Read the Excel file
    const workbook = xlsx.readFile("./data/data.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert the sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Log detected headers for debugging
    console.log("Headers detected in the first row:", Object.keys(jsonData[0]));

    // Format data according to schema
    const formattedData = jsonData.map((row, index) => {
      const filings = {};

      // Process each column, capturing date-like columns dynamically
      Object.keys(row).forEach((key) => {
        if (key.trim().match(/^\w{3}-\d{2}$/)) {
          filings[key.trim()] = row[key] || "Non-Filer";
        }
      });

      // Log each `filings` field to ensure all expected months are captured
      console.log(`Row ${index + 1} filings:`, filings);

      return {
        NTN: row["NTN"] || "",
        businessName: row["Business Name"] || "",
        description: row["Description"] || "",
        principalService: row["Principal Service"] || "",
        email: row["Email"] || "",
        enrollmentDate: (() => {
          const rawDate = row["Enrollment Date"];
          console.log(`Raw Enrollment Date for row ${index + 1}:`, rawDate);
          return rawDate 
            ? (typeof rawDate === 'number' 
               ? new Date((rawDate - 25569) * 86400 * 1000) // Excel date conversion
               : new Date(rawDate)) 
            : null;
        })(),
        filings,
      };
    });

    // Log document structure before insertion
    console.log("Sample document structure:", formattedData[0]);

    // Clear any existing data to avoid duplicates
    await Business.deleteMany({});
    console.log("Existing data cleared from Business collection");

    // Insert data into MongoDB in smaller chunks
    for (let i = 0; i < formattedData.length; i += 100) {
      const chunk = formattedData.slice(i, i + 100);
      await Business.insertMany(chunk);
      console.log(`Inserted chunk ${Math.floor(i / 100) + 1}`);
    }

    console.log("Excel data imported successfully!");

  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run the import function
importExcelData().catch((error) => console.error("Error:", error));
