const express = require("express");
const router = express.Router();
const Business = require("../models/Business");

// Route to fetch all businesses
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search/advanced", async (req, res) => {
  const { ntn, startDate, endDate } = req.query;

  try {
    // Ensure all required query parameters are present
    if (!ntn || !startDate || !endDate) {
      return res.status(400).json({ message: "NTN and date range (startDate, endDate) are required" });
    }

    // Convert startDate and endDate to Date objects
    const startDateObj = new Date(`${startDate}-01`);
    const endDateObj = new Date(`${endDate}-01`);
    endDateObj.setMonth(endDateObj.getMonth() + 1); // Extend to end of end month

    // Query to find businesses based on NTN
    const businesses = await Business.find({ NTN: ntn });

    // If businesses are found, process them accordingly
    const results = businesses.map((business) => {
      const enrollmentDateObj = new Date(business.enrollmentDate);
      
      // Determine the effective start date (whichever is later)
      const effectiveStartDate = startDateObj >= enrollmentDateObj ? startDateObj : enrollmentDateObj;

      const filteredMonths = Object.keys(business.filings || {}).filter((month) => {
        const [monthName, year] = month.split('-');
        const monthDate = new Date(`${monthName}-01-${year}`);
        return monthDate >= effectiveStartDate && monthDate < endDateObj;
      });

      return {
        ...business._doc,
        filerCount: filteredMonths.filter(month => business.filings[month] === "Filer").length,
        nonFilerCount: filteredMonths.filter(month => business.filings[month] === "Non-Filer").length,
        filerMonths: filteredMonths.filter(month => business.filings[month] === "Filer").join(", "),
        nonFilerMonths: filteredMonths.filter(month => business.filings[month] === "Non-Filer").join(", "),
      };
    });

    res.json(results);

  } catch (error) {
    console.error("Error fetching advanced search data:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
