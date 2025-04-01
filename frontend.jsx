import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Auth Functions
  const login = async (username, password) => {
    const res = await axios.post('http://localhost:8000/api/auth/', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // File Functions
  const fetchFiles = async () => {
    const res = await axios.get('http://localhost:8000/api/files/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFiles(res.data);
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    await axios.post('http://localhost:8000/api/files/', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    fetchFiles();
  };

  const deleteFile = async (id) => {
    await axios.delete(`http://localhost:8000/api/files/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchFiles();
  };

  useEffect(() => { if (user) fetchFiles(); }, [user]);

  return (
    <div>
      {!user ? (
        <div>
          <h2>Login</h2>
          <form onSubmit={e => {
            e.preventDefault();
            login(e.target.username.value, e.target.password.value);
          }}>
            <input name="username" placeholder="Username" />
            <input name="password" type="password" placeholder="Password" />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Welcome {user.username}</h2>
          <button onClick={logout}>Logout</button>
          
          <h3>Upload File</h3>
          <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
          <button onClick={uploadFile}>Upload</button>
          
          <h3>Your Files</h3>
          <ul>
            {files.map(file => (
              <li key={file.id}>
                {file.file.split('/').pop()} - {file.file_type}
                <button onClick={() => deleteFile(file.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;