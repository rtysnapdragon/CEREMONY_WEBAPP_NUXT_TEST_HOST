# Server-Driven Request Architecture

## Principle

The frontend only tells the server **what data it wants**.

The backend is responsible for:

- Understanding the request payload
- Applying business rules
- Checking permissions
- Searching
- Filtering
- Sorting
- Pagination
- Database queries
- Calculations

The backend **only returns the requested data list**.

The frontend never performs business logic.

---

# Workflow

```text
Frontend
    │
    │ Request Payload
    ▼
Backend API
    │
    │ Validate
    │
    │ Study Payload
    │
    │ Apply Business Rules
    │
    │ Build Query
    │
    │ Query Database
    │
    │ Calculate
    ▼
Return Data List []
    │
    ▼
Frontend Render
```

---

# Frontend API config request

```json
{
  "search": "john",
  "page": 1,
  "records": 20,

  "sort": [
    {
      "field": "createdAt",
      "direction": "DESC"
    }
  ],

  "filter": {
    "status": "ACTIVE",
    "gender": "MALE"
  }
}

--Exmaple:
const apiConfig = { 
  list: url: '', method:'', filter: { status: 'ACTIVE', gender: 'MALE' }
}

<RTable :api="{ url: apiConfig.url, method: apiConfig.method, filter: apiConfig.filter }" />
or
<RTable :api="{ url: apiConfig.url" /> // method: 'GET', filter: {} by default
or
<RTable :api="{ url: apiConfig.url, method:'POST' }" /> // filter: {} by default
```

# Frontend Raw API Request payload

```json
{
  "search": "john",
  "pages": 1, // it is page number and also next/previous page
  "records": 100,
  "order_by": "", // can be "empNo", "firstName", "lastName", "workDept", "phoneNo", "hireDate", "job", "edLevel", "sex", "birthDate", "salary", "bonus", "comm" -> RTable do itself
  "order_dir": "asc", // can be "asc", "desc" -> RTable do itself
  "status": "ACTIVE",
  "gender": "MALE"
}
```

---

# Backend Responsibilities

The backend studies the payload.

Example:

```
search = "john"

↓

Search in

- first_name
- last_name
- email

↓

filter.status

↓

filter.gender

↓

sort.createdAt DESC

↓

page = 1

↓

records = 20

↓

Build SQL

↓

Execute SQL

↓

Calculate

↓

Return Result
```

The frontend never knows how this works.

---

# Example SQL

```sql
SELECT *
FROM users
WHERE
    status='ACTIVE'
AND gender='MALE'
AND (
    first_name LIKE '%john%'
    OR last_name LIKE '%john%'
    OR email LIKE '%john%'
)
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

---

# Backend Response

The server returns **only the data list**.

```json
[
  {
    "id": 1,
    "name": "John Smith",
    "gender": "MALE",
    "status": "ACTIVE"
  },
  {
    "id": 2,
    "name": "John Doe",
    "gender": "MALE",
    "status": "ACTIVE"
  }
]
```

No pagination object.

No total records.

No metadata.

Only an array (`[]`).

---

# Frontend

The frontend simply renders the returned array.

```
Receive []

↓

Loop Data

↓

Render Table

↓

Done
```

The frontend does **not**:

- Filter
- Search
- Sort
- Calculate
- Merge data
- Apply business rules

---

# Responsibility Separation

## Frontend

- Collect user input
- Build payload
- Send request
- Display returned list

## Backend

- Interpret payload
- Validate request
- Apply permissions
- Search
- Filter
- Sort
- Paginate internally
- Execute database query
- Perform calculations
- Return only the resulting list

---

# Design Philosophy

The frontend describes **what it wants**.

```text
Search = "john"

Status = ACTIVE

Gender = MALE

Sort = Created Date DESC

Page = 1

Records = 20
```

The backend decides **how to get it**.

The frontend never knows:

- SQL
- Database schema
- Search implementation
- Filter logic
- Calculation rules
- Permission rules

The only thing returned from the server is:

```json
[
    { ... },
    { ... },
    { ... }
]
```

The server owns all logic. The frontend is only responsible for presenting the returned data.



```json
Payload for /get

Your frontend sends:

{
    "pages": 1,
    "records": 20,
    "search": "",
    "order_by": "empNo",
    "order_dir": "asc",
    "status": "ACTIVE",
    "gender": "MALE"
}

or with filters:

{
  "pages": 1,
  "records": 20,
  "search": "john",
  "order_by": "firstName",
  "order_dir": "desc",
  "workDept": "A00",
  "job": "MANAGER"
}


Response list data
[
  {
    "empNo": "000001",
    "firstName": "John",
    "firstNameEn": "John",
    "lastName": "Doe",
    "lastNameEn": "Doe",
    "midInit": "D",
    "workDept": "HR",
    "phoneNo": "1234567890",
    "hireDate": "2022-01-01",
    "job": "Manager",
    "edLevel": 16,
    "sex": "M",
    "birthDate": "1990-01-01",
    "salary": 50000,
    "bonus": 5000,
    "comm": 500
  },
  {
    "empNo": "000002",
    "firstName": "Jane",
    "firstNameEn": "Jane",
    "lastName": "Smith",
    "lastNameEn": "Smith",
    "midInit": "S",
    "workDept": "IT",
    "phoneNo": "1234567891",
    "hireDate": "2022-02-01",
    "job": "Developer",
    "edLevel": 18,
    "sex": "F",
    "birthDate": "1992-02-02",
    "salary": 60000,
    "bonus": 6000,
    "comm": 600
  }
]
```