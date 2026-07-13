import { faker } from '@faker-js/faker';
import sequelize from './dbconnection.js'; // Adjust path as needed
import { Fees } from './Models/Fees.js'; // Adjust path to your Fees model
import { Athletes } from './Models/Athletes.js'; // Adjust path to your Athletes model

// Function to generate random dates within a range
function generateRandomDate(daysFromNowRange = 15) {
  // Get current date
  const now = new Date();
  
  // Calculate start date (15 days ago)
  const start = new Date(now);
  start.setDate(now.getDate() - daysFromNowRange);
  
  // Calculate end date (15 days from now)
  const end = new Date(now);
  end.setDate(now.getDate() + daysFromNowRange);
  
  // Generate random date between start and end
  const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const randomDate = new Date(randomTimestamp);
  
  // Format as YYYY-MM-DD
  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, '0');
  const day = String(randomDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}


// Function to generate fee period (start and end dates)
function generateFeePeriod() {
  const startDate = generateRandomDate(2023, 2024);
  const start = new Date(startDate);
  
  // Generate end date 15-45 days after start date
  const daysToAdd = 15 + Math.floor(Math.random() * 31); // 15 to 45 days
  const end = new Date(start);
  end.setDate(start.getDate() + daysToAdd);
  
  const endYear = end.getFullYear();
  const endMonth = String(end.getMonth() + 1).padStart(2, '0');
  const endDay = String(end.getDate()).padStart(2, '0');
  
  return {
    startDate: startDate,
    endDate: `${endYear}-${endMonth}-${endDay}`
  };
}

// Function to generate fee amount based on type
function generateFeeAmount() {
  const feeTypes = [
    { type: 'Monthly', min: 2000, max: 10000, probability: 0.7 },
    { type: 'Quarterly', min: 5000, max: 25000, probability: 0.15 },
    { type: 'Yearly', min: 20000, max: 100000, probability: 0.1 },
    { type: 'Training', min: 1000, max: 5000, probability: 0.05 }
  ];
  
  // Select fee type based on probability
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedType;
  
  for (const feeType of feeTypes) {
    cumulativeProbability += feeType.probability;
    if (random <= cumulativeProbability) {
      selectedType = feeType;
      break;
    }
  }
  
  // Generate amount within range
  const min = selectedType.min;
  const max = selectedType.max;
  const amount = min + Math.random() * (max - min);
  
  // Round to nearest 100
  return {
    type: selectedType.type,
    amount: Math.round(amount / 100) * 100
  };
}

// Function to generate received amount based on fee status
function generateReceivedAmount(totalAmount) {
  // Determine fee status
  const statusRandom = Math.random();
  
  if (statusRandom < 0.3) {
    // 30%: Fully paid
    return {
      received: totalAmount,
      status: 'Paid',
      remained: 0
    };
  } else if (statusRandom < 0.7) {
    // 40%: Partially paid (25-75% paid)
    const percentagePaid = 0.25 + Math.random() * 0.5; // 25% to 75%
    const received = Math.round(totalAmount * percentagePaid / 100) * 100;
    return {
      received: received,
      status: 'Partial',
      remained: totalAmount - received
    };
  } else {
    // 30%: Not paid at all
    return {
      received: 0,
      status: 'Unpaid',
      remained: totalAmount
    };
  }
}

// Function to generate a single fee record for a specific athlete
function generateFeeRecord(athleteId) {
  const period = generateFeePeriod();
  const feeInfo = generateFeeAmount();
  const paymentInfo = generateReceivedAmount(feeInfo.amount);
  
  return {
    startDate: period.startDate,
    endDate: period.endDate,
    total: feeInfo.amount,
    received: paymentInfo.received,
    remained: paymentInfo.remained,
    athleteId: athleteId,
    status: paymentInfo.status,
    feeType: feeInfo.type,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Function to generate fee records for an athlete
function generateAthleteFeeRecords(athleteId, minRecords = 1, maxRecords = 12) {
  const records = [];
  const numRecords = minRecords + Math.floor(Math.random() * (maxRecords - minRecords + 1));
  
  for (let i = 0; i < numRecords; i++) {
    const record = generateFeeRecord(athleteId);
    records.push(record);
  }
  
  return records;
}

// Function to generate multiple fee records for all athletes
async function generateMultipleFeeRecords(athletes) {
  const allFeeRecords = [];
  
  console.log(`Generating fee records for ${athletes.length} athletes...`);
  
  for (const athlete of athletes) {
    // Generate 1-12 fee records per athlete
    const feeRecords = generateAthleteFeeRecords(athlete.id, 1, 12);
    allFeeRecords.push(...feeRecords);
    
    if (allFeeRecords.length % 100 === 0) {
      console.log(`Generated ${allFeeRecords.length} fee records so far...`);
    }
  }
  
  return allFeeRecords;
}

// Main function to insert fee records into database
async function insertFeeRecords() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the model (create table if it doesn't exist)
    await Fees.sync({ force: false });
    console.log('Fees table synced.');

    // Get all athletes from the database
    const athletes = await Athletes.findAll({
      attributes: ['id'],
      limit: 100 // Adjust limit as needed
    });

    if (athletes.length === 0) {
      console.log('No athletes found. Please generate athletes first.');
      return;
    }

    console.log(`Found ${athletes.length} athletes. Generating fee records...`);
    
    // Generate fee records
    const feeRecords = await generateMultipleFeeRecords(athletes);
    
    console.log(`Generated ${feeRecords.length} fee records. Inserting into database...`);

    // Insert records in batches to avoid overwhelming the database
    const batchSize = 50;
    let insertedCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < feeRecords.length; i += batchSize) {
      const batch = feeRecords.slice(i, i + batchSize);
      try {
        await Fees.bulkCreate(batch);
        insertedCount += batch.length;
        console.log(`Inserted ${insertedCount}/${feeRecords.length} records...`);
      } catch (batchError) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
        failedCount += batch.length;
      }
    }

    console.log(`\nFee records insertion completed!`);
    console.log(`Successfully inserted: ${insertedCount} records`);
    console.log(`Failed to insert: ${failedCount} records`);
    console.log(`Total processed: ${feeRecords.length} records`);
    
    // Generate and display statistics
    await generateFeeStatistics();

  } catch (error) {
    console.error('Error inserting fee records:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Function to generate fee statistics
async function generateFeeStatistics() {
  try {
    console.log('\n=== Fee Statistics ===');
    
    // Total statistics
    const totalFees = await Fees.count();
    const totalAmount = await Fees.sum('total');
    const totalReceived = await Fees.sum('received');
    const totalRemained = await Fees.sum('remained');
    
    console.log(`Total Fees: ${totalFees}`);
    console.log(`Total Amount: ${totalAmount ? totalAmount.toFixed(2) : 0}`);
    console.log(`Total Received: ${totalReceived ? totalReceived.toFixed(2) : 0}`);
    console.log(`Total Remaining: ${totalRemained ? totalRemained.toFixed(2) : 0}`);
    
    // Status statistics
    const paidFees = await Fees.count({ where: { remained: 0 } });
    const partialFees = await Fees.count({ 
      where: { 
        received: { [sequelize.Op.gt]: 0 },
        remained: { [sequelize.Op.gt]: 0 }
      }
    });
    const unpaidFees = await Fees.count({ where: { received: 0 } });
    
    console.log(`\nFee Status:`);
    console.log(`Paid: ${paidFees} (${((paidFees/totalFees)*100).toFixed(1)}%)`);
    console.log(`Partial: ${partialFees} (${((partialFees/totalFees)*100).toFixed(1)}%)`);
    console.log(`Unpaid: ${unpaidFees} (${((unpaidFees/totalFees)*100).toFixed(1)}%)`);
    
    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentFees = await Fees.findAll({
      where: {
        createdAt: { [sequelize.Op.gte]: sixMonthsAgo }
      },
      order: [['createdAt', 'ASC']]
    });
    
    // Group by month
    const monthlyStats = {};
    recentFees.forEach(fee => {
      const monthYear = fee.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = { count: 0, amount: 0, received: 0 };
      }
      monthlyStats[monthYear].count++;
      monthlyStats[monthYear].amount += parseFloat(fee.total);
      monthlyStats[monthYear].received += parseFloat(fee.received);
    });
    
    console.log('\nLast 6 Months Statistics:');
    Object.keys(monthlyStats).sort().forEach(month => {
      const stats = monthlyStats[month];
      console.log(`${month}: ${stats.count} fees, Total: ${stats.amount.toFixed(2)}, Received: ${stats.received.toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('Error generating statistics:', error);
  }
}

async function deleteAllFeeRecords() {
  try {
    await sequelize.authenticate();
    const deletedCount = await Fees.destroy({
      where: {},
      truncate: true
    });
    console.log(`Deleted ${deletedCount} fee records.`);
  } catch (error) {
    console.error('Error deleting fee records:', error);
  } finally {
    await sequelize.close();
  }
}

// Function to generate and display sample fee records (without inserting)
function generateSampleFeeRecords(count = 3) {
  console.log(`\nSample Fee Records (${count} records):\n`);
  
  for (let i = 1; i <= count; i++) {
    const athleteId = 1; // Sample athlete ID
    const fee = generateFeeRecord(athleteId);
    
    console.log(`Record ${i}:`);
    console.log(`  Athlete ID: ${fee.athleteId}`);
    console.log(`  Period: ${fee.startDate} to ${fee.endDate}`);
    console.log(`  Fee Type: ${fee.feeType}`);
    console.log(`  Total: ${fee.total.toFixed(2)}`);
    console.log(`  Received: ${fee.received.toFixed(2)}`);
    console.log(`  Remained: ${fee.remained.toFixed(2)}`);
    console.log(`  Status: ${fee.status}`);
    console.log('---');
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'generate':
    insertFeeRecords();
    break;
    
  case 'delete':
    deleteAllFeeRecords();
    break;
    
  case 'sample':
    // Just generate and display sample data without inserting
    const count = parseInt(args[1]) || 3;
    generateSampleFeeRecords(count);
    break;
    
  case 'stats':
    // Generate statistics only
    (async () => {
      await sequelize.authenticate();
      await generateFeeStatistics();
      await sequelize.close();
    })();
    break;
    
  default:
    console.log(`
Usage: node generateFeeRecords.js [command] [options]

Commands:
  generate           Generate and insert fee records for existing athletes
  delete             Delete all fee records
  sample [count]     Display sample fee data without inserting (default: 3)
  stats              Display fee statistics from database

Examples:
  node generateFeeRecords.js generate
  node generateFeeRecords.js delete
  node generateFeeRecords.js sample 5
  node generateFeeRecords.js stats

Note: Make sure you have athletes in the database before generating fees.
    `);
    process.exit(0);
}