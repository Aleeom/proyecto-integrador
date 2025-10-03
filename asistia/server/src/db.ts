import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  connectionString: process.env.DATABASE_URL,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const pool = new sql.ConnectionPool(config.connectionString)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
  });
