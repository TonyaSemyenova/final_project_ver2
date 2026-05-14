import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ImageSearch({ onResults, onError, setLoading, sid }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      onError('Выберите изображение');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (sid) formData.append('sid', sid);

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/search/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onResults(response.data.results);
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-search">
      <form onSubmit={handleSubmit}>
        <div 
          className="dropzone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="preview" />
          ) : (
            <div className="dropzone-text">
              <p>Перетащите фото сюда</p>
              <p>или</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            Выбрать файл
          </label>
        </div>
        
        <button type="submit" className="search-btn">
          Найти похожую мебель
        </button>
      </form>
    </div>
  );
}

export default ImageSearch;
