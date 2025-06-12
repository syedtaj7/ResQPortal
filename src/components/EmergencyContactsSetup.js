import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TranslatableText from './TranslatableText';


const EmergencyContactsSetup = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    relationship: '',
    address: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  // Load contacts from localStorage on component mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      }
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = (updatedContacts) => {
    try {
      localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      alert('Error saving contacts. Please try again.');
    }
  };

  // Add new contact
  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      alert('Please fill in at least name and email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContact.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const updatedContacts = [...contacts, { ...newContact, id: Date.now() }];
    saveContacts(updatedContacts);
    setNewContact({ name: '', email: '', relationship: '', address: '', notes: '' });
  };

  // Edit contact
  const editContact = (index) => {
    setNewContact(contacts[index]);
    setIsEditing(true);
    setEditingIndex(index);
  };

  // Update contact
  const updateContact = () => {
    if (!newContact.name || !newContact.email) {
      alert('Please fill in at least name and email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContact.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const updatedContacts = [...contacts];
    updatedContacts[editingIndex] = newContact;
    saveContacts(updatedContacts);
    setNewContact({ name: '', email: '', relationship: '', address: '', notes: '' });
    setIsEditing(false);
    setEditingIndex(-1);
  };

  // Delete contact
  const deleteContact = (index) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      saveContacts(updatedContacts);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setNewContact({ name: '', email: '', relationship: '', address: '', notes: '' });
    setIsEditing(false);
    setEditingIndex(-1);
  };







  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              <TranslatableText>Emergency Contacts Setup</TranslatableText>
            </h2>
            <p className="text-red-100">
              <TranslatableText>Configure emergency contacts for instant email alerts during voice emergencies</TranslatableText>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Add/Edit Contact Form */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isEditing ? (
                <TranslatableText>Edit Contact</TranslatableText>
              ) : (
                <TranslatableText>Add Emergency Contact</TranslatableText>
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TranslatableText>Name *</TranslatableText>
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TranslatableText>Email Address *</TranslatableText>
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TranslatableText>Relationship</TranslatableText>
                </label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Emergency Contact">Emergency Contact</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TranslatableText>Address</TranslatableText>
                </label>
                <input
                  type="text"
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Home/office address"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <TranslatableText>Notes</TranslatableText>
              </label>
              <textarea
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Additional information (medical conditions, special instructions, etc.)"
                rows="3"
              />
            </div>
            
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={updateContact}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <TranslatableText>Update Contact</TranslatableText>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <TranslatableText>Cancel</TranslatableText>
                  </button>
                </>
              ) : (
                <button
                  onClick={addContact}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <TranslatableText>Add Contact</TranslatableText>
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              <TranslatableText>Emergency Contacts ({contacts.length})</TranslatableText>
            </h3>
            
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">👥</div>
                <p><TranslatableText>No emergency contacts added yet</TranslatableText></p>
                <p className="text-sm"><TranslatableText>Add contacts above to enable emergency email notifications</TranslatableText></p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <motion.div
                    key={contact.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-white">{contact.name}</h4>
                        {contact.relationship && (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                            {contact.relationship}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>📧 {contact.email}</div>
                        {contact.address && <div>🏠 {contact.address}</div>}
                        {contact.notes && <div>📝 {contact.notes}</div>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => editContact(index)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        <TranslatableText>Edit</TranslatableText>
                      </button>
                      <button
                        onClick={() => deleteContact(index)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        <TranslatableText>Delete</TranslatableText>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>




        </div>

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default EmergencyContactsSetup;
