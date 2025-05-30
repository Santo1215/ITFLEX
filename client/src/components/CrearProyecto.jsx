import { useState, useEffect } from "react";
import "../assets/styles//CrearProyecto.css";
import {BotonCancelar} from "./BotonGuardar";
import { API_URL,getUserId } from '../constants';

export default function CrearProyecto({ onProyectoCreado }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [formattedBudget, setFormattedBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const userId = getUserId();
  // Función para formatear el valor como moneda
  const formatCurrency = (value) => {
    if (!value) return "";
    
    // Eliminar todos los caracteres que no sean dígitos o punto decimal
    const onlyNumbers = value.replace(/[^0-9.]/g, "");
    
    // Separar parte entera y decimal
    const parts = onlyNumbers.split(".");
    let integerPart = parts[0] || "0";
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : "";
    
    // Agregar separadores de miles
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    return integerPart + decimalPart;
  };

  // Función para convertir el valor formateado a número
  const parseCurrency = (formattedValue) => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(/,/g, ""));
  };

  // Manejar cambios en el campo de presupuesto
  const handleBudgetChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = formatCurrency(inputValue);
    setFormattedBudget(formattedValue);
    setBudget(parseCurrency(formattedValue).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoProyecto = {
      title,
      description,
      budget: parseFloat(budget),
      deadline,
      usuario_id: parseInt(userId)
    };

    try {
      const response = await fetch(`${API_URL}/api/proyectos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoProyecto),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Proyecto creado con éxito!");
        setTitle("");
        setDescription("");
        setBudget("");
        setFormattedBudget("");
        setDeadline("");
        if (onProyectoCreado) onProyectoCreado(data);
        window.location.href = "/Home";
      } else {
        alert("Error al crear el proyecto");
      }
    } catch (error) {
      alert("Error de conexión al crear el proyecto");
    }
  };

  return (
    <div className="crear-proyecto-container">
      <form onSubmit={handleSubmit} className="crear-proyecto-form">
        <h2 className="crear-proyecto-title">Crear nuevo proyecto</h2>

        <div className="input-group">
          <label className="input-label">Agregar título del proyecto</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Agregar valor a pagar del proyecto</label>
          <input
            type="text" // Cambiado a text para permitir comas
            value={formattedBudget}
            onChange={handleBudgetChange}
            required
            className="input-field"
            inputMode="numeric"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Agregar descripción del proyecto</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="input-field textarea-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Agregar tiempo máximo de espera por el proyecto</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Agregar archivos</label>
          <input
            type="file"
            className="input-field"
          />
        </div>

        <div className="button-group">
          <a style={{ textDecoration: 'none' }} href="/Home"><BotonCancelar/></a>
          <button type="submit" className="button submit-button">
            Publicar
          </button>
        </div>
      </form>
    </div>
  );
}