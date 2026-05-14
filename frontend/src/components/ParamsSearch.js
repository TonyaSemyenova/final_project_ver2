import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ParamsSearch({ onResults, onError, setLoading }) {
  const [params, setParams] = useState({
    type: '', min_price: '', max_price: '',
    width: '', length: '', height: '',
    style: '', materials: '', colors: '', brand: ''
  });
  const [types, setTypes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/furniture/types`).then(r => setTypes(r.data.types)).catch(() => {});
    axios.get(`${API_URL}/api/furniture/styles`).then(r => setStyles(r.data.styles)).catch(() => {});
    axios.get(`${API_URL}/api/furniture/colors`).then(r => setColors(r.data.colors)).catch(() => {});
    axios.get(`${API_URL}/api/furniture/materials`).then(r => setMaterials(r.data.materials)).catch(() => {});
  }, []);

  const handleChange = (e) => setParams({ ...params, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/search/params`, params);
      onResults(response.data.results);
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="params-search">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Тип мебели</label>
            <select name="type" value={params.type} onChange={handleChange}>
              <option value="">Любой</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Стиль</label>
            <select name="style" value={params.style} onChange={handleChange}>
              <option value="">Любой</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Цвет</label>
            <select name="colors" value={params.colors} onChange={handleChange}>
              <option value="">Любой</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Материал</label>
            <select name="materials" value={params.materials} onChange={handleChange}>
              <option value="">Любой</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Цена от (₽)</label>
            <input type="number" name="min_price" value={params.min_price} onChange={handleChange} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Цена до (₽)</label>
            <input type="number" name="max_price" value={params.max_price} onChange={handleChange} placeholder="100000" />
          </div>
          <div className="form-group">
            <label>Ширина до (см)</label>
            <input type="number" name="width" value={params.width} onChange={handleChange} placeholder="200" />
          </div>
          <div className="form-group">
            <label>Длина до (см)</label>
            <input type="number" name="length" value={params.length} onChange={handleChange} placeholder="200" />
          </div>
          <div className="form-group">
            <label>Высота до (см)</label>
            <input type="number" name="height" value={params.height} onChange={handleChange} placeholder="100" />
          </div>
          <div className="form-group">
            <label>Бренд</label>
            <input type="text" name="brand" value={params.brand} onChange={handleChange} placeholder="hoff, ikea..." />
          </div>
        </div>
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Для поиска обязательно введите минимум один признак
        </p>
        <button type="submit" className="search-btn">Найти</button>
      </form>
    </div>
  );
}

export default ParamsSearch;
