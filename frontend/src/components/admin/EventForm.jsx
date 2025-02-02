import React, { useState, useEffect } from 'react';

const EventForm = ({ initialValues, onSubmit }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    if (initialValues) {
      setEventData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(eventData).every((val) => val)) {
      onSubmit(eventData); // Submit the form only if all fields are filled
    } else {
      alert("Please fill all the fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        value={eventData.title}
        onChange={handleChange}
        className="block w-full px-3 py-2 mb-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary focus:ring-1"
      />
      <textarea
        name="description"
        placeholder="Event Description"
        value={eventData.description}
        onChange={handleChange}
        className="block w-full px-3 py-2 mb-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary focus:ring-1"
      />
      <input
        type="date"
        name="date"
        value={eventData.date}
        onChange={handleChange}
        className="block w-full px-3 py-2 mb-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary focus:ring-1"
      />
      <input
        type="time"
        name="time"
        value={eventData.time}
        onChange={handleChange}
        className="block w-full px-3 py-2 mb-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary focus:ring-1"
      />
      <input
        type="text"
        name="location"
        placeholder="Event Location"
        value={eventData.location}
        onChange={handleChange}
        className="block w-full px-3 py-2 mb-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary focus:ring-1"
      />
      <button type="submit" className="btn btn-primary">
        Save Event
      </button>
    </form>
  );
};

export default EventForm;
