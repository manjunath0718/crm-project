# CanovaCRM - MERN Stack CRM System

## Overview
CanovaCRM is a full-featured Customer Relationship Management (CRM) system built with the MERN stack (MongoDB, Express, React, Node.js). It provides a modern, responsive interface for both administrators and employees to manage leads, employees, and sales activities efficiently.

---

## Features
- **Admin Dashboard**: View stats, analytics, recent activity, and active employees.
- **Employee Management**: Add, edit, delete, and view employees. Fairly distribute leads when an employee is deleted.
- **Lead Management**: Upload leads via CSV, assign leads based on language/location, and track lead status.
- **Fair Lead Distribution**: When an employee is deleted, their unclosed leads are automatically and fairly distributed among remaining employees.
- **Authentication**: Separate login for admin and employees, with protected routes and auto-logout for inactivity.
- **Responsive Design**: Mobile-friendly UI for both admin and employee interfaces.
- **Activity Logging**: Track assignments and deal closures.

---

## Technology Stack
- **Frontend**: React, React Router, Material-UI, CSS Modules
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Other**: Multer (file uploads), csv-parser (CSV parsing)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd june25
```

### 2. Install Dependencies
#### Backend
```bash
cd server
npm install
```
#### Frontend
```bash
cd ../client
npm install
```

### 3. Start the Application
#### Start Backend
```bash
cd server
npm start
```
#### Start Frontend
```bash
cd ../client
npm start
```

### 4. Access the App
- Admin: [http://localhost:5173/](http://localhost:5173/)
- Employee: [http://localhost:5173/employee/login](http://localhost:5173/employee/login)

---

## Key Business Logic

### Fair Lead Distribution (When Deleting an Employee)
- **Unclosed Leads**: Calculated as `assignedLeads - closedLeads` for the deleted employee.
- **Distribution Rules**:
  1. If unclosed leads = number of remaining employees, assign one to each.
  2. If unclosed leads < number of employees, assign to those with the fewest leads.
  3. If unclosed leads > number of employees, distribute in round-robin starting with least loaded employees.
- **Result**: Ensures balanced workload and fairness.

### CSV Upload & Lead Assignment
- Upload leads with fields: Name, Email, Phone, Language, Location, etc.
- Leads are assigned to employees based on language/location match and current workload.
- Unassigned leads are distributed fairly using the same logic as above.

---

## Project Structure
```
june25/
  client/   # React frontend
  server/   # Node.js/Express backend
```

---

## Additional Notes
- Make sure MongoDB is running locally or update the connection string in `server/index.js`.
- All passwords are stored in plain text for demo purposes—**do not use in production**.
- For any issues, check the console logs in both client and server.

---

## License
This project is for educational and demonstration purposes. 