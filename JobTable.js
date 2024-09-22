import { useEffect, useState } from 'react';
import axios from 'axios';
import JobStatusWidgets from './JobStatusWidgets';
import './JobTable.css';

const JobTable = () => {
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState({ name: '', status: '', startDate: '', endDate: '' });
    const [editingId, setEditingId] = useState(null);
    const [jobIdToDelete, setJobIdToDelete] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const response = await axios.get('http://localhost:5000/jobs');
        setJobs(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await axios.put(`http://localhost:5000/jobs/${editingId}`, form);
        } else {
            await axios.post('http://localhost:5000/jobs', form);
        }
        fetchJobs();
        setForm({ name: '', status: '', startDate: '', endDate: '' });
        setEditingId(null);
    };

    const handleDelete = async () => {
        await axios.delete(`http://localhost:5000/jobs/${jobIdToDelete}`);
        fetchJobs();
        setJobIdToDelete(null);
    };

    return (
        <div>
            <h1>Job Management</h1>
            <JobStatusWidgets />
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Job Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input type="text" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required />
                <input type="date" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                <input type="date" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                <button type="submit">{editingId ? 'Update Job' : 'Add Job'}</button>
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
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.id}>
                            <td>{job.id}</td>
                            <td>{job.name}</td>
                            <td>{job.status}</td>
                            <td>{job.startDate}</td>
                            <td>{job.endDate}</td>
                            <td>
                                <button onClick={() => {
                                    setEditingId(job.id);
                                    setForm({ name: job.name, status: job.status, startDate: job.startDate, endDate: job.endDate });
                                }}>Edit</button>
                                <button onClick={() => setJobIdToDelete(job.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {jobIdToDelete && (
                <div>
                    <h2>Confirm Deletion</h2>
                    <p>Are you sure you want to delete this job?</p>
                    <button onClick={handleDelete}>Yes</button>
                    <button onClick={() => setJobIdToDelete(null)}>No</button>
                </div>
            )}
        </div>
    );
};

export default JobTable;
