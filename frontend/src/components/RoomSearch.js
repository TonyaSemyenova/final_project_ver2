import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function RoomSearch({ onResults, onError, setLoading, sid }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [types, setTypes] = useState([]);
  const [params, setParams] = useState({
    type: '',
    min_price: '', max_price: '',
    min_width: '', max_width: '',
    min_length: '', max_length: '',
    min_height: '', max_height: ''
  });

  useEffect(() => {
    axios.get(API_URL + '/api/furniture/types')
      .then(r => setTypes(r.data.types))
      .catch(() => {});
  }, []);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => setParams({ ...params, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { onError('Выберите фото комнаты'); return; }
    if (!params.type) { onError('Укажите тип мебели'); return; }

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (sid) formData.append('sid', sid);
    Object.entries(params).forEach(([k, v]) => { if (v) formData.append(k, v); });

    setLoading(true);
    try {
      const response = await axios.post(API_URL + '/api/search/room', formData);
      onResults(response.data.results, response.data.room_analysis);
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-search">
      <form onSubmit={handleSubmit} className="room-search-form">

        {/* Левая колонка — фото */}
        <div className="room-photo-col">
          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('room-file-input').click()}
            style={{ cursor: 'pointer' }}
          >
            {preview ? (
              <img src={preview} alt="Превью" className="preview" />
            ) : (
              <div className="dropzone-text">
                <p>Фото комнаты</p>
                <p>Перетащите сюда или нажмите для выбора</p>
              </div>
            )}
          </div>
          <input
            id="room-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Правая колонка — параметры */}
        <div className="room-params-col">

          <div className="form-group">
            <label>Тип мебели *</label>
            <select name="type" value={params.type} onChange={handleChange} required>
              <option value="">Выберите...</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Цена (руб)</label>
            <div className="range-row">
              <input type="number" name="min_price" value={params.min_price} onChange={handleChange} placeholder="от" />
              <span className="range-sep">—</span>
              <input type="number" name="max_price" value={params.max_price} onChange={handleChange} placeholder="до" />
            </div>
          </div>

          <div className="form-group">
            <label>Ширина (см)</label>
            <div className="range-row">
              <input type="number" name="min_width" value={params.min_width} onChange={handleChange} placeholder="от" />
              <span className="range-sep">—</span>
              <input type="number" name="max_width" value={params.max_width} onChange={handleChange} placeholder="до" />
            </div>
          </div>

          <div className="form-group">
            <label>Длина (см)</label>
            <div className="range-row">
              <input type="number" name="min_length" value={params.min_length} onChange={handleChange} placeholder="от" />
              <span className="range-sep">—</span>
              <input type="number" name="max_length" value={params.max_length} onChange={handleChange} placeholder="до" />
            </div>
          </div>

          <div className="form-group">
            <label>Высота (см)</label>
            <div className="range-row">
              <input type="number" name="min_height" value={params.min_height} onChange={handleChange} placeholder="от" />
              <span className="range-sep">—</span>
              <input type="number" name="max_height" value={params.max_height} onChange={handleChange} placeholder="до" />
            </div>
          </div>

          <button type="submit" className="search-btn">Подобрать</button>
        </div>

      </form>
    </div>
  );
}

export default RoomSearch;
