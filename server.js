const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: 'Preetha@2905', // replace with your MySQL password
  database: 'job_management', // replace with your database name
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Serve an HTML form for job management
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Management</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table { width: 80%; margin: 20px auto; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1 style="text-align:center;">Job Management</h1>
        <form id="jobForm" style="text-align:center;">
            <input type="text" id="name" placeholder="Job Name" required />
            <input type="text" id="status" placeholder="Status" required />
            <input type="date" id="startDate" required />
            <input type="date" id="endDate" required />
            <button type="submit">Add Job</button>
        </form>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="jobTableBody"></tbody>
        </table>
        <script>
            const form = document.getElementById('jobForm');
            const jobTableBody = document.getElementById('jobTableBody');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const status = document.getElementById('status').value;
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;

                const response = await fetch('http://localhost:5000/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, status, startDate, endDate }),
                });

                if (response.ok) {
                    fetchJobs(); // Refresh the jobs table
                    form.reset(); // Reset the form fields
                } else {
                    console.error('Failed to add job:', await response.text());
                }
            });

            async function fetchJobs() {
                const response = await fetch('http://localhost:5000/jobs');
                const jobs = await response.json();
                jobTableBody.innerHTML = '';
                jobs.forEach(job => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${job.id}</td>
                        <td>\${job.name}</td>
                        <td>\${job.status}</td>
                        <td>\${job.startDate}</td>
                        <td>\${job.endDate}</td>
                        <td>
                            <button onclick="editJob(\${job.id}, '\${job.name}', '\${job.status}', '\${job.startDate}', '\${job.endDate}')">Edit</button>
                            <button onclick="deleteJob(\${job.id})">Delete</button>
                        </td>
                    \`;
                    jobTableBody.appendChild(row);
                });
            }

            async function deleteJob(id) {
                const response = await fetch('http://localhost:5000/jobs/' + id, { method: 'DELETE' });
                if (response.ok) {
                    fetchJobs(); // Refresh the jobs table
                } else {
                    console.error('Failed to delete job:', await response.text());
                }
            }

            function editJob(id, name, status, startDate, endDate) {
                document.getElementById('name').value = name;
                document.getElementById('status').value = status;
                document.getElementById('startDate').value = startDate;
                document.getElementById('endDate').value = endDate;
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const response = await fetch('http://localhost:5000/jobs/' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, status, startDate, endDate }),
                    });
                    if (response.ok) {
                        fetchJobs(); // Refresh the jobs table
                        form.reset(); // Reset the form fields
                    } else {
                        console.error('Failed to update job:', await response.text());
                    }
                };
            }

            fetchJobs(); // Initial fetch to display jobs
        </script>
    </body>
    </html>
  `);
});

// Get all jobs
app.get('/jobs', (req, res) => {
  connection.query('SELECT * FROM jobs', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new job
app.post('/jobs', (req, res) => {
  const { name, status, startDate, endDate } = req.body;
  connection.query('INSERT INTO jobs (name, status, startDate, endDate) VALUES (?, ?, ?, ?)', [name, status, startDate, endDate], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, name, status, startDate, endDate });
  });
});

// Update a job
app.put('/jobs/:id', (req, res) => {
  const { id } = req.params;
  const { name, status, startDate, endDate } = req.body;
  connection.query('UPDATE jobs SET name = ?, status = ?, startDate = ?, endDate = ? WHERE id = ?', [name, status, startDate, endDate, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

// Delete a job
app.delete('/jobs/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM jobs WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
