# RP WorkSuite API

## 🏢 About the Company: RitualPlanner
**RitualPlanner** is a rapidly scaling platform dedicated to modernizing and managing the traditional workflow of priests, rituals, and spiritual event planning. As the core business expands—serving more priests, clients, and handling complex B2B subcontracting workflows—the internal operations of the company must scale alongside it. 

To support our growing team of engineers, support staff, and administrative personnel, we require robust, enterprise-grade internal tools.

## 💻 About the Project: RP WorkSuite

**RP WorkSuite API** is the official internal Human Resource Management System (HRMS) and Employee Portal backend for RitualPlanner. 

While the core RitualPlanner product focuses entirely on our external users (Priests, Clients, and Temples), the **WorkSuite** focuses entirely on the internal health and management of our own company. As we hire more remote developers, customer support agents, and marketing staff, manual tracking of employee data through spreadsheets is no longer viable. 

To ensure absolute data security, strict regulatory compliance, and zero cross-contamination with client data, this project runs on a completely isolated database architecture (`rp_worksuite`).

### 🎯 Project Vision & Goals
The primary goal of the RP WorkSuite is to automate the daily administrative overhead for the HR and Management teams. By providing a centralized, API-driven hub, we aim to:
1. **Eliminate Data Silos:** Bring all employee documents, emergency contacts, and payroll data into a single source of truth.
2. **Automate Compliance:** Accurately track work hours, timezones, and paid time off (PTO) to ensure labor compliance for both local and remote employees.
3. **Streamline Communication:** Provide a unified bulletin board where company-wide announcements and policy changes can be distributed instantly.

### 🚀 Detailed Core Modules

#### 1. Employee Directory & Lifecycle Management
This module acts as the digital filing cabinet for the company.
- **Onboarding/Offboarding:** Secure endpoints to provision new employee accounts and instantly revoke access (via Google SSO integrations) when an employee departs.
- **Document Vault:** Secure storage for highly sensitive documents such as government ID proofs, non-disclosure agreements (NDAs), and signed employment contracts.
- **Organizational Hierarchy:** Deep relational mapping between employees and their department managers to automatically route requests up the chain of command.

#### 2. Advanced Attendance Tracking
Built for a modern, hybrid workforce, this module ensures accurate timekeeping.
- **Timezone-Aware Clocking:** Employees can clock in and out from anywhere in the world. The backend standardizes all timestamps in UTC while serving localized times to managers.
- **Geolocation & IP Restriction:** (Optional) Security layers to ensure employees are clocking in from authorized office networks or approved remote locations.
- **Timesheet Generation:** Automated weekly and monthly aggregation of total hours worked to seamlessly feed into payroll systems.

#### 3. Automated Leave Management (PTO & Sick Leave)
A complex state-machine module that completely automates time-off requests.
- **Accrual Engine:** Automatically calculates and grants new leave days to employees based on their tenure and company policy.
- **Hierarchical Approval Workflows:** When an employee requests time off, the request enters a `PENDING` state and is routed directly to their designated Manager. Managers can approve or reject the request, triggering automated email notifications.
- **Balance Tracking:** Real-time ledgers showing exactly how many sick days and vacation days an employee has remaining.

#### 4. Strict Role-Based Access Control (RBAC) & Audit Logging
Because an HRMS contains salaries and sensitive personal data, security is the highest priority. The system utilizes multi-tier role separation:
- **`EMPLOYEE`:** Can only view their own profile, submit their own leaves, and clock their own time.
- **`MANAGER`:** Elevated privileges to view profiles and approve leaves *only* for their direct subordinates.
- **`HR_ADMIN`:** Administrative control to manage company-wide announcements, adjust leave balances, and onboard new hires.
- **`SUPER_ADMIN`:** Full system access restricted to founders and executives, capable of viewing financial data and global settings.
- **Audit Trails:** Every single action (e.g., an HR admin changing a leave balance, or a manager rejecting a request) is permanently recorded in an immutable `audit_logs` table for compliance and dispute resolution.

---
*This project is internal and proprietary to RitualPlanner.*
