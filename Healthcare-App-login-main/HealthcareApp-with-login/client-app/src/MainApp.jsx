import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useEffect, useState } from "react";

// Accept user data and logout function as props
function MainApp({ user, onLogout }) { 
    
    // State to store fetched prescription data
    const [prescriptions, setPrescriptions] = useState([]);
    // State for user messages (success/error)
    const [message, setMessage] = useState(null);
    
    // States for form inputs (Prescription fields)
    const [patientName, setPatientName] = useState("");
    const [drugName, setDrugName] = useState("");
    const [dosage, setDosage] = useState("");

    // States for Appointment data
    const [appointments, setAppointments] = useState([]);
    const [appointmentMessage, setAppointmentMessage] = useState(null);

    // States for form inputs (Appointment fields)
    const [apptPatientName, setApptPatientName] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [reason, setReason] = useState("");
    const [editingAppointmentId, setEditingAppointmentId] = useState(null); // To track which appointment is being edited

    // Load all prescriptions on component mount
    useEffect(() => {
        loadPrescriptions();
        loadAppointments();
    }, []);

    // Function to fetch all prescriptions from the server
    const loadPrescriptions = () => {
        // Calls the GET API on the Node.js server
        axios.get("http://localhost:7000/api/viewAll") 
            .then((res) => setPrescriptions(res.data))
            .catch((err) => console.log(err));
    };

    // Function to add a new prescription (POST API)
    const addPrescription = (event) => {
        event.preventDefault();
        // Calls the POST API on the Node.js server
        axios.post("http://localhost:7000/api/addNew", { 
            patientName: patientName,
            drugName: drugName,
            dosage: dosage
        })
        .then((res) => {
            setMessage(res.data.status);
            loadPrescriptions(); // Refresh the table
            // Clear form fields
            setPatientName('');
            setDrugName('');
            setDosage('');
        });
    };

    // Function to delete a prescription by its MongoDB ID
    const deletePrescription = (id) => {
        // Calls the POST API on the Node.js server
        axios.post("http://localhost:7000/api/deleteUser", { id })
            .then((res) => {
                setMessage(res.data.status);
                loadPrescriptions(); // Refresh the table
            })
            .catch((err) => console.log(err));
    };

    // Function to fetch all appointments
    const loadAppointments = () => {
        axios.get("http://localhost:7000/api/appointments")
            .then((res) => setAppointments(res.data))
            .catch((err) => console.log(err));
    };

    // Function to handle form submission for appointments (Create or Update)
    const handleAppointmentSubmit = (event) => {
        event.preventDefault();
        if (editingAppointmentId) {
            // Update existing appointment
            axios.post("http://localhost:7000/api/appointments/update", {
                id: editingAppointmentId,
                patientName: apptPatientName,
                doctorName,
                appointmentDate,
                reason
            }).then((res) => {
                setAppointmentMessage(res.data.status);
                loadAppointments();
                cancelEdit(); // Reset form
            });
        } else {
            // Add new appointment
            axios.post("http://localhost:7000/api/appointments/new", {
                patientName: apptPatientName,
                doctorName,
                appointmentDate,
                reason
            }).then((res) => {
                setAppointmentMessage(res.data.status);
                loadAppointments(); // Refresh the appointments table
                cancelEdit(); // Reset form
            });
        }
    };

    // Function to delete an appointment
    const deleteAppointment = (id) => {
        axios.post("http://localhost:7000/api/deleteAppointment", { id })
            .then((res) => {
                setAppointmentMessage(res.data.status);
                loadAppointments(); // Refresh the table
            });
    };

    // Function to start editing an appointment
    const startEdit = (appt) => {
        setEditingAppointmentId(appt._id);
        setApptPatientName(appt.patientName);
        setDoctorName(appt.doctorName);
        // Format date for the datetime-local input
        const localDate = new Date(appt.appointmentDate);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
        setAppointmentDate(localDate.toISOString().slice(0, 16));
        setReason(appt.reason);
    };

    // Function to cancel editing and clear the form
    const cancelEdit = () => {
        setEditingAppointmentId(null);
        setApptPatientName('');
        setDoctorName('');
        setAppointmentDate('');
        setReason('');
    };

    return (
        <div className="container p-3 mt-4">
            <button className="btn btn-warning float-end" onClick={onLogout}>
                Logout ({user.username})
            </button>
            <div className="p-3 card bg-light text-center w-75 mx-auto">
                <h1 className="mb-4">Healthcare Prescription and Pharmacy App</h1>
                
                {/* --- Prescription Section --- */}
                <hr className="my-4"/>
                <h3 className="mb-3">Add New Prescription</h3>
                <div className="p-5">
                    <form onSubmit={addPrescription}>
                        {/* Input for Patient Name */}
                        <input
                            placeholder="Patient Name"
                            value={patientName}
                            className="form-control mb-3"
                            required
                            onChange={(e) => setPatientName(e.target.value)}
                        />
                        {/* Input for Drug Name */}
                        <input
                            placeholder="Drug Name"
                            value={drugName}
                            className="form-control mb-3"
                            required
                            onChange={(e) => setDrugName(e.target.value)}
                        />
                        {/* Input for Dosage */}
                        <input
                            placeholder="Dosage (e.g., 5mg, 1 tablet)"
                            value={dosage}
                            className="form-control mb-3"
                            required
                            onChange={(e) => setDosage(e.target.value)}
                        />
                        <button className="btn btn-primary btn-lg">Add Prescription</button>
                    </form>
                    <div className="text-success mt-4 fs-4">
                        {message && <span>{message}</span>}
                    </div>
                    <div className="mt-5">
                        <h3 className="mb-3">View All Prescriptions</h3>
                        <table className="table table-bordered table-stripped">
                            <thead>
                                <tr className="bg-light">
                                    <th>ID</th>
                                    <th>Patient Name</th>
                                    <th>Drug Name</th>
                                    <th>Dosage</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!prescriptions || prescriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" align="center">No Prescriptions Yet</td>
                                    </tr>
                                ) : (
                                    prescriptions.map((prescription, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{prescription.patientName}</td>
                                            <td>{prescription.drugName}</td>
                                            <td>{prescription.dosage}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => deletePrescription(prescription._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Appointment Section --- */}
                <hr className="my-4"/>
                <h3 className="mb-3">Book New Appointment</h3>
                <div className="p-5">
                    <form onSubmit={handleAppointmentSubmit}>
                        <input
                            placeholder="Patient Name"
                            value={apptPatientName}
                            className="form-control mb-3"
                            required
                            onChange={(e) => setApptPatientName(e.target.value)}
                        />
                        <input
                            placeholder="Doctor Name"
                            value={doctorName}
                            className="form-control mb-3"
                            required
                            onChange={(e) => setDoctorName(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            value={appointmentDate}
                            className="form-control mb-3"
                            required
                            onChange={(e) => setAppointmentDate(e.target.value)}
                        />
                        <textarea
                            placeholder="Reason for Appointment"
                            value={reason}
                            className="form-control mb-3"
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <button className="btn btn-success btn-lg">
                            {editingAppointmentId ? 'Update Appointment' : 'Book Appointment'}
                        </button>
                        {editingAppointmentId && (
                            <button type="button" className="btn btn-secondary btn-lg ms-2" onClick={cancelEdit}>Cancel</button>
                        )}
                    </form>
                    <div className="text-success mt-4 fs-4">
                        {appointmentMessage && <span>{appointmentMessage}</span>}
                    </div>
                    <div className="mt-5">
                        <h3 className="mb-3">Scheduled Appointments</h3>
                        <table className="table table-bordered table-stripped">
                            <thead>
                                <tr className="bg-light">
                                    <th>Patient Name</th>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Reason</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!appointments || appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" align="center">No Appointments Scheduled</td>
                                    </tr>
                                ) : (
                                    appointments.map((appt) => (
                                        <tr key={appt._id}>
                                            <td>{appt.patientName}</td>
                                            <td>{appt.doctorName}</td>
                                            <td>{new Date(appt.appointmentDate).toLocaleString()}</td>
                                            <td>{appt.reason}</td>
                                            <td>
                                                <button
                                                    className="btn btn-info me-2"
                                                    onClick={() => startEdit(appt)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => deleteAppointment(appt._id)}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr className="my-4"/>
            </div>
        </div>
    );
}

export default MainApp;