import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import Toolbar from '../components/toolbar';
import ContactsTable from '../components/contacts';
import Pagination from '../components/pagination';
import '../styles/totalcontacts.css';

const TotalContacts = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ email: '', addedDate: '', designation: '' });
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = () => {
    setSelectedContactIds([]);
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // Simulate async operation completion
  };

  const handleSelectContacts = (ids) => {
    setSelectedContactIds(ids);
  };

  const resetFilters = () => {
    setFilters({ email: '', addedDate: '', designation: '' });
    setSelectedContactIds([]);
    setPage(1);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className={`main-content ${loading ? 'loading' : ''}`}>
        {error && <div className="error-overlay">{error}</div>}
        <Header setFilters={setFilters} />
        <Toolbar
          setFilters={setFilters}
          selectedContactIds={selectedContactIds}
          onDelete={handleDelete}
          resetFilters={resetFilters} // Pass reset function to Toolbar
        />
        <div className="table-container">
          <ContactsTable
            onDelete={handleDelete}
            page={page}
            setTotalPages={setTotalPages}
            filters={filters}
            onSelectContacts={handleSelectContacts}
            setError={setError} // Pass setError to ContactsTable
          />
        </div>
        <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          isLoading={loading} // Merged your change here
        />
      </div>
    </div>
  );
};

export default TotalContacts;