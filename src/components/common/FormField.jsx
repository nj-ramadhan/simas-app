export default function FormField({ field, value, onChange }) {
  const { key, label, type, required, options } = field;

  if (type === 'select') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <select
          value={value || ''}
          required={required}
          onChange={(e) => onChange(key, e.target.value)}
          className="w-full border rounded p-2"
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
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type || 'text'}
        value={value || ''}
        required={required}
        onChange={(e) => onChange(key, e.target.value)}
        className="w-full border rounded p-2"
      />
    </div>
  );
}
