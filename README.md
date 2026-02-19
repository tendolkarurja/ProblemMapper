# ProblemMapper

## A robust RESTful API built with the **MERN stack** (Node.js/Express/MongoDB) that allows citizens to report, upvote, and track local infrastructure issues using geospatial data.

### Features

* **Authentication & Authorization**: 
    * Secure **JWT-based** login and registration system.
    * Passwords hashed using **Bcrypt.js** before being stored in MongoDB.
    * Implementation of **Role-Based Access Control (RBAC)** to distinguish between citizens and administrators.
* **Geospatial Reporting**: 
    * Reports are stored with **GeoJSON coordinates**, allowing "problems near me" queries.
    * Uses MongoDB's `$nearSphere` for accurate location-based searching.
* **Upvote System**: 
    * A synchronized **toggle-based upvote system** to highlight urgent community issues.
    * Atomic updates using `$push`, `$pull`, and `$inc` to ensure data consistency.
    * Prevents duplicate votes by tracking user IDs in an `upvotedBy` array.
* **Status Tracking**: 
    * Administrative ability to update issue status through a defined lifecycle.
    * Supported statuses: `Reported`, `In Progress`, or `Resolved`.

---

### Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB Atlas
* **ODM**: Mongoose
* **Security**: Bcrypt.js (Hashing) and JSON Web Tokens (Authentication)

---

### API Endpoints

#### **User Authentication**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create a new user account. |
| **POST** | `/api/auth/login` | Authenticate user and return JWT + User ID. |

#### **Problem Management**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/problems` | Fetch all reported issues (sorted by newest) based on the filters passed as parameters|
| **POST** | `/api/problems` | Create a new report. Automatically assigns the logged-in user as the reporter. |
| **PATCH** | `/api/problems/upvote/:id` | Toggle an upvote on an issue. Users cannot upvote their own reports. |
| **PATCH** | `/api/problems/status/:id` | Update status to `Reported`, `In Progress`, or `Resolved`. |


### Set Up Instructions:
#### For backend: ####

* **Installations**: express, bcryptjs, jsonwebtoken, dotenv, mongoose
* **.env file**: Add the following in the .env file to be created in the backend folder:
  * PORT=<port_no>
  * MONGO_URI=<connection_string>
  * NODE_ENV=development
  * JWT_SECRET=<secret>
  * JWT_EXPIRES_IN=1h


