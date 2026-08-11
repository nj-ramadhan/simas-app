export default function FormField({ field, value, onChange }) {
  const { key, label, type, required, options } = field;

  if (type === 'select') {
    return (
      <div className="form-field-wrap">
        <label className="form-label">{label}</label>
        <select
          value={value || ''}
          required={required}
          onChange={(e) => onChange(key, e.target.value)}
          className="form-control"
        >
          <option value="">-- Pilih --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="form-field-wrap">
      <label className="form-label">{label}</label>
      <input
        type={type || 'text'}
        value={value || ''}
        required={required}
        onChange={(e) => onChange(key, e.target.value)}
        className="form-control"
      />
    </div>
  );
}
